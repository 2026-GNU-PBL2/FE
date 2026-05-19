import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import HomePage from "@/pages/home/HomePage";
import LandingPage from "@/pages/landing/LandingPage";

export default function RootRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const isLoggedIn = Boolean(accessToken) && isAuthenticated;

  if (accessToken && (authStatus === "idle" || authStatus === "checking")) {
    return null;
  }

  if (!isLoggedIn) {
    return <LandingPage />;
  }

  if (user?.status === "PENDING_SIGNUP") {
    return <Navigate to="/setup/intro" replace />;
  }

  if (user?.status === "ACTIVE") {
    return <HomePage />;
  }

  return <Navigate to="/log-in" replace />;
}
