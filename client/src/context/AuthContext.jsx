import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiPost, apiRequest, setUnauthorizedHandler } from "../api/client";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {});
    } finally {
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      queryClient.clear();
    });
    apiRequest("/auth/me")
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((error) => {
        if (error.status !== 401) console.error("Unable to restore session:", error);
        setUser(null);
      })
      .finally(() => setLoading(false));

    return () => setUnauthorizedHandler(() => {});
  }, [queryClient]);

  const login = useCallback(async (credentials) => {
    const { user: signedInUser } = await apiPost("/auth/login", credentials);
    setUser(signedInUser);
    return signedInUser;
  }, []);

  const register = useCallback(async (details) => {
    const { user: registeredUser } = await apiPost("/auth/register", details);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
