import { Award } from "lucide-react";
import { useBadges } from "../hooks/useBadges";

export default function BadgeCollection() {
  const { data, isPending, isError, error } = useBadges();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Achievements</h2>
        {!isPending && !isError && (
          <span className="text-xs text-slate-500">
            {(data.badges ?? []).filter((badge) => badge.awardedAt).length} earned
          </span>
        )}
      </div>
      {isPending ? (
        <p role="status" className="py-6 text-center text-sm text-slate-500">
          Loading badges...
        </p>
      ) : isError ? (
        <p role="alert" className="py-6 text-center text-sm text-red-700">
          {error.message}
        </p>
      ) : data.badges.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No badges are available yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {data.badges.map((badge) => {
            const earned = Boolean(badge.awardedAt);
            return (
              <article
                key={badge.key}
                title={badge.description}
                className={`rounded-xl border p-3 ${
                  earned
                    ? "border-violet-200 bg-violet-50"
                    : "border-slate-100 bg-slate-50 opacity-70"
                }`}
              >
                <Award
                  size={20}
                  className={earned ? "text-violet-700" : "text-slate-400"}
                />
                <h3 className="mt-2 text-sm font-semibold">{badge.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {earned
                    ? new Date(badge.awardedAt).toLocaleDateString()
                    : badge.description}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
