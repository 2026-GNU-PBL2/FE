import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function SetupRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const isLoggedIn = Boolean(accessToken) && isAuthenticated;

  if (!isLoggedIn) {
    return <Navigate to="/log-in" replace />;
  }

  if (user?.status === "PENDING_SIGNUP") {
    return <Outlet />;
  }

  if (user?.status === "ACTIVE") {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/log-in" replace />;
}
