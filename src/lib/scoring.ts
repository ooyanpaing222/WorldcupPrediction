export type ScoreLine = {
  home: number;
  away: number;
};

export type MatchOutcome = "HOME" | "DRAW" | "AWAY";
export type MatchStage = "GROUP" | "ROUND_OF_32" | "ROUND_OF_16" | "QUARTER_FINAL" | "SEMI_FINAL" | "THIRD_PLACE" | "FINAL" | string;

function outcome(score: ScoreLine): MatchOutcome {
  if (score.home > score.away) return "HOME";
  if (score.away > score.home) return "AWAY";
  return "DRAW";
}

export function isKnockoutStage(stage?: MatchStage | null) {
  return Boolean(stage && stage !== "GROUP");
}

export function calculateMatchPoints(
  predicted: { outcome?: MatchOutcome | null; score?: ScoreLine | null },
  actual: ScoreLine,
  options?: { stage?: MatchStage | null; winnerScore?: ScoreLine | null }
) {
  const winnerScore = options?.winnerScore ?? actual;
  const actualOutcome = outcome(winnerScore);
  const correctOutcome = predicted.outcome === actualOutcome;
  const exactScore = predicted.score ? predicted.score.home === actual.home && predicted.score.away === actual.away : false;

  return {
    points: exactScore ? 3 : correctOutcome ? 2 : 0,
    exact: exactScore,
    correctOutcome
  };
}

export function calculateOutrightPoints(
  picks: { championTeamId: string; bestPlayerId: string; bestGkId: string },
  winners: { championTeamId: string; bestPlayerId: string; bestGkId: string }
) {
  return (
    (picks.championTeamId === winners.championTeamId ? 10 : 0) +
    (picks.bestPlayerId === winners.bestPlayerId ? 5 : 0) +
    (picks.bestGkId === winners.bestGkId ? 3 : 0)
  );
}
