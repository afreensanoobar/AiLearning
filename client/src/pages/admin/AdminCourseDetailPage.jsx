import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiDelete, apiPatch, apiPost, apiRequest } from "../../api/client";
import { PageError, PageLoading, PageNotice } from "../PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500";

export default function AdminCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    estimatedMinutes: 10,
  });
  const details = useQuery({
    queryKey: ["admin", "courses", id],
    queryFn: () => apiRequest(`/admin/courses/${id}`),
  });
  const saveCourse = useMutation({
    mutationFn: (body) => apiPatch(`/admin/courses/${id}`, body),
    onSuccess: () => {
      setNotice("Course updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
    },
    onError: (error) => setNotice(error.message),
  });
  const addLesson = useMutation({
    mutationFn: (body) => apiPost("/admin/lessons", body),
    onSuccess: () => {
      setLessonForm({ title: "", content: "", estimatedMinutes: 10 });
      setNotice("Lesson added.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses", id] });
    },
    onError: (error) => setNotice(error.message),
  });
  const saveLesson = useMutation({
    mutationFn: ({ lessonId, body }) => apiPatch(`/admin/lessons/${lessonId}`, body),
    onSuccess: () => {
      setNotice("Lesson updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses", id] });
    },
    onError: (error) => setNotice(error.message),
  });
  const deleteLesson = useMutation({
    mutationFn: (lessonId) => apiDelete(`/admin/lessons/${lessonId}`),
    onSuccess: () => {
      setNotice("Lesson deleted.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses", id] });
    },
    onError: (error) => setNotice(error.message),
  });
  const reorder = useMutation({
    mutationFn: (lessonIds) =>
      apiPost(`/admin/courses/${id}/lessons/reorder`, { lessonIds }),
    onSuccess: () => {
      setNotice("Lesson order saved.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses", id] });
    },
    onError: (error) => setNotice(error.message),
  });

  if (details.isPending) return <PageLoading label="Loading course..." />;
  if (details.isError) {
    return <PageError error={details.error} onRetry={() => void details.refetch()} />;
  }

  const { course, lessons } = details.data;
  const busy =
    saveCourse.isPending ||
    addLesson.isPending ||
    saveLesson.isPending ||
    deleteLesson.isPending ||
    reorder.isPending;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/admin/courses")}
        className="text-sm font-semibold text-violet-700"
      >
        Back to courses
      </button>
      <PageNotice
        error={Boolean(
          saveCourse.error ||
            addLesson.error ||
            saveLesson.error ||
            deleteLesson.error ||
            reorder.error
        )}
      >
        {notice}
      </PageNotice>
      <form
        className={cardClass}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          saveCourse.mutate({
            title: data.get("title"),
            slug: data.get("slug"),
            category: data.get("category"),
            order: Number(data.get("order")),
            ui: course.ui,
          });
        }}
      >
        <h2 className="text-lg font-bold">Course details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Title
            <input className={inputClass} name="title" defaultValue={course.title} required />
          </label>
          <label className="text-sm font-medium">
            Slug
            <input className={inputClass} name="slug" defaultValue={course.slug} required />
          </label>
          <label className="text-sm font-medium">
            Category
            <input
              className={inputClass}
              name="category"
              defaultValue={course.category}
              required
            />
          </label>
          <label className="text-sm font-medium">
            Order
            <input
              className={inputClass}
              name="order"
              type="number"
              min="0"
              defaultValue={course.order}
              required
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save course
        </button>
      </form>

      <form
        className={cardClass}
        onSubmit={(event) => {
          event.preventDefault();
          addLesson.mutate({
            courseId: course.id,
            ...lessonForm,
            estimatedMinutes: Number(lessonForm.estimatedMinutes),
          });
        }}
      >
        <h2 className="text-lg font-bold">Add lesson</h2>
        <label className="mt-4 block text-sm font-medium">
          Title
          <input
            className={inputClass}
            required
            value={lessonForm.title}
            onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })}
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Markdown content
          <textarea
            className={`${inputClass} min-h-32`}
            required
            value={lessonForm.content}
            onChange={(event) =>
              setLessonForm({ ...lessonForm, content: event.target.value })
            }
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Estimated minutes
          <input
            className={inputClass}
            type="number"
            min="1"
            required
            value={lessonForm.estimatedMinutes}
            onChange={(event) =>
              setLessonForm({ ...lessonForm, estimatedMinutes: event.target.value })
            }
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add lesson
        </button>
      </form>

      <section className="space-y-3">
        {lessons.map((lesson, index) => (
          <article className={cardClass} key={lesson.id}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                saveLesson.mutate({
                  lessonId: lesson.id,
                  body: {
                    title: data.get("title"),
                    content: data.get("content"),
                    estimatedMinutes: Number(data.get("estimatedMinutes")),
                  },
                });
              }}
            >
              <input
                className={inputClass}
                name="title"
                defaultValue={lesson.title}
                required
              />
              <textarea
                className={`${inputClass} min-h-28`}
                name="content"
                defaultValue={lesson.content}
                required
              />
              <input
                className={inputClass}
                name="estimatedMinutes"
                type="number"
                min="1"
                defaultValue={lesson.estimatedMinutes}
                required
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => {
                    const ids = lessons.map((item) => item.id);
                    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
                    reorder.mutate(ids);
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={busy || index === lessons.length - 1}
                  onClick={() => {
                    const ids = lessons.map((item) => item.id);
                    [ids[index + 1], ids[index]] = [ids[index], ids[index + 1]];
                    reorder.mutate(ids);
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Move down
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm("Delete this lesson?")) {
                      deleteLesson.mutate(lesson.id);
                    }
                  }}
                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </form>
          </article>
        ))}
      </section>
    </div>
  );
}
