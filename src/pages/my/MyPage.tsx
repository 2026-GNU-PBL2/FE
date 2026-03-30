import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import MyPageLayout from "./MyPageLayout";

export default function MyPage() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/log-in" replace />;
  }

  return <MyPageLayout />;
}
