import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../api/client";
import { PageError, PageLoading } from "../PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function AdminStatsPage() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiRequest("/admin/stats"),
  });

  if (stats.isPending) return <PageLoading label="Loading admin overview..." />;
  if (stats.isError) {
    return <PageError error={stats.error} onRetry={() => void stats.refetch()} />;
  }

  const { totalUsers, attemptsThisWeek, averageScore, mostMissedQuestions } = stats.data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total users", value: totalUsers },
          { label: "Attempts this week", value: attemptsThisWeek },
          { label: "Average score", value: `${averageScore}%` },
        ].map((item) => (
          <div className={cardClass} key={item.label}>
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>
      <section className={cardClass}>
        <h2 className="text-lg font-bold">Most missed questions</h2>
        {mostMissedQuestions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No missed answers yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {mostMissedQuestions.map((question) => (
              <li key={question.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="font-medium">{question.text}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {question.topic} · missed {question.misses} time
                  {question.misses === 1 ? "" : "s"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
