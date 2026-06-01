import { MatchStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { mmtDayUtcRange } from "@/lib/timezone";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({ date: searchParams.get("date") ?? undefined });

    const dayRange = query.date ? mmtDayUtcRange(query.date) : null;

    const matches = await prisma.match.findMany({
      where: {
        status: MatchStatus.FINISHED,
        ...(dayRange ? { kickoffTime: { gte: dayRange.start, lt: dayRange.end } } : {})
      },
      orderBy: { kickoffTime: "desc" },
      take: 250,
      select: {
        id: true,
        kickoffTime: true,
        homeTeam: true,
        awayTeam: true,
        homeScore90: true,
        awayScore90: true,
        homeScore: true,
        awayScore: true
      }
    });

    return NextResponse.json({ matches });
  } catch (error) {
    return jsonError(error);
  }
}
