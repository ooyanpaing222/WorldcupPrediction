import { AppShell } from "@/components/AppShell";
import { OutrightPicksCard } from "@/components/OutrightPicksCard";
import { TournamentBracketCard } from "@/components/TournamentBracketCard";
import { getServerTranslator } from "@/lib/serverI18n";

export default async function WinnersPage() {
  const t = await getServerTranslator();

  return (
    <AppShell title={t("winners.title")} eyebrow={t("winners.eyebrow")}>
      <TournamentBracketCard />
      <OutrightPicksCard canEdit />
    </AppShell>
  );
}
