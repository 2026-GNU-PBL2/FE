// src/app/router/PublicRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function PublicRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);

  const isLoggedIn = Boolean(accessToken) && isAuthenticated;

  if (accessToken && (authStatus === "idle" || authStatus === "checking")) {
    return null;
  }

  if (!isLoggedIn) {
    return <Outlet />;
  }

  if (user?.status === "PENDING_SIGNUP") {
    return <Navigate to="/setup/intro" replace />;
  }

  if (user?.status === "ACTIVE") {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/log-in" replace />;
}
