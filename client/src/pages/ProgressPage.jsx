import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiPost } from "../api/client";
import BadgeCollection from "../components/BadgeCollection";
import LeaderboardCard from "../components/LeaderboardCard";
import { useCourseProgress } from "../hooks/useCourseProgress";
import { useHistory } from "../hooks/useHistory";
import { useLearningPath } from "../hooks/useLearningPath";
import { useSummary } from "../hooks/useSummary";
import { useTopics } from "../hooks/useTopics";
import { useTrend } from "../hooks/useTrend";
import AppShell from "../layout/AppShell";
import { PageError, PageLoading, PageNotice } from "./PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function ProgressPage() {
  const [notice, setNotice] = useState("");
  const [plan, setPlan] = useState(null);
  const courseProgress = useCourseProgress();
  const summary = useSummary();
  const topics = useTopics();
  const path = useLearningPath();
  const trend = useTrend();
  const history = useHistory();
  const queries = [courseProgress, summary, topics, path, trend, history];
  const planMutation = useMutation({
    mutationFn: () => apiPost("/progress/ai-plan", {}),
    onSuccess: ({ plan: nextPlan }) => {
      setPlan(nextPlan);
      setNotice("Your study plan is ready.");
    },
    onError: (error) => setNotice(error.message),
  });

  if (queries.some((query) => query.isPending)) {
    return (
      <AppShell activePage="My Progress">
        <PageLoading label="Loading your progress..." />
      </AppShell>
    );
  }
  const failedQuery = queries.find((query) => query.isError);
  if (failedQuery) {
    return (
      <AppShell activePage="My Progress">
        <PageError
          error={failedQuery.error}
          onRetry={() => void Promise.all(queries.map((query) => query.refetch()))}
        />
      </AppShell>
    );
  }

  const attempts = (history.data?.attempts ?? []).filter(
    (attempt) => attempt.status === "submitted"
  );
  const trendData = (trend.data?.trend ?? []).map((item) => ({
    ...item,
    date: item.completedAt
      ? new Date(item.completedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "",
  }));
  const learningPath = path.data?.path ?? [];
  const completedCourses = (courseProgress.data?.courses ?? []).filter(
    (course) => course.total > 0 && course.completed === course.total
  );

  return (
    <AppShell activePage="My Progress">
      <PageNotice error={Boolean(planMutation.error)}>{notice}</PageNotice>
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Average score", `${summary.data.averageScore}%`],
          ["Lessons completed", summary.data.completedLessons],
          ["Current streak", `${summary.data.streak} days`],
        ].map(([label, value]) => (
          <div className={cardClass} key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className={`${cardClass} mb-6`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Completed courses</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            {completedCourses.length} completed
          </span>
        </div>
        {completedCourses.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Courses will appear here after you complete every lesson.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {completedCourses.map((course) => (
              <article
                className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
                key={course.courseId}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{course.category}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Complete
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {course.completed} of {course.total} lessons completed
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={cardClass}>
          <h2 className="mb-5 text-lg font-bold">Assessment score trend</h2>
          {trendData.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Complete an assessment to see your score trend.
            </p>
          ) : (
            <div className="h-64 w-full" aria-label="Assessment score trend chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 8, right: 12, bottom: 4, left: -18 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className={cardClass}>
          <div className="mb-5">
            <h2 className="text-lg font-bold">Assessment topic performance</h2>
            <p className="mt-1 text-sm text-slate-500">
              Based on submitted assessments; course completion is tracked separately.
            </p>
          </div>
          {(topics.data?.topics ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Complete an assessment to see topic performance.
            </p>
          ) : (
            <div className="space-y-5">
              {topics.data.topics.map((topic) => (
                <div key={topic.topic}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{topic.topic}</span>
                    <span className="text-slate-500">
                      {topic.total ? `${topic.percentage}%` : "No results yet"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="mb-4 text-lg font-bold">Learning path</h2>
          {learningPath.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Your personalized path will appear after an assessment.
            </p>
          ) : (
            <div className="space-y-3">
              {learningPath.map((item, index) => (
                <div
                  key={`${item.topic}-${index}`}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <p className="font-semibold">{item.topic}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.action}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.estimatedTime} · {item.priority} priority
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={`${cardClass} bg-violet-50/60`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">AI study plan</h2>
              <p className="mt-1 text-sm text-slate-500">
                A personalized seven-day plan based on your recent results.
              </p>
            </div>
            <button
              type="button"
              disabled={planMutation.isPending}
              onClick={() => planMutation.mutate()}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {planMutation.isPending ? "Generating..." : "Generate plan"}
            </button>
          </div>
          {plan && (
            <div className="mt-5">
              <p className="text-sm text-slate-700">{plan.summary}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {plan.weeklyPlan.map((day) => (
                  <article className="rounded-xl bg-white p-4" key={day.day}>
                    <div className="flex justify-between gap-2">
                      <h3 className="font-semibold">{day.day}</h3>
                      <span className="text-xs text-slate-500">{day.minutes} min</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-violet-700">
                      {day.focusTopic}
                    </p>
                    <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                      {day.tasks.map((task) => (
                        <li key={task}>{task}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              {plan.tips?.length > 0 && (
                <ul className="mt-4 list-inside list-disc text-sm text-slate-600">
                  {plan.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>

      <section className={`${cardClass} mt-6`}>
        <h2 className="mb-4 text-lg font-bold">Recent assessments</h2>
        {attempts.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No completed assessments yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {attempts.slice(0, 10).map((attempt) => (
              <div
                className="flex items-center justify-between gap-4 py-3"
                key={attempt.id}
              >
                <div>
                  <p className="font-medium">{attempt.type}</p>
                  <p className="text-xs text-slate-500">
                    {attempt.completedAt
                      ? new Date(attempt.completedAt).toLocaleDateString()
                      : "In progress"}
                  </p>
                </div>
                <span className="font-bold text-violet-700">{attempt.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <BadgeCollection />
        <LeaderboardCard />
      </div>
    </AppShell>
  );
}
