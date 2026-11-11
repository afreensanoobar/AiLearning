import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { apiPost, apiRequest } from "../api/client";
import AppShell from "../layout/AppShell";
import { PageError, PageLoading, PageNotice } from "./PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

export default function AssessmentPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("assessment");
  const [run, setRun] = useState(0);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState("");
  const [explanations, setExplanations] = useState({});
  const queryKey = ["assessments", "active", mode, run];
  const attemptQuery = useQuery({
    queryKey,
    queryFn: async () => (await apiPost("/assessments/start", { mode })).attempt,
    staleTime: Infinity,
  });
  const attempt = attemptQuery.data;
  const answers = new Map(
    (attempt?.answers ?? []).map((answer) => [
      answer.questionId.toString(),
      answer.selectedIndex,
    ])
  );
  const questions = attempt?.questions ?? [];
  const currentQuestion = questions[index];

  const answerMutation = useMutation({
    mutationFn: ({ questionId, selectedIndex }) =>
      apiRequest(`/assessments/${attempt.id}/answer`, {
        method: "PATCH",
        body: JSON.stringify({ questionId, selectedIndex }),
      }),
    onSuccess: ({ questionId, selectedIndex }) => {
      queryClient.setQueryData(queryKey, (previous) => ({
        ...previous,
        answers: [
          ...(previous.answers ?? []).filter(
            (answer) => answer.questionId.toString() !== questionId.toString()
          ),
          { questionId, selectedIndex },
        ],
      }));
      setNotice("");
    },
    onError: (error) => setNotice(error.message),
  });
  const submitMutation = useMutation({
    mutationFn: () => apiPost(`/assessments/${attempt.id}/submit`, {}),
    onSuccess: async ({ attempt: submitted }) => {
      setResult(submitted);
      setNotice("Assessment submitted.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["progress", "summary"] }),
        queryClient.invalidateQueries({ queryKey: ["progress", "topics"] }),
        queryClient.invalidateQueries({ queryKey: ["progress", "trend"] }),
        queryClient.invalidateQueries({ queryKey: ["progress", "path"] }),
        queryClient.invalidateQueries({ queryKey: ["progress", "recommendations"] }),
        queryClient.invalidateQueries({ queryKey: ["assessments", "history"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["badges"] }),
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] }),
      ]);
    },
    onError: (error) => setNotice(error.message),
  });
  const explainMutation = useMutation({
    mutationFn: (questionId) =>
      apiPost(`/assessments/${result.id}/explain`, { questionId }),
    onSuccess: ({ explanation }, questionId) => {
      setExplanations((previous) => ({ ...previous, [questionId]: explanation }));
    },
    onError: (error) => setNotice(error.message),
  });

  if (attemptQuery.isPending) {
    return (
      <AppShell activePage="Assessment">
        <PageLoading label="Preparing your assessment..." />
      </AppShell>
    );
  }
  if (attemptQuery.isError) {
    return (
      <AppShell activePage="Assessment">
        <PageError
          error={attemptQuery.error}
          onRetry={() => void attemptQuery.refetch()}
        />
      </AppShell>
    );
  }

  const startAgain = (nextMode = "assessment") => {
    setMode(nextMode);
    setRun((value) => value + 1);
    setResult(null);
    setIndex(0);
    setNotice("");
    setExplanations({});
  };

  if (result) {
    return (
      <AppShell activePage="Assessment">
        <PageNotice error={Boolean(submitMutation.error || explainMutation.error)}>
          {notice}
        </PageNotice>
        <section className={`${cardClass} mb-6 text-center`}>
          <CheckCircle2 className="mx-auto text-violet-600" size={40} />
          <h1 className="mt-3 text-2xl font-bold">{result.type} complete</h1>
          <p className="mt-2 text-slate-500">{result.adaptiveMessage}</p>
          <p className="mt-5 text-4xl font-bold text-violet-700">{result.percentage}%</p>
          <p className="mt-1 text-sm text-slate-500">
            {result.score} correct out of {result.total}
          </p>
          {result.nextLevel && result.nextLevel !== result.difficulty && (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              Your next assessment level is {result.nextLevel}.
            </p>
          )}
          {result.finalChallengeCompleted && (
            <p className="mt-3 font-semibold text-amber-700">
              All challenge stages mastered!
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => startAgain("assessment")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
            >
              <RotateCcw size={16} /> Retake assessment
            </button>
            {(result.canStartChallenge || result.nextStage) && (
              <button
                type="button"
                onClick={() => startAgain("challenge")}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Sparkles size={16} />
                {result.nextStage
                  ? `Start challenge stage ${result.nextStage}`
                  : "Start advanced challenge"}
              </button>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">Question review</h2>
          {(result.questions ?? []).map((question, questionIndex) => (
            <article className={cardClass} key={question.id}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold">
                  {questionIndex + 1}. {question.text}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    question.correct
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {question.correct ? "Correct" : "Review"}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Your answer: {question.options[question.selectedIndex]}
              </p>
              {!question.correct && (
                <p className="mt-1 text-sm font-medium text-emerald-700">
                  Correct answer: {question.correctAnswer}
                </p>
              )}
              {question.explanation && (
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                  {question.explanation}
                </p>
              )}
              {explanations[question.id] && (
                <p className="mt-3 rounded-xl bg-violet-50 p-3 text-sm leading-6 text-violet-900">
                  {explanations[question.id]}
                </p>
              )}
              <button
                type="button"
                disabled={explainMutation.isPending || Boolean(explanations[question.id])}
                onClick={() => explainMutation.mutate(question.id)}
                className="mt-3 text-sm font-semibold text-violet-700 disabled:opacity-50"
              >
                {explainMutation.isPending && explainMutation.variables === question.id
                  ? "Generating explanation..."
                  : "Explain with AI"}
              </button>
            </article>
          ))}
        </section>
      </AppShell>
    );
  }

  if (!currentQuestion) {
    return (
      <AppShell activePage="Assessment">
        <div className={`${cardClass} py-12 text-center text-sm text-slate-500`}>
          No questions are available for this assessment.
        </div>
      </AppShell>
    );
  }

  const chosen = answers.get(currentQuestion.id.toString());
  const allAnswered = answers.size === questions.length;

  return (
    <AppShell activePage="Assessment">
      <PageNotice error={Boolean(answerMutation.error || submitMutation.error)}>
        {notice}
      </PageNotice>
      <section className={`${cardClass} mx-auto max-w-3xl`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-700">
              {attempt.type} · {attempt.difficulty}
              {attempt.challengeStage ? ` · Stage ${attempt.challengeStage}` : ""}
            </p>
            <h1 className="mt-1 text-xl font-bold">Knowledge check</h1>
          </div>
          <span className="text-sm text-slate-500">
            Question {index + 1} of {questions.length}
          </span>
        </div>
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
        <h2 className="text-lg font-semibold leading-7">{currentQuestion.text}</h2>
        <div className="mt-5 space-y-3" role="group" aria-label="Answer options">
          {currentQuestion.options.map((option, optionIndex) => (
            <button
              type="button"
              key={optionIndex}
              aria-pressed={chosen === optionIndex}
              disabled={answerMutation.isPending || submitMutation.isPending}
              onClick={() =>
                answerMutation.mutate({
                  questionId: currentQuestion.id,
                  selectedIndex: optionIndex,
                })
              }
              className={`w-full rounded-xl border p-4 text-left text-sm transition ${
                chosen === optionIndex
                  ? "border-violet-500 bg-violet-50 text-violet-900"
                  : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
              } disabled:opacity-60`}
            >
              <span className="mr-3 font-semibold text-violet-700">
                {String.fromCharCode(65 + optionIndex)}.
              </span>
              {option}
            </button>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={index === 0 || answerMutation.isPending}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            <ArrowLeft size={16} /> Previous
          </button>
          {index < questions.length - 1 ? (
            <button
              type="button"
              disabled={answerMutation.isPending}
              onClick={() =>
                setIndex((value) => Math.min(questions.length - 1, value + 1))
              }
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={
                !allAnswered || answerMutation.isPending || submitMutation.isPending
              }
              onClick={() => submitMutation.mutate()}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit assessment"}
            </button>
          )}
        </div>
        {!allAnswered && (
          <p className="mt-4 text-right text-xs text-slate-500">
            Answer all {questions.length} questions to submit.
          </p>
        )}
      </section>
    </AppShell>
  );
}
