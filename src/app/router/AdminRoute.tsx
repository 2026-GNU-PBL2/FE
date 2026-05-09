import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "@/api/axios";
import { useAuthStore } from "@/stores/authStore";

export default function AdminRoute() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authStatus = useAuthStore((state) => state.authStatus);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isAdminAllowed, setIsAdminAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (authStatus === "idle" || authStatus === "checking") {
      return;
    }

    if (!accessToken) {
      setIsAdminAllowed(false);
      return;
    }

    setIsAdminAllowed(null);

    async function checkAdminPermission() {
      try {
        const response = await api.get("/api/v1/admin/check", {
          validateStatus: (status) =>
            status === 200 || status === 401 || status === 403,
        });

        if (!isMounted) return;

        if (response.status === 200) {
          setIsAdminAllowed(true);
          return;
        }

        if (response.status === 401) {
          clearAuth();
        }

        setIsAdminAllowed(false);
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setIsAdminAllowed(false);
        }
      }
    }

    void checkAdminPermission();

    return () => {
      isMounted = false;
    };
  }, [accessToken, authStatus, clearAuth]);

  if (
    authStatus === "idle" ||
    authStatus === "checking" ||
    isAdminAllowed === null
  ) {
    return null;
  }

  if (!isAdminAllowed) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
