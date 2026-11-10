import { useState } from "react";
import { BrainCircuit, Eye, EyeOff } from "lucide-react";

function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const users = JSON.parse(localStorage.getItem("demoUsers") || "[]");

    if (isRegister) {
      if (password.length < 6) {
        setError("Password must contain at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (users.some((user) => user.email === email)) {
        setError("An account with this email already exists.");
        return;
      }

      const newUser = { name, email, password };
      localStorage.setItem("demoUsers", JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } else {
      const user = users.find(
        (item) => item.email === email && item.password === password
      );

      if (!user) {
        setError("Invalid email or password.");
        return;
      }

      onLogin(user);
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
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
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
