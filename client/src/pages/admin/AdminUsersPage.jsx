import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiPatch, apiRequest } from "../../api/client";
import { useAuth } from "../../context/useAuth";
import { PageError, PageLoading, PageNotice } from "../PageState";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [notice, setNotice] = useState("");
  const users = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiRequest("/admin/users"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => apiPatch(`/admin/users/${id}`, body),
    onSuccess: () => {
      setNotice("User updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => setNotice(error.message),
  });

  if (users.isPending) return <PageLoading label="Loading users..." />;
  if (users.isError) {
    return <PageError error={users.error} onRetry={() => void users.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <PageNotice error={Boolean(updateMutation.error)}>{notice}</PageNotice>
      {(users.data.users ?? []).map((user) => {
        const isSelf = user.id === currentUser?.id;
        return (
          <article className={cardClass} key={user.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-bold">{user.name}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {user.currentLevel}
                  {user.deactivated ? " · deactivated" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isSelf || updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: user.id,
                      body: { role: user.role === "admin" ? "student" : "admin" },
                    })
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {user.role === "admin" ? "Make student" : "Make admin"}
                </button>
                <button
                  type="button"
                  disabled={isSelf || updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: user.id,
                      body: { deactivated: !user.deactivated },
                    })
                  }
                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {user.deactivated ? "Reactivate" : "Deactivate"}
                </button>
              </div>
            </div>
            {isSelf && (
              <p className="mt-3 text-xs text-slate-500">
                You cannot change your own role or deactivate your own account.
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
