import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Braces,
  BrainCircuit,
  CheckCircle2,
  CirclePlay,
  Circle,
  Clock3,
  Database,
  GitBranch,
  Globe2,
  Layers3,
  Palette,
  Search,
  Server,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import AppShell from "../layout/AppShell";
import { useCourses } from "../hooks/useCourses";
import { useCourseDetails } from "../hooks/useCourseDetails";
import { useCourseProgress } from "../hooks/useCourseProgress";
import LessonAssessment from "../components/LessonAssessment";
import MarkdownContent from "../components/MarkdownContent";
import { PageError, PageLoading, PageNotice } from "./PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const categoryThemes = {
  "Web Fundamentals": {
    Icon: Globe2,
    cover: "from-sky-500 to-blue-700",
  },
  Programming: {
    Icon: Braces,
    cover: "from-amber-500 to-orange-600",
  },
  "Frontend Development": {
    Icon: Layers3,
    cover: "from-emerald-500 to-teal-700",
  },
  "Backend Development": {
    Icon: Server,
    cover: "from-slate-600 to-slate-900",
  },
  "Data & Analytics": {
    Icon: Database,
    cover: "from-cyan-500 to-blue-700",
  },
  "AI & Machine Learning": {
    Icon: BrainCircuit,
    cover: "from-violet-500 to-indigo-800",
  },
  "Developer Tools": {
    Icon: GitBranch,
    cover: "from-slate-500 to-slate-800",
  },
  "Design & UX": {
    Icon: Palette,
    cover: "from-pink-500 to-rose-700",
  },
};

function formatDuration(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours && remainder) return `${hours}h ${remainder}m`;
  if (hours) return `${hours}h`;
  return `${minutes} min`;
}

export default function CoursesPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All topics");
  const [activeLevel, setActiveLevel] = useState("All levels");
  const courses = useCourses();
  const progress = useCourseProgress();
  const details = useCourseDetails(slug);

  useEffect(() => {
    if (!slug || !details.data || !window.location.hash) return undefined;
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [slug, details.data]);

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
    const categories = [...new Set(courseList.map((course) => course.category))];
    const normalizedSearch = search.trim().toLowerCase();
    const filteredCourses = courseList.filter((course) => {
      const matchesCategory =
        activeCategory === "All topics" || course.category === activeCategory;
      const matchesLevel = activeLevel === "All levels" || course.level === activeLevel;
      const searchableText = [
        course.title,
        course.category,
        course.description,
        ...(course.skills ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return (
        matchesCategory &&
        matchesLevel &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      );
    });
    const progressByCourse = new Map(
      (progress.data?.courses ?? []).map((item) => [item.courseId, item])
    );
    const hasFilters =
      search.trim() !== "" ||
      activeCategory !== "All topics" ||
      activeLevel !== "All levels";
    return (
      <AppShell activePage="My Courses">
        <PageNotice error={Boolean(lessonMutation.error)}>{notice}</PageNotice>
        {courseList.length === 0 ? (
          <div className={`${cardClass} py-12 text-center text-sm text-slate-500`}>
            No courses are available yet.
          </div>
        ) : (
          <>
            <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-700 to-indigo-900 px-6 py-7 text-white sm:px-8 sm:py-9">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold text-violet-200">
                    Learn something you can use
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                    Find your next skill
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
                    Explore practical courses across web development, programming, data,
                    AI, and design. Learn at your own pace, one lesson at a time.
                  </p>
                </div>
                <div className="flex shrink-0 gap-6 rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
                  <div>
                    <p className="text-2xl font-bold">{courseList.length}</p>
                    <p className="text-xs text-violet-100">courses</p>
                  </div>
                  <div className="border-l border-white/20 pl-6">
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-xs text-violet-100">subject areas</p>
                  </div>
                </div>
              </div>
            </section>

            <section
              aria-label="Course filters"
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="course-catalog-search"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Search the catalog
                  </label>
                  <div className="relative">
                    <Search
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="course-catalog-search"
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Try Python, React, analytics..."
                      className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-52">
                  <label
                    htmlFor="course-level-filter"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Experience level
                  </label>
                  <select
                    id="course-level-filter"
                    value={activeLevel}
                    onChange={(event) => setActiveLevel(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  >
                    <option>All levels</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Browse by topic
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {["All topics", ...categories].map((category) => (
                    <button
                      type="button"
                      key={category}
                      aria-pressed={activeCategory === category}
                      onClick={() => setActiveCategory(category)}
                      className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                        activeCategory === category
                          ? "border-violet-700 bg-violet-700 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600" aria-live="polite">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {filteredCourses.length}
                </span>{" "}
                {filteredCourses.length === 1 ? "course" : "courses"}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All topics");
                    setActiveLevel("All levels");
                  }}
                  className="min-h-10 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredCourses.length === 0 ? (
              <div className={`${cardClass} py-12 text-center`}>
                <Search aria-hidden="true" className="mx-auto text-slate-400" size={28} />
                <h2 className="mt-3 font-semibold text-slate-800">No courses found</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Try another search or broaden your filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => {
                  const item = progressByCourse.get(course._id);
                  const theme = categoryThemes[course.category] ?? {
                    Icon: BookOpen,
                    cover: "from-violet-500 to-indigo-800",
                  };
                  const CategoryIcon = theme.Icon;
                  const courseMetadata = [
                    course.lessonCount ? `${course.lessonCount} lessons` : null,
                    formatDuration(course.durationMinutes),
                  ].filter(Boolean);
                  return (
                    <article
                      key={course._id}
                      className={`${cardClass} flex flex-col gap-4 transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md`}
                    >
                      <div
                        className={`relative flex min-h-32 items-end justify-between overflow-hidden rounded-xl bg-gradient-to-br ${theme.cover} p-4 text-white`}
                      >
                        <span className="absolute -right-4 -top-8 h-32 w-32 rounded-full border-[18px] border-white/10" />
                        <span className="relative rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                          {course.category}
                        </span>
                        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                          <CategoryIcon aria-hidden="true" size={24} />
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">
                            {course.level ?? "Beginner"}
                          </span>
                          {courseMetadata.length > 0 && (
                            <span className="text-xs text-slate-500">
                              {courseMetadata.join(" · ")}
                            </span>
                          )}
                        </div>
                        <h2 className="mt-3 text-lg font-bold tracking-tight text-slate-800">
                          {course.title}
                        </h2>
                        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 line-clamp-2">
                          {course.description ||
                            `Build practical skills in ${course.category.toLowerCase()} with guided, self-paced lessons.`}
                        </p>
                        {course.skills?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {course.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        {item?.completed > 0 && (
                          <div className="mt-4">
                            <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                              <span>
                                {item.completed} of {item.total} lessons complete
                              </span>
                              <span>{item.percentage}%</span>
                            </div>
                            <div
                              role="progressbar"
                              aria-label={`${course.title} progress`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={item.percentage}
                              className="h-1.5 overflow-hidden rounded-full bg-slate-100"
                            >
                              <div
                                className="h-full rounded-full bg-violet-600"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/courses/${course.slug}`)}
                        className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 transition hover:border-violet-700 hover:bg-violet-700 hover:text-white"
                      >
                        {item?.completed > 0 ? "Continue learning" : "Start learning"}
                        <ArrowRight aria-hidden="true" size={16} />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </>
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
            {course.category}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {course.level ?? "Beginner"}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
        {course.description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {course.description}
          </p>
        )}
        <p className="mt-2 text-sm text-slate-500">
          {courseProgress?.completed ?? 0} of {courseProgress?.total ?? lessons.length}{" "}
          lessons complete
        </p>
        {course.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {course.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>
      {lessons.length === 0 ? (
        <div className={`${cardClass} py-10 text-center text-sm text-slate-500`}>
          This course does not have any lessons yet.
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const completed = completedIds.has(lesson._id);
            const keyPoints = lesson.keyPoints ?? [];
            const hasVideoId = /^[A-Za-z0-9_-]{11}$/.test(lesson.videoId ?? "");
            return (
              <article
                className={`${cardClass} scroll-mt-6`}
                id={`lesson-${lesson._id}`}
                key={lesson._id}
              >
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
                    <div className="mt-4">
                      {hasVideoId ? (
                        <div className="aspect-video overflow-hidden rounded-xl bg-slate-950">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(lesson.videoId)}`}
                            title={`${lesson.title} video`}
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="h-full w-full border-0"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
                          <CirclePlay
                            aria-hidden="true"
                            className="text-violet-600"
                            size={34}
                          />
                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            YouTube lesson video
                          </p>
                          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                            A lecture video for this lesson is not available yet. You can
                            still learn from the notes below.
                          </p>
                        </div>
                      )}
                      {hasVideoId && lesson.channel && (
                        <p className="mt-2 text-xs text-slate-500">
                          Lecture by <span className="font-medium">{lesson.channel}</span>
                        </p>
                      )}
                      {hasVideoId && !lesson.channel && (
                        <p className="mt-2 text-xs text-slate-500">
                          Lecture by channel not listed
                        </p>
                      )}
                    </div>

                    <section className="mt-4 rounded-xl bg-slate-50 p-4">
                      <h3 className="text-sm font-bold text-slate-800">Lesson notes</h3>
                      <MarkdownContent className="mt-2">{lesson.content}</MarkdownContent>
                    </section>

                    {keyPoints.length > 0 && (
                      <section className="mt-4">
                        <h3 className="text-sm font-bold text-slate-800">Key points</h3>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                          {keyPoints.map((point) => (
                            <li key={point} className="flex gap-2">
                              <span
                                aria-hidden="true"
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600"
                              />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    <LessonAssessment
                      lessonId={lesson._id}
                      lessonMaterial={[lesson.content, ...keyPoints].join("\n")}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/tutor?lessonId=${encodeURIComponent(lesson._id)}&courseSlug=${encodeURIComponent(course.slug)}`
                        )
                      }
                      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                      <Sparkles aria-hidden="true" size={16} />
                      Ask the AI Tutor about this lesson
                    </button>
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
