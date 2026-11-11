import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Auth from "./Auth";
import { AuthProvider } from "./context/AuthContext";
import { AdminRoute, ProtectedRoute } from "./context/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import AdminCourseDetailPage from "./pages/admin/AdminCourseDetailPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminQuestionsPage from "./pages/admin/AdminQuestionsPage";
import AdminStatsPage from "./pages/admin/AdminStatsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AssessmentPage from "./pages/AssessmentPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import HomeRoute from "./pages/HomeRoute";
import LegalPage from "./pages/LegalPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import TutorPage from "./pages/TutorPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => error.status !== 401 && count < 1,
      refetchOnWindowFocus: false,
    },
  },
});

const protectedPages = [
  ["/dashboard", DashboardPage],
  ["/courses", CoursesPage],
  ["/courses/:slug", CoursesPage],
  ["/assessment", AssessmentPage],
  ["/tutor", TutorPage],
  ["/progress", ProgressPage],
  ["/settings", SettingsPage],
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
    <main className="landing-page flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <p className="caption-3 uppercase tracking-[0.12em] text-white/50">LearnAI</p>
      <h1 className="heading-2">Page not found</h1>
      <p className="body-6 text-white/55">The page you requested does not exist.</p>
      <Link to="/" className="primary-button button-md">
        Return to LearnAI
      </Link>
    </main>
  );
}

function ApplicationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/privacy" element={<LegalPage />} />
      <Route path="/terms" element={<LegalPage />} />
      <Route path="/login" element={<PublicAuthRoute mode="login" />} />
      <Route path="/register" element={<PublicAuthRoute mode="register" />} />
      {protectedPages.map(([path, Page]) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <Page />
            </ProtectedRoute>
          }
        />
      ))}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminStatsPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="courses/:id" element={<AdminCourseDetailPage />} />
        <Route path="questions" element={<AdminQuestionsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
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
