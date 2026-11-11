import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, Clock3 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import AppShell from "../layout/AppShell";
import { useCourses } from "../hooks/useCourses";
import { useCourseProgress } from "../hooks/useCourseProgress";
import { PageError, PageLoading, PageNotice } from "./PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function CoursesPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");
  const courses = useCourses();
  const progress = useCourseProgress();
  const details = useQuery({
    queryKey: ["courses", slug],
    queryFn: () => apiRequest(`/courses/${slug}`),
    enabled: Boolean(slug),
  });

  const lessonMutation = useMutation({
    mutationFn: ({ lessonId, completed }) =>
      apiRequest(`/lessons/${lessonId}/complete`, {
        method: completed ? "POST" : "DELETE",
      }),
    onMutate: async ({ lessonId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["progress", "courses"] });
      const previous = queryClient.getQueryData(["progress", "courses"]);
      if (previous && details.data?.course) {
        queryClient.setQueryData(["progress", "courses"], {
          ...previous,
          courses: previous.courses.map((item) => {
            if (item.courseId !== details.data.course._id) return item;
            const ids = new Set(item.completedLessonIds ?? []);
            if (completed) ids.add(lessonId);
            else ids.delete(lessonId);
            const completedLessonIds = [...ids];
            const total = item.total;
            return {
              ...item,
              completedLessonIds,
              completed: completedLessonIds.length,
              percentage: total
                ? Math.round((completedLessonIds.length / total) * 100)
                : 0,
            };
          }),
        });
      }
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["progress", "courses"], context.previous);
      }
      setNotice(error.message);
    },
    onSuccess: (_result, { completed }) => {
      setNotice(completed ? "Lesson marked complete." : "Lesson marked incomplete.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["progress", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["progress", "summary"] });
      void queryClient.invalidateQueries({ queryKey: ["progress", "recommendations"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["badges"] });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  if (courses.isPending || progress.isPending || (slug && details.isPending)) {
    return (
      <AppShell activePage="My Courses">
        <PageLoading label={slug ? "Loading course..." : "Loading courses..."} />
      </AppShell>
    );
  }
  const failedQuery = courses.isError ? courses : progress.isError ? progress : details;
  if (failedQuery?.isError) {
    return (
      <AppShell activePage="My Courses">
        <PageError error={failedQuery.error} onRetry={() => void failedQuery.refetch()} />
      </AppShell>
    );
  }

  if (!slug) {
    const courseList = courses.data?.courses ?? [];
    const progressByCourse = new Map(
      (progress.data?.courses ?? []).map((item) => [item.courseId, item])
    );
    return (
      <AppShell activePage="My Courses">
        <PageNotice error={Boolean(lessonMutation.error)}>{notice}</PageNotice>
        {courseList.length === 0 ? (
          <div className={`${cardClass} py-12 text-center text-sm text-slate-500`}>
            No courses are available yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courseList.map((course) => {
              const item = progressByCourse.get(course._id);
              return (
                <button
                  type="button"
                  key={course._id}
                  onClick={() => navigate(`/courses/${course.slug}`)}
                  className={`${cardClass} text-left transition hover:-translate-y-1 hover:border-violet-200`}
                >
                  <span
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl font-bold"
                    style={{
                      backgroundColor: course.ui?.bg,
                      color: course.ui?.iconColor,
                    }}
                  >
                    {course.category.slice(0, 2).toUpperCase()}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                    {course.category}
                  </p>
                  <h2 className="mt-2 text-xl font-bold">{course.title}</h2>
                  <p className="mt-4 text-sm text-slate-500">
                    {item?.completed ?? 0} of {item?.total ?? 0} lessons completed
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{ width: `${item?.percentage ?? 0}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </AppShell>
    );
  }

  const { course, lessons } = details.data;
  const courseProgress = (progress.data?.courses ?? []).find(
    (item) => item.courseId === course._id
  );
  const completedIds = new Set(courseProgress?.completedLessonIds ?? []);

  return (
    <AppShell activePage="My Courses">
      <button
        type="button"
        onClick={() => navigate("/courses")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700"
      >
        <ArrowLeft size={17} /> All courses
      </button>
      <section className={`${cardClass} mb-6`}>
        <p className="text-sm font-semibold text-violet-700">{course.category}</p>
        <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {courseProgress?.completed ?? 0} of {courseProgress?.total ?? lessons.length}{" "}
          lessons complete
        </p>
      </section>
      {lessons.length === 0 ? (
        <div className={`${cardClass} py-10 text-center text-sm text-slate-500`}>
          This course does not have any lessons yet.
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const completed = completedIds.has(lesson._id);
            return (
              <article className={cardClass} key={lesson._id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <button
                    type="button"
                    aria-label={`${completed ? "Mark incomplete" : "Mark complete"}: ${lesson.title}`}
                    aria-pressed={completed}
                    disabled={lessonMutation.isPending}
                    onClick={() =>
                      lessonMutation.mutate({
                        lessonId: lesson._id,
                        completed: !completed,
                      })
                    }
                    className="mt-1 text-violet-700 disabled:opacity-50"
                  >
                    {completed ? <CheckCircle2 /> : <Circle />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-bold">{lesson.title}</h2>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 size={14} /> {lesson.estimatedMinutes} min
                      </span>
                    </div>
                    <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-6 text-slate-600">
                      {lesson.content}
                    </pre>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <PageNotice error={Boolean(lessonMutation.error)}>{notice}</PageNotice>
    </AppShell>
  );
}
