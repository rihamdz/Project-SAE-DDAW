import { Navigate, Outlet } from "react-router-dom";
import { hasRole, useAuth } from "./AuthProvider";
import type { Role } from "../types/auth";

export function RequireAuth() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth();

  // si user pas encore chargé, on laisse passer (ou tu peux mettre un loader)
  if (!user) return <Outlet />;

  if (!hasRole(user, roles)) return <Navigate to="/login" replace />;
  return <Outlet />;
}
