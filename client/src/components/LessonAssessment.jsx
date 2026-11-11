import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiPatch, apiPost } from "../api/client";

export default function LessonAssessment({ lessonId, lessonMaterial }) {
  const [attempt, setAttempt] = useState(null);
  const [notice, setNotice] = useState("");
  const startMutation = useMutation({
    mutationFn: () =>
      apiPost(`/lesson-assessments/${lessonId}/start`, { lessonMaterial }),
    onSuccess: ({ attempt: nextAttempt }) => {
      setAttempt(nextAttempt);
      setNotice("");
    },
    onError: (error) => setNotice(error.message),
  });
  const answerMutation = useMutation({
    mutationFn: ({ attemptId, questionId, selectedIndex }) =>
      apiPatch(`/lesson-assessments/${attemptId}/answer`, {
        questionId,
        selectedIndex,
      }),
    onSuccess: (_result, { questionId, selectedIndex }) => {
      setAttempt((current) => ({
        ...current,
        questions: current.questions.map((question) =>
          question.id === questionId ? { ...question, selectedIndex } : question
        ),
      }));
      setNotice("");
    },
    onError: (error) => setNotice(error.message),
  });
  const submitMutation = useMutation({
    mutationFn: (attemptId) => apiPost(`/lesson-assessments/${attemptId}/submit`, {}),
    onSuccess: ({ attempt: submittedAttempt }) => {
      setAttempt(submittedAttempt);
      setNotice("");
    },
    onError: (error) => setNotice(error.message),
  });

  const questions = attempt?.questions ?? [];
  const busy =
    startMutation.isPending || answerMutation.isPending || submitMutation.isPending;
  const allAnswered =
    questions.length > 0 && questions.every((question) => question.selectedIndex !== null);

  return (
    <section className="mt-5 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800">AI lesson assessment</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Generate a short quiz from this lesson. Submit your answers to see your
            score and explanations.
          </p>
        </div>
        {!attempt && (
          <button
            type="button"
            disabled={busy}
            onClick={() => startMutation.mutate()}
            className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {startMutation.isPending ? "Generating quiz..." : "Generate quiz"}
          </button>
        )}
      </div>

      {notice && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {notice}
        </p>
      )}

      {attempt?.status === "in_progress" && (
        <div className="mt-4 space-y-4">
          {questions.map((question, questionIndex) => (
            <article className="rounded-xl border border-slate-200 bg-white p-4" key={question.id}>
              <h4 className="font-semibold leading-6">
                {questionIndex + 1}. {question.text}
              </h4>
              <div className="mt-3 space-y-2" role="group" aria-label="Answer options">
                {question.options.map((option, optionIndex) => (
                  <button
                    type="button"
                    key={optionIndex}
                    aria-pressed={question.selectedIndex === optionIndex}
                    disabled={busy}
                    onClick={() =>
                      answerMutation.mutate({
                        attemptId: attempt.id,
                        questionId: question.id,
                        selectedIndex: optionIndex,
                      })
                    }
                    className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                      question.selectedIndex === optionIndex
                        ? "border-violet-500 bg-violet-50 text-violet-900"
                        : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
                    } disabled:opacity-60`}
                  >
                    <span className="mr-2 font-semibold text-violet-700">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </article>
          ))}
          <button
            type="button"
            disabled={!allAnswered || busy}
            onClick={() => submitMutation.mutate(attempt.id)}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitMutation.isPending ? "Grading..." : "Submit quiz"}
          </button>
          {!allAnswered && (
            <p className="text-xs text-slate-500">Answer all questions to submit.</p>
          )}
        </div>
      )}

      {attempt?.status === "submitted" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-white p-4">
            <p className="font-semibold">
              Score: {attempt.score} of {attempt.total} ({attempt.percentage}%)
            </p>
          </div>
          {questions.map((question, questionIndex) => (
            <article className="rounded-xl border border-slate-200 bg-white p-4" key={question.id}>
              <h4 className="font-semibold leading-6">
                {questionIndex + 1}. {question.text}
              </h4>
              <p
                className={`mt-2 text-sm font-semibold ${
                  question.correct ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {question.correct ? "Correct" : "Review"} — your answer:{" "}
                {question.options[question.selectedIndex]}
              </p>
              {!question.correct && (
                <p className="mt-1 text-sm text-emerald-700">
                  Correct answer: {question.correctAnswer}
                </p>
              )}
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {question.explanation}
              </p>
            </article>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => startMutation.mutate()}
            className="rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 disabled:opacity-50"
          >
            {startMutation.isPending ? "Generating quiz..." : "Generate another quiz"}
          </button>
        </div>
      )}
    </section>
  );
}
