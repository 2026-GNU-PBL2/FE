import { useEffect } from "react";
import axios from "axios";
import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import { API_BASE_URL } from "@/api/axios";
import {
  useAuthStore,
  type AuthUser,
  type UserRole,
  type UserStatus,
} from "@/stores/authStore";

interface UserMeResponse {
  id: number;
  nickname: string | null;
  submateEmail: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;
}

function normalizeUser(data: UserMeResponse): AuthUser {
  return {
    id: data.id,
    nickname: data.nickname,
    submateEmail: data.submateEmail,
    phoneNumber: data.phoneNumber,
    role: data.role,
    status: data.status,
  };
}

export default function RouterRoot() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authStatus = useAuthStore((state) => state.authStatus);
  const setAuthChecking = useAuthStore((state) => state.setAuthChecking);
  const setVerifiedUser = useAuthStore((state) => state.setVerifiedUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const isMyPageDashboardRoute = location.pathname.startsWith("/mypage");

  useEffect(() => {
    if (!accessToken) {
      clearAuth();
      return;
    }

    setAuthChecking();

    const controller = new AbortController();

    const verifyAuth = async () => {
      try {
        const response = await axios.get<UserMeResponse>(
          `${API_BASE_URL}/api/v1/user`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
            withCredentials: true,
          },
        );

        setVerifiedUser(normalizeUser(response.data));
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        clearAuth();
      }
    };

    void verifyAuth();

    return () => {
      controller.abort();
    };
  }, [accessToken, clearAuth, setAuthChecking, setVerifiedUser]);

  if (authStatus === "checking") {
    return (
      <>
        {!isMyPageDashboardRoute && <ScrollToTop />}
        <div className="flex min-h-screen items-center justify-center bg-brand-bg">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-brand-main border-t-transparent"
            role="status"
            aria-label="인증 확인 중"
          />
        </div>
      </>
    );
  }

  return (
    <>
      {!isMyPageDashboardRoute && <ScrollToTop />}
      <Outlet />
    </>
  );
}
