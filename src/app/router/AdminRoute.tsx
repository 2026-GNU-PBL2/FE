import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

export default function AdminRoute() {
  const location = useLocation();
  const { isAdminAuthenticated } = useAdminAuthStore();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
