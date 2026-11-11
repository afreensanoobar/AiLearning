import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiRequest } from "../api/client";
import { useAuth } from "../context/useAuth";
import AppShell from "../layout/AppShell";
import { PageError, PageLoading, PageNotice } from "./PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500";

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, setUser } = useAuth();
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const userQuery = useQuery({
    queryKey: ["users", "me"],
    queryFn: () => apiRequest("/users/me"),
  });
  const profileMutation = useMutation({
    mutationFn: (body) =>
      apiRequest("/users/me", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: ({ user }) => {
      setProfile(user);
      setUser(user);
      setNotice("Profile updated.");
      void queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
    onError: (error) => setNotice(error.message),
  });
  const passwordMutation = useMutation({
    mutationFn: (body) => apiPost("/users/me/password", body),
    onSuccess: async () => {
      setNotice("Password updated. Please sign in again.");
      await logout();
      navigate("/login", { replace: true });
    },
    onError: (error) => setNotice(error.message),
  });
  const clearMutation = useMutation({
    mutationFn: () => apiRequest("/users/me/progress", { method: "DELETE" }),
    onSuccess: () => {
      setNotice("All progress data has been cleared.");
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["progress"] }),
        queryClient.invalidateQueries({ queryKey: ["assessments"] }),
        queryClient.invalidateQueries({ queryKey: ["tutor"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["badges"] }),
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] }),
      ]);
    },
    onError: (error) => setNotice(error.message),
  });

  if (userQuery.isPending) {
    return (
      <AppShell activePage="Settings">
        <PageLoading label="Loading account settings..." />
      </AppShell>
    );
  }
  if (userQuery.isError) {
    return (
      <AppShell activePage="Settings">
        <PageError error={userQuery.error} onRetry={() => void userQuery.refetch()} />
      </AppShell>
    );
  }

  const saving =
    profileMutation.isPending || passwordMutation.isPending || clearMutation.isPending;
  const profileValues = profile ?? userQuery.data.user;

  return (
    <AppShell activePage="Settings">
      <PageNotice
        error={Boolean(
          profileMutation.error || passwordMutation.error || clearMutation.error
        )}
      >
        {notice}
      </PageNotice>
      <div className="mx-auto max-w-3xl space-y-6">
        <form
          className={cardClass}
          onSubmit={(event) => {
            event.preventDefault();
            profileMutation.mutate(profileValues);
          }}
        >
          <h2 className="text-lg font-bold">Profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Name
              <input
                className={inputClass}
                required
                maxLength={100}
                value={profileValues.name}
                onChange={(event) =>
                  setProfile({ ...profileValues, name: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium">
              Email
              <input
                className={inputClass}
                type="email"
                required
                value={profileValues.email}
                onChange={(event) =>
                  setProfile({ ...profileValues, email: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Time zone
              <input
                className={inputClass}
                required
                value={profileValues.timezone}
                onChange={(event) =>
                  setProfile({ ...profileValues, timezone: event.target.value })
                }
              />
            </label>
            <label className="flex items-center gap-3 text-sm font-medium sm:col-span-2">
              <input
                type="checkbox"
                checked={profileValues.showOnLeaderboard ?? true}
                onChange={(event) =>
                  setProfile({
                    ...profileValues,
                    showOnLeaderboard: event.target.checked,
                  })
                }
                className="h-4 w-4 accent-violet-600"
              />
              Show my display name on the leaderboard
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {profileMutation.isPending ? "Saving..." : "Save profile"}
          </button>
        </form>

        <form
          className={cardClass}
          onSubmit={(event) => {
            event.preventDefault();
            passwordMutation.mutate(passwords);
          }}
        >
          <h2 className="text-lg font-bold">Change password</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Current password
              <input
                className={inputClass}
                type="password"
                required
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  setPasswords({ ...passwords, currentPassword: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium">
              New password
              <input
                className={inputClass}
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={passwords.newPassword}
                onChange={(event) =>
                  setPasswords({ ...passwords, newPassword: event.target.value })
                }
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {passwordMutation.isPending ? "Updating..." : "Update password"}
          </button>
        </form>

        <section className={`${cardClass} border-red-100`}>
          <h2 className="text-lg font-bold text-red-700">Clear all progress data</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This permanently removes your assessment history, lesson progress, activity,
            study plan, and AI tutor conversations.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (
                window.confirm(
                  "Permanently clear all your learning progress and tutor chats?"
                )
              ) {
                clearMutation.mutate();
              }
            }}
            className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {clearMutation.isPending ? "Clearing..." : "Clear all progress"}
          </button>
        </section>
      </div>
    </AppShell>
  );
}
