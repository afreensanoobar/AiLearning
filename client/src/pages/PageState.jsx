export function PageLoading({ label = "Loading..." }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
    >
      {label}
    </div>
  );
}

export function PageError({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
    >
      <p>{error?.message || "Unable to load this page."}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 font-semibold underline">
          Try again
        </button>
      )}
    </div>
  );
}

export function PageNotice({ children, error = false }) {
  if (!children) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mb-5 rounded-xl p-3 text-sm ${
        error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {children}
    </p>
  );
}
