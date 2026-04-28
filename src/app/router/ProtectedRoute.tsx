// src/app/router/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function ProtectedRoute() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);

  const isLoggedIn = Boolean(accessToken) && isAuthenticated;

  if (authStatus === "idle" || authStatus === "checking") {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/log-in" replace state={{ from: location }} />;
  }

  if (user?.status === "PENDING_SIGNUP") {
    return <Navigate to="/setup/intro" replace />;
  }

  if (user?.status !== "ACTIVE") {
    return <Navigate to="/log-in" replace />;
  }

  return <Outlet />;
}
