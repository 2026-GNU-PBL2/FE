import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

export default function AdminPublicRoute() {
  const { isAdminAuthenticated } = useAdminAuthStore();

  if (isAdminAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}
