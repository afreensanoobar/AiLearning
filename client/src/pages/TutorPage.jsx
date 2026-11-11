import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Copy, MessageSquarePlus, Send, Square, Sparkles } from "lucide-react";
import { apiPost, apiRequest, apiStream } from "../api/client";
import { useAuth } from "../context/useAuth";
import AppShell from "../layout/AppShell";
import { PageError, PageLoading, PageNotice } from "./PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";

export default function TutorPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [level, setLevel] = useState(user?.currentLevel ?? "Beginner");
  const [message, setMessage] = useState("");
  const [pendingMessages, setPendingMessages] = useState([]);
  const [streamText, setStreamText] = useState("");
  const [fallback, setFallback] = useState(false);
  const [notice, setNotice] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const sessionsQuery = useQuery({
    queryKey: ["tutor", "sessions"],
    queryFn: () => apiRequest("/tutor/sessions"),
  });
  const sessions = sessionsQuery.data?.sessions ?? [];
  const firstSession = sessions[0];
  const activeSessionId =
    sessionId || (firstSession ? firstSession.id || firstSession._id : null);
  const sessionQuery = useQuery({
    queryKey: ["tutor", "sessions", activeSessionId],
    queryFn: () => apiRequest(`/tutor/sessions/${activeSessionId}`),
    enabled: Boolean(activeSessionId),
  });
  const newSessionMutation = useMutation({
    mutationFn: () => apiPost("/tutor/sessions", {}),
    onSuccess: ({ session }) => {
      const id = session.id || session._id;
      setSessionId(id);
      setPendingMessages([]);
      setNotice("");
      void queryClient.invalidateQueries({ queryKey: ["tutor", "sessions"] });
    },
    onError: (error) => setNotice(error.message),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionQuery.data, pendingMessages, streamText]);

  const send = async (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || !activeSessionId || abortRef.current) return;
    setMessage("");
    setNotice("");
    setFallback(false);
    setStreamText("");
    setPendingMessages([
      ...(sessionQuery.data?.session?.messages ?? []),
      { role: "user", content },
      { role: "assistant", content: "", streaming: true },
    ]);
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    try {
      await apiStream(
        `/tutor/sessions/${activeSessionId}/messages`,
        { content, level },
        {
          signal: controller.signal,
          onChunk: (chunk) => setStreamText((previous) => previous + chunk),
          onDone: ({ fallback: usedFallback }) => setFallback(usedFallback),
        }
      );
      setPendingMessages([]);
      setNotice("Tutor reply received.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tutor", "sessions"] }),
        queryClient.invalidateQueries({
          queryKey: ["tutor", "sessions", activeSessionId],
        }),
      ]);
    } catch (error) {
      if (error.name !== "AbortError") setNotice(error.message);
      setPendingMessages([]);
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
      setStreamText("");
    }
  };

  const stop = () => abortRef.current?.abort();

  if (sessionsQuery.isPending) {
    return (
      <AppShell activePage="AI Tutor">
        <PageLoading label="Loading tutor chats..." />
      </AppShell>
    );
  }
  if (sessionsQuery.isError) {
    return (
      <AppShell activePage="AI Tutor">
        <PageError
          error={sessionsQuery.error}
          onRetry={() => void sessionsQuery.refetch()}
        />
      </AppShell>
    );
  }
  if (activeSessionId && sessionQuery.isPending) {
    return (
      <AppShell activePage="AI Tutor">
        <PageLoading label="Loading conversation..." />
      </AppShell>
    );
  }
  if (activeSessionId && sessionQuery.isError) {
    return (
      <AppShell activePage="AI Tutor">
        <PageError
          error={sessionQuery.error}
          onRetry={() => void sessionQuery.refetch()}
        />
      </AppShell>
    );
  }

  const sessionMessages = pendingMessages.length
    ? pendingMessages
    : (sessionQuery.data?.session?.messages ?? []);

  return (
    <AppShell activePage="AI Tutor">
      <PageNotice error={Boolean(notice)}>{notice}</PageNotice>
      <div className="grid min-h-[65vh] gap-5 lg:grid-cols-[260px_1fr]">
        <aside className={`${cardClass} p-4`}>
          <button
            type="button"
            disabled={newSessionMutation.isPending || isStreaming}
            onClick={() => newSessionMutation.mutate()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            <MessageSquarePlus size={17} /> New chat
          </button>
          <h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Recent chats
          </h2>
          {sessions.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No chats yet. Start a new chat.</p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => {
                const id = session.id || session._id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => {
                      if (isStreaming) return;
                      setSessionId(id);
                      setLevel(
                        session.levelAtCreation || user?.currentLevel || "Beginner"
                      );
                      setNotice("");
                    }}
                    className={`w-full truncate rounded-xl px-3 py-2.5 text-left text-sm ${
                      id === sessionId
                        ? "bg-violet-50 font-semibold text-violet-800"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {session.title}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className={`${cardClass} flex min-h-[65vh] flex-col`}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div>
              <h1 className="font-bold">AI Learning Tutor</h1>
              <p className="mt-1 text-xs text-slate-500">
                Ask questions about your courses and learning topics.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Level
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                disabled={isStreaming}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"
              >
                {["Beginner", "Intermediate", "Advanced"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {!sessionId ? (
              <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
                <Sparkles className="text-violet-600" size={32} />
                <p className="mt-3 font-semibold">Your AI tutor is ready</p>
                <p className="mt-1 text-sm text-slate-500">
                  Create a chat to ask your first question.
                </p>
              </div>
            ) : sessionMessages.length === 0 ? (
              <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
                <Sparkles className="text-violet-600" size={32} />
                <p className="mt-3 font-semibold">What would you like to learn?</p>
                <p className="mt-1 text-sm text-slate-500">
                  Your tutor adapts to your level and progress.
                </p>
              </div>
            ) : (
              sessionMessages.map((item, index) => {
                const isUser = item.role === "user";
                const isStreaming = item.streaming;
                const content = isStreaming ? streamText : item.content;
                return (
                  <article
                    key={`${item.createdAt || "pending"}-${index}`}
                    className={`max-w-[90%] rounded-2xl p-4 ${
                      isUser
                        ? "ml-auto bg-violet-600 text-white"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {content || (isStreaming ? "Thinking..." : "")}
                    </p>
                    {!isUser && !isStreaming && (
                      <button
                        type="button"
                        aria-label="Copy tutor response"
                        onClick={() =>
                          void navigator.clipboard.writeText(item.content).then(
                            () => setNotice("Response copied."),
                            () => setNotice("Unable to copy the response.")
                          )
                        }
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700"
                      >
                        <Copy size={13} /> Copy
                      </button>
                    )}
                  </article>
                );
              })
            )}
            {fallback && (
              <p
                className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800"
                role="status"
              >
                AI service is unavailable. This reply was generated by the built-in tutor.
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="border-t border-slate-100 p-4">
            <label className="sr-only" htmlFor="tutor-message">
              Message your tutor
            </label>
            <div className="flex items-end gap-3">
              <textarea
                id="tutor-message"
                rows={2}
                maxLength={5000}
                value={message}
                disabled={!activeSessionId || isStreaming}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  activeSessionId
                    ? "Ask your tutor a question..."
                    : "Create a chat to begin"
                }
                className="min-h-12 flex-1 resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stop}
                  className="rounded-xl bg-slate-800 p-3 text-white"
                  aria-label="Stop generating"
                >
                  <Square size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!message.trim() || !activeSessionId}
                  className="rounded-xl bg-violet-600 p-3 text-white disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
