import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiDelete, apiPatch, apiPost, apiRequest } from "../../api/client";
import { PageError, PageLoading, PageNotice } from "../PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500";
const topics = ["HTML", "CSS", "JavaScript", "React"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];
const statuses = ["", "active", "draft", "rejected", "archived"];
const sources = ["", "manual", "ai"];

const emptyQuestion = {
  topic: "HTML",
  difficulty: "Beginner",
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
};

export default function AdminQuestionsPage() {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({
    topic: "",
    difficulty: "",
    status: "",
    source: "",
  });
  const [form, setForm] = useState(emptyQuestion);
  const [generate, setGenerate] = useState({
    topic: "HTML",
    difficulty: "Beginner",
    count: 3,
  });
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
  ).toString();
  const questions = useQuery({
    queryKey: ["admin", "questions", filters],
    queryFn: () => apiRequest(`/admin/questions${query ? `?${query}` : ""}`),
  });
  const createMutation = useMutation({
    mutationFn: (body) => apiPost("/admin/questions", body),
    onSuccess: () => {
      setForm(emptyQuestion);
      setNotice("Question created.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
    },
    onError: (error) => setNotice(error.message),
  });
  const saveMutation = useMutation({
    mutationFn: ({ id, body }) => apiPatch(`/admin/questions/${id}`, body),
    onSuccess: () => {
      setNotice("Question saved.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
    },
    onError: (error) => setNotice(error.message),
  });
  const actionMutation = useMutation({
    mutationFn: ({ id, action }) =>
      action === "delete"
        ? apiDelete(`/admin/questions/${id}`)
        : apiPost(`/admin/questions/${id}/${action}`, {}),
    onSuccess: (_result, { action }) => {
      setNotice(
        action === "approve"
          ? "Draft approved."
          : action === "reject"
            ? "Draft rejected."
            : "Question archived."
      );
      void queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
    },
    onError: (error) => setNotice(error.message),
  });
  const generateMutation = useMutation({
    mutationFn: (body) => apiPost("/admin/questions/generate", body),
    onSuccess: ({ count }) => {
      setNotice(`Generated ${count} draft question${count === 1 ? "" : "s"}.`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
    },
    onError: (error) => setNotice(error.message),
  });

  if (questions.isPending) return <PageLoading label="Loading questions..." />;
  if (questions.isError) {
    return (
      <PageError error={questions.error} onRetry={() => void questions.refetch()} />
    );
  }

  const busy =
    createMutation.isPending ||
    saveMutation.isPending ||
    actionMutation.isPending ||
    generateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageNotice
        error={Boolean(
          createMutation.error ||
            saveMutation.error ||
            actionMutation.error ||
            generateMutation.error
        )}
      >
        {notice}
      </PageNotice>

      <section className={`${cardClass} grid gap-3 sm:grid-cols-4`}>
        {[
          ["topic", topics],
          ["difficulty", difficulties],
          ["status", statuses.filter(Boolean)],
          ["source", sources.filter(Boolean)],
        ].map(([key, options]) => (
          <label key={key} className="text-sm font-medium capitalize">
            {key}
            <select
              className={inputClass}
              value={filters[key]}
              onChange={(event) =>
                setFilters({ ...filters, [key]: event.target.value })
              }
            >
              <option value="">All</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </section>

      <form
        className={cardClass}
        onSubmit={(event) => {
          event.preventDefault();
          generateMutation.mutate({
            ...generate,
            count: Number(generate.count),
          });
        }}
      >
        <h2 className="text-lg font-bold">Generate AI drafts</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">
            Topic
            <select
              className={inputClass}
              value={generate.topic}
              onChange={(event) =>
                setGenerate({ ...generate, topic: event.target.value })
              }
            >
              {topics.map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Difficulty
            <select
              className={inputClass}
              value={generate.difficulty}
              onChange={(event) =>
                setGenerate({ ...generate, difficulty: event.target.value })
              }
            >
              {difficulties.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Count
            <input
              className={inputClass}
              type="number"
              min="1"
              max="10"
              value={generate.count}
              onChange={(event) =>
                setGenerate({ ...generate, count: event.target.value })
              }
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {generateMutation.isPending ? "Generating..." : "Generate drafts"}
        </button>
      </form>

      <form
        className={cardClass}
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate({
            ...form,
            correctIndex: Number(form.correctIndex),
          });
        }}
      >
        <h2 className="text-lg font-bold">Create question</h2>
        <QuestionFields form={form} setForm={setForm} />
        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Create question
        </button>
      </form>

      <section className="space-y-4">
        {(questions.data.questions ?? []).map((question) => (
          <QuestionEditor
            key={question.id}
            question={question}
            busy={busy}
            onSave={(body) => saveMutation.mutate({ id: question.id, body })}
            onAction={(action) => actionMutation.mutate({ id: question.id, action })}
          />
        ))}
        {(questions.data.questions ?? []).length === 0 && (
          <p className={`${cardClass} text-sm text-slate-500`}>No questions match these filters.</p>
        )}
      </section>
    </div>
  );
}

function QuestionFields({ form, setForm }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Topic
          <select
            className={inputClass}
            value={form.topic}
            onChange={(event) => setForm({ ...form, topic: event.target.value })}
          >
            {topics.map((topic) => (
              <option key={topic}>{topic}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Difficulty
          <select
            className={inputClass}
            value={form.difficulty}
            onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
          >
            {difficulties.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium">
        Question
        <textarea
          className={`${inputClass} min-h-20`}
          required
          value={form.text}
          onChange={(event) => setForm({ ...form, text: event.target.value })}
        />
      </label>
      {form.options.map((option, index) => (
        <label key={index} className="block text-sm font-medium">
          Option {index + 1}
          <input
            className={inputClass}
            required
            value={option}
            onChange={(event) => {
              const options = [...form.options];
              options[index] = event.target.value;
              setForm({ ...form, options });
            }}
          />
        </label>
      ))}
      <label className="block text-sm font-medium">
        Correct option
        <select
          className={inputClass}
          value={form.correctIndex}
          onChange={(event) =>
            setForm({ ...form, correctIndex: Number(event.target.value) })
          }
        >
          {form.options.map((_, index) => (
            <option key={index} value={index}>
              Option {index + 1}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Explanation
        <textarea
          className={`${inputClass} min-h-20`}
          required
          value={form.explanation}
          onChange={(event) => setForm({ ...form, explanation: event.target.value })}
        />
      </label>
    </div>
  );
}

function QuestionEditor({ question, busy, onSave, onAction }) {
  const [form, setForm] = useState({
    topic: question.topic,
    difficulty: question.difficulty,
    text: question.text,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
  });

  return (
    <article className={cardClass}>
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
        {question.status} · {question.source} · {question.topic} · {question.difficulty}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ ...form, correctIndex: Number(form.correctIndex) });
        }}
      >
        <QuestionFields form={form} setForm={setForm} />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Save
          </button>
          {question.status === "draft" && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction("approve")}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction("reject")}
                className="rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
          {question.status !== "archived" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction("delete")}
              className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Archive
            </button>
          )}
        </div>
      </form>
    </article>
  );
}
