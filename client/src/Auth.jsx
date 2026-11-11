import { useState } from "react";
import { ArrowRight, BookOpen, BrainCircuit, Eye, EyeOff, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";

function Auth({ initialMode = "login" }) {
  const [isRegister, setIsRegister] = useState(initialMode === "register");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) await register({ name, email, password });
      else await login({ email, password });
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to authenticate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-10">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1fr_0.92fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-violet-700 p-10 text-white lg:flex xl:p-14">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -bottom-48 -left-20 h-[30rem] w-[30rem] rounded-full border border-white/10" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-violet-700">
              <BrainCircuit aria-hidden="true" size={23} />
            </span>
            <span className="text-lg font-bold tracking-tight">LearnAI</span>
          </div>

          <div className="relative max-w-lg py-16">
            <p className="flex items-center gap-2 text-sm font-semibold text-violet-100">
              <Sparkles aria-hidden="true" size={16} />A clearer path to web development
            </p>
            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Learn with direction. Build with confidence.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-violet-100">
              Courses, practice, progress, and an AI tutor work together to help you take
              the next useful step.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["HTML", "CSS", "JavaScript", "React"].map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-sm font-medium text-white/90"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3 border-t border-white/15 pt-5 text-sm text-violet-100">
            <BookOpen aria-hidden="true" size={18} />
            <span>Pick up where you left off, at your own pace.</span>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                <BrainCircuit aria-hidden="true" size={21} />
              </span>
              <span className="text-base font-bold tracking-tight text-slate-800">
                LearnAI
              </span>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
              {isRegister ? "Get started" : "Welcome back"}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
              {isRegister ? "Create your account" : "Continue learning"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isRegister
                ? "Create your learning space and start with one lesson."
                : "Sign in to pick up where you left off."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {isRegister && (
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="name"
                >
                  Full name
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>
              )}

              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                Email address
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>

              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Password
                <span className="relative mt-2 block">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={isRegister ? 8 : undefined}
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-14 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" size={19} />
                    ) : (
                      <Eye aria-hidden="true" size={19} />
                    )}
                  </button>
                </span>
              </label>

              {isRegister && (
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="confirm-password"
                >
                  Confirm password
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>
              )}

              {error && (
                <p
                  id="auth-error"
                  role="alert"
                  className="text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Please wait..."
                  : isRegister
                    ? "Create your account"
                    : "Sign in"}
                {!submitting && <ArrowRight aria-hidden="true" size={18} />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              {isRegister ? "Already have an account?" : "New to LearnAI?"}
              <button
                type="button"
                onClick={() => {
                  const nextIsRegister = !isRegister;
                  setIsRegister(nextIsRegister);
                  setError("");
                  navigate(nextIsRegister ? "/register" : "/login", {
                    replace: true,
                    state: location.state,
                  });
                }}
                className="ml-2 font-semibold text-violet-700 underline-offset-4 hover:underline"
              >
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-slate-500">
              By continuing, you agree to LearnAI’s{" "}
              <Link className="font-medium text-violet-700 hover:underline" to="/terms">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="font-medium text-violet-700 hover:underline" to="/privacy">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Auth;
