export function LeaderboardsPage({ data }: any) {
  const winners = new Map<string, number>();
  const losers = new Map<string, number>();

  for (const run of data.runs) {
    winners.set(run.selectedUserId, (winners.get(run.selectedUserId) ?? 0) + 1);
    for (const candidate of run.candidateUserIds) {
      if (candidate !== run.selectedUserId) {
        losers.set(candidate, (losers.get(candidate) ?? 0) + 1);
      }
    }
  }

  const winnerRows = [...winners.entries()]
    .map(([id, score]) => ({ user: data.users.find((u: any) => u.id === id), score }))
    .filter((x) => x.user)
    .sort((a, b) => b.score - a.score);

  const loserRows = [...losers.entries()]
    .map(([id, score]) => ({ user: data.users.find((u: any) => u.id === id), score }))
    .filter((x) => x.user)
    .sort((a, b) => b.score - a.score);

  return (
    <section>
      <h2>Leaderboards</h2>
      <div className="two-col">
        <div>
          <h3>🏆 Winners</h3>
          <ol>{winnerRows.map((row) => <li key={row.user.id}>{row.user.name}: {row.score}</li>)}</ol>
        </div>
        <div>
          <h3>😅 Losers (non-selected opportunities)</h3>
          <ol>{loserRows.map((row) => <li key={row.user.id}>{row.user.name}: {row.score}</li>)}</ol>
        </div>
      </div>
    </section>
  );
}
