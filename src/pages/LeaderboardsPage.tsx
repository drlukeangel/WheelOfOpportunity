export function LeaderboardsPage({ data }: any) {
  const pickCount = new Map<string, number>();
  const queuedCount = new Map<string, number>();

  for (const run of data.runs) {
    pickCount.set(run.selectedUserId, (pickCount.get(run.selectedUserId) ?? 0) + 1);
    for (const candidate of run.candidateUserIds) {
      if (candidate !== run.selectedUserId) {
        queuedCount.set(candidate, (queuedCount.get(candidate) ?? 0) + 1);
      }
    }
  }

  const pickedRows = [...pickCount.entries()]
    .map(([id, score]) => ({ user: data.users.find((u: any) => u.id === id), score }))
    .filter((x) => x.user)
    .sort((a, b) => b.score - a.score);

  const queuedRows = [...queuedCount.entries()]
    .map(([id, score]) => ({ user: data.users.find((u: any) => u.id === id), score }))
    .filter((x) => x.user)
    .sort((a, b) => b.score - a.score);

  return (
    <section>
      <h2>History</h2>
      <p className="hint">Who's been picked, and who's been in the running.</p>
      <div className="two-col">
        <div>
          <h3>🎤 Times picked</h3>
          {pickedRows.length === 0 && <p className="hint">No spins yet.</p>}
          <ol>{pickedRows.map((row) => <li key={row.user.id}>{row.user.icon ?? "🙂"} {row.user.name}: {row.score}</li>)}</ol>
        </div>
        <div>
          <h3>⏳ Times in the running</h3>
          {queuedRows.length === 0 && <p className="hint">No spins yet.</p>}
          <ol>{queuedRows.map((row) => <li key={row.user.id}>{row.user.icon ?? "🙂"} {row.user.name}: {row.score}</li>)}</ol>
        </div>
      </div>
    </section>
  );
}
