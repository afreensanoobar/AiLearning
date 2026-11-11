import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiDelete, apiPost, apiRequest } from "../../api/client";
import { PageError, PageLoading, PageNotice } from "../PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500";

const emptyCourse = {
  slug: "",
  title: "",
  category: "",
  description: "",
  level: "Beginner",
  skills: "",
  order: 0,
  ui: {
    color: "#8b5cf6",
    bg: "#ede9fe",
    icon: "NEW",
    iconColor: "#6d28d9",
  },
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCoursesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyCourse);
  const [slugEdited, setSlugEdited] = useState(false);
  const courses = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: () => apiRequest("/admin/courses"),
  });
  const createMutation = useMutation({
    mutationFn: (body) => apiPost("/admin/courses", body),
    onSuccess: ({ course }) => {
      setForm(emptyCourse);
      setSlugEdited(false);
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
      navigate(`/admin/courses/${course.id}`);
    },
    onError: (error) => setNotice(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/admin/courses/${id}`),
    onSuccess: () => {
      setNotice("Course deleted.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => setNotice(error.message),
  });

  if (courses.isPending) return <PageLoading label="Loading courses..." />;
  if (courses.isError) {
    return <PageError error={courses.error} onRetry={() => void courses.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageNotice error={Boolean(createMutation.error || deleteMutation.error)}>
        {notice}
      </PageNotice>
      <form
        className={cardClass}
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate({
            ...form,
            skills: form.skills
              .split(/[\n,]/)
              .map((skill) => skill.trim())
              .filter(Boolean),
            order: Number(form.order),
          });
        }}
      >
        <h2 className="text-lg font-bold">Create course</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Title
            <input
              className={inputClass}
              required
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                  slug: slugEdited ? current.slug : slugify(event.target.value),
                }))
              }
            />
          </label>
          <label className="text-sm font-medium">
            Slug
            <input
              className={inputClass}
              required
              value={form.slug}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              onChange={(event) => {
                setSlugEdited(true);
                setForm({ ...form, slug: event.target.value });
              }}
            />
          </label>
          <label className="text-sm font-medium">
            Category
            <input
              className={inputClass}
              required
              list="course-categories"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            />
            <datalist id="course-categories">
              {[...new Set((courses.data.courses ?? []).map((course) => course.category))].map(
                (category) => <option key={category} value={category} />
              )}
            </datalist>
          </label>
          <label className="text-sm font-medium">
            Experience level
            <select
              className={inputClass}
              value={form.level}
              onChange={(event) => setForm({ ...form, level: event.target.value })}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Order
            <input
              className={inputClass}
              type="number"
              min="0"
              required
              value={form.order}
              onChange={(event) => setForm({ ...form, order: event.target.value })}
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Description
            <textarea
              className={`${inputClass} min-h-24`}
              maxLength={2000}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Explain what learners will be able to do."
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Skills
            <input
              className={inputClass}
              value={form.skills}
              onChange={(event) => setForm({ ...form, skills: event.target.value })}
              placeholder="Separate skills with commas, e.g. Git, branching, GitHub"
            />
          </label>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          You’ll add the course lessons after creating the course.
        </p>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {createMutation.isPending ? "Creating..." : "Create course"}
        </button>
      </form>

      <section className="space-y-3">
        {(courses.data.courses ?? []).length === 0 && (
          <div className={cardClass}>
            <p className="text-sm text-slate-600">No courses yet. Create the first one above.</p>
          </div>
        )}
        {(courses.data.courses ?? []).map((course) => (
          <article className={cardClass} key={course.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{course.title}</h3>
                <p className="text-sm text-slate-500">
                  {course.category} · {course.level} · {course.lessonCount} lessons ·{" "}
                  {course.slug}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/courses/${course.id}`)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                >
                  Edit lessons
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete ${course.title} and its lessons?`)) {
                      deleteMutation.mutate(course.id);
                    }
                  }}
                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
