import React, { createContext, useContext, useMemo, useState } from "react";
import type { Role, User } from "../types/auth";
import { authService } from "../services/auth.service";
import { useEffect } from "react";


type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  const tokenInStorage = localStorage.getItem("token");
  if (!tokenInStorage) return;

  // Si token existe mais user pas encore chargé
  if (!user) {
    setIsLoading(true);
    authService
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      localStorage.setItem("token", res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout, setUser }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

export function hasRole(user: User | null, roles: Role[]) {
  return !!user && roles.includes(user.role);
}
