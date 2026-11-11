import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import LandingPage from "./LandingPage";

export default function HomeRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="landing-page flex min-h-screen items-center justify-center">
        <p className="body-6 text-white/55" role="status">
          Loading LearnAI...
        </p>
      </main>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}
