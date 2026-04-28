import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";
import AuthContext from "./AuthContextStore";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    apiRequest("/api/auth/me", { method: "GET" })
      .then((data) => {
        if (!ignore) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (!ignore) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const refreshUser = async () => {
    const data = await apiRequest("/api/auth/me", { method: "GET" });
    setUser(data.user);
    return data.user;
  };

  const login = async (payload) => {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await apiRequest("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
