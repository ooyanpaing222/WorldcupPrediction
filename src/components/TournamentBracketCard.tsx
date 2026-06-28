"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, SectionTitle } from "@/components/Cards";
import { TeamName } from "@/components/TeamName";

const bracketStages = ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"] as const;

type Fixture = { id: number; stage: string; kickoffTime: string; status: string; homeTeam: string; awayTeam: string; homeScore?: number | null; awayScore?: number | null; homeFlagEmoji?: string | null; awayFlagEmoji?: string | null };
type TournamentViewPayload = { knockoutFixtures: Fixture[] };

function stageLabel(stage: string) {
  const labels: Record<string, string> = { ROUND_OF_32: "Round of 32", ROUND_OF_16: "Round of 16", QUARTER_FINAL: "Quarter Final", SEMI_FINAL: "Semi Final", THIRD_PLACE: "Third Place Match", FINAL: "Final" };
  return labels[stage] ?? stage.replaceAll("_", " ");
}

function formatKickoff(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function TeamSlot({ name, flagEmoji, score }: { name: string; flagEmoji?: string | null; score?: number | null }) {
  return <div className="flex items-center gap-2 rounded-xl bg-white/70 px-2 py-1.5 text-sm font-bold text-slate-800"><TeamName name={name} flagEmoji={flagEmoji} flagClassName="h-5 w-5" nameClassName="truncate" className="min-w-0 flex-1" />{score !== null && score !== undefined ? <span className="font-black tabular-nums">{score}</span> : null}</div>;
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  return <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
    <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400"><span>{formatKickoff(fixture.kickoffTime)}</span><span>{fixture.status}</span></div>
    <div className="space-y-2"><TeamSlot name={fixture.homeTeam} flagEmoji={fixture.homeFlagEmoji} score={fixture.homeScore} /><TeamSlot name={fixture.awayTeam} flagEmoji={fixture.awayFlagEmoji} score={fixture.awayScore} /></div>
  </article>;
}

export function TournamentBracketCard() {
  const [data, setData] = useState<TournamentViewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/tournaments/view", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error ?? "Unable to load tournament bracket");
        return payload as TournamentViewPayload;
      })
      .then((payload) => { if (mounted) setData(payload); })
      .catch((caught) => { if (mounted) setError(caught instanceof Error ? caught.message : "Unable to load tournament bracket"); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const fixturesByStage = useMemo(() => {
    const grouped = new Map<string, Fixture[]>();
    for (const fixture of data?.knockoutFixtures ?? []) grouped.set(fixture.stage, [...(grouped.get(fixture.stage) ?? []), fixture]);
    return grouped;
  }, [data]);

  return <Card>
    <SectionTitle eyebrow="WC26 knockout" title="Tournament bracket" />
    <p className="mt-2 text-sm leading-6 text-slate-600">Follow each knockout-stage tie, including kickoff time, teams, flags, and results as they become available.</p>
    {error ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
    {isLoading ? <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">Loading bracket…</p> : null}
    {!isLoading && !error ? <div className="mt-4 overflow-x-auto pb-2">
      <div className="grid min-w-[52rem] grid-cols-6 gap-3 md:min-w-0">
        {bracketStages.map((stage) => {
          const fixtures = fixturesByStage.get(stage) ?? [];
          return <section key={stage} className="space-y-3">
            <h3 className="text-center text-xs font-black uppercase tracking-wide text-slate-500">{stageLabel(stage)}</h3>
            {fixtures.length ? fixtures.map((fixture) => <FixtureCard key={fixture.id} fixture={fixture} />) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold text-slate-400">Awaiting fixtures</div>}
          </section>;
        })}
      </div>
    </div> : null}
  </Card>;
}
