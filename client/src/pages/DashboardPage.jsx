import { ArrowRight, BookOpen, ClipboardCheck, Flame, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "../layout/AppShell";
import { useCourses } from "../hooks/useCourses";
import { useCourseProgress } from "../hooks/useCourseProgress";
import { useHistory } from "../hooks/useHistory";
import { useRecommendations } from "../hooks/useRecommendations";
import { useSummary } from "../hooks/useSummary";
import { PageError, PageLoading } from "./PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function DashboardPage() {
  const navigate = useNavigate();
  const summary = useSummary();
  const courses = useCourses();
  const courseProgress = useCourseProgress();
  const recommendations = useRecommendations();
  const history = useHistory();
  const queries = [summary, courses, courseProgress, recommendations, history];

  if (queries.some((query) => query.isPending)) {
    return (
      <AppShell activePage="Dashboard">
        <PageLoading label="Loading your dashboard..." />
      </AppShell>
    );
  }
  const failedQuery = queries.find((query) => query.isError);
  if (failedQuery) {
    return (
      <AppShell activePage="Dashboard">
        <PageError
          error={failedQuery.error}
          onRetry={() => void Promise.all(queries.map((query) => query.refetch()))}
        />
      </AppShell>
    );
  }

  const stats = summary.data;
  const progressByCourse = new Map(
    (courseProgress.data?.courses ?? []).map((item) => [item.courseId, item])
  );
  const courseList = courses.data?.courses ?? [];
  const hasCompletedAssessment = (history.data?.attempts ?? []).some(
    (attempt) => attempt.status === "submitted"
  );

  return (
    <AppShell activePage="Dashboard">
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-7 text-white sm:p-9">
        <p className="text-sm font-medium text-violet-100">Your learning overview</p>
        <h1 className="mt-2 text-3xl font-bold">Keep building your skills</h1>
        <p className="mt-2 max-w-2xl text-sm text-violet-100">
          You are learning at the {stats.currentLevel} level. Pick up where you left off.
        </p>
        <button
          type="button"
          onClick={() => navigate("/courses")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-violet-700"
        >
          Browse courses <ArrowRight size={17} />
        </button>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Courses", value: stats.enrolledCourses, Icon: BookOpen },
          { label: "Lessons completed", value: stats.completedLessons, Icon: Target },
          {
            label: "Average score",
            value: `${stats.averageScore}%`,
            Icon: ClipboardCheck,
          },
          { label: "Day streak", value: stats.streak, Icon: Flame },
        ].map(({ label, value, Icon }) => (
          <div className={cardClass} key={label}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <Icon size={20} className="text-violet-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className={cardClass}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">My Courses</h2>
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="text-sm font-semibold text-violet-700"
            >
              View all
            </button>
          </div>
          {courseList.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No courses are available yet.
            </p>
          ) : (
            <div className="space-y-4">
              {courseList.map((course) => {
                const progress = progressByCourse.get(course._id);
                return (
                  <button
                    type="button"
                    key={course._id}
                    onClick={() => navigate(`/courses/${course.slug}`)}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left hover:border-violet-200 hover:bg-violet-50/40"
                  >
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                      style={{
                        backgroundColor: course.ui?.bg,
                        color: course.ui?.iconColor,
                      }}
                    >
                      {course.category.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{course.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {progress?.completed ?? 0} of {progress?.total ?? 0} lessons
                      </span>
                      <span className="mt-2 block h-2 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-full rounded-full bg-violet-600"
                          style={{ width: `${progress?.percentage ?? 0}%` }}
                        />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="mb-5 text-lg font-bold">Recommended for you</h2>
          {!hasCompletedAssessment ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Complete an assessment to get personalized recommendations.
            </p>
          ) : (
            <div className="space-y-3">
              {recommendations.data.recommendations.map((item, index) => (
                <div
                  key={`${item.topic}-${index}`}
                  className="rounded-xl bg-violet-50 p-4"
                >
                  <p className="font-semibold text-violet-900">{item.topic}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.message} {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate("/assessment")}
            className="mt-5 w-full rounded-xl border border-violet-200 px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50"
          >
            Take an assessment
          </button>
        </section>
      </div>
    </AppShell>
  );
}
