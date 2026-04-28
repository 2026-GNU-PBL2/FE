import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import MyPageLayout from "./MyPageLayout";

export default function MyPage() {
  const { accessToken, authStatus, user, isAuthenticated } = useAuthStore();
  const isLoggedIn =
    Boolean(accessToken) && isAuthenticated && authStatus === "authenticated";

  if (!isLoggedIn || !user) {
    return <Navigate to="/log-in" replace />;
  }

  return <MyPageLayout />;
}
