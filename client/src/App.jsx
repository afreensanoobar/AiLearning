import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Auth from "./Auth";
import { AuthProvider } from "./context/AuthContext";
import { AdminRoute, ProtectedRoute } from "./context/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import LearningApp from "./LearningApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => error.status !== 401 && count < 1,
      refetchOnWindowFocus: false,
    },
  },
});

const protectedPages = [
  ["/dashboard", "dashboard"],
  ["/courses", "courses"],
  ["/courses/:slug", "course"],
  ["/assessment", "assessment"],
  ["/tutor", "tutor"],
  ["/progress", "progress"],
  ["/settings", "settings"],
];

function PublicAuthRoute({ mode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading your account...
      </div>
    );
  }
  if (user)
    return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;
  return <Auth key={mode} initialMode={mode} />;
}

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-slate-800">Page not found</h1>
      <p className="text-slate-500">The page you requested does not exist.</p>
      <a className="font-semibold text-violet-700" href="/dashboard">
        Return to LearnAI
      </a>
    </main>
  );
}

function AdminPlaceholder() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <h1 className="text-2xl font-bold">Admin workspace</h1>
      <p className="mt-2 text-slate-500">Admin tools will be added in M13.</p>
    </main>
  );
}

function ApplicationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicAuthRoute mode="login" />} />
      <Route path="/register" element={<PublicAuthRoute mode="register" />} />
      {protectedPages.map(([path, key]) => (
        <Route
          key={key}
          path={path}
          element={
            <ProtectedRoute>
              <LearningApp />
            </ProtectedRoute>
          }
        />
      ))}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminPlaceholder />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ApplicationRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
