import { useState } from "react";
import { BrainCircuit, Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <div className="flex justify-center mb-5">
          <div className="rounded-2xl bg-violet-600 p-4 text-white">
            <BrainCircuit size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-800">
          {isRegister ? "Create Your Account" : "Welcome Back!"}
        </h1>

        <p className="text-center text-sm text-slate-500 mt-2 mb-7">
          {isRegister
            ? "Join LearnAI and personalize your learning."
            : "Login to continue your learning journey."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border p-3 outline-none focus:border-violet-500"
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border p-3 outline-none focus:border-violet-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={isRegister ? 8 : undefined}
              required
              className="w-full rounded-xl border p-3 pr-12 outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-slate-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {isRegister && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border p-3 outline-none focus:border-violet-500"
            />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700"
          >
            {submitting ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => {
              const nextIsRegister = !isRegister;
              setIsRegister(nextIsRegister);
              setError("");
              navigate(nextIsRegister ? "/register" : "/login", {
                replace: true,
                state: location.state,
              });
            }}
            className="ml-2 font-semibold text-violet-600"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
