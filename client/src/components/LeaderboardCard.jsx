import { useLeaderboard } from "../hooks/useLeaderboard";

export default function LeaderboardCard() {
  const { data, isPending, isError, error } = useLeaderboard();
  const entries = data?.leaderboard ?? [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">Leaderboard</h2>
      {isPending ? (
        <p role="status" className="py-6 text-center text-sm text-slate-500">
          Loading leaderboard...
        </p>
      ) : isError ? (
        <p role="alert" className="py-6 text-center text-sm text-red-700">
          {error.message}
        </p>
      ) : entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No learners have opted into the leaderboard yet.
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry) => (
            <li
              key={`${entry.rank}-${entry.displayName}`}
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
            >
              <span className="w-7 text-sm font-bold text-violet-700">#{entry.rank}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {entry.displayName}
              </span>
              <span className="text-xs text-slate-500">{entry.points} pts</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
