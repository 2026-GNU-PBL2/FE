import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "@/api/axios";
import { useAuthStore } from "@/stores/authStore";

type AdminCheckState = {
  accessToken: string;
  allowed: boolean;
};

export default function AdminRoute() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authStatus = useAuthStore((state) => state.authStatus);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [adminCheck, setAdminCheck] = useState<AdminCheckState | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (authStatus === "idle" || authStatus === "checking") {
      return;
    }

    if (!accessToken) {
      return;
    }

    const checkedAccessToken = accessToken;

    async function checkAdminPermission() {
      try {
        const response = await api.get("/api/v1/admin/check", {
          validateStatus: (status) =>
            status === 200 || status === 401 || status === 403,
        });

        if (!isMounted) return;

        if (response.status === 200) {
          setAdminCheck({ accessToken: checkedAccessToken, allowed: true });
          return;
        }

        if (response.status === 401) {
          clearAuth();
        }

        setAdminCheck({ accessToken: checkedAccessToken, allowed: false });
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setAdminCheck({ accessToken: checkedAccessToken, allowed: false });
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
    (accessToken && adminCheck?.accessToken !== accessToken)
  ) {
    return null;
  }

  if (!accessToken || !adminCheck?.allowed) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
