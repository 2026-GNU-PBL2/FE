import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "@/api/axios";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { label: "나의 파티", to: "/myparty", requireAuth: true },
  { label: "이벤트", to: "/event", requireAuth: false },
  { label: "서비스 소개", to: "/about", requireAuth: false },
  { label: "고객센터", to: "/support", requireAuth: false },
];

type UnreadCountResponse = {
  count: number;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

function unwrapResponse<T>(
  value: T | ApiEnvelope<T> | undefined | null,
): T | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null) {
    const maybeEnvelope = value as ApiEnvelope<T>;

    if (maybeEnvelope.data !== undefined) return maybeEnvelope.data;
    if (maybeEnvelope.result !== undefined) return maybeEnvelope.result;
    if (maybeEnvelope.payload !== undefined) return maybeEnvelope.payload;
  }

  return value as T;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, authStatus, isAuthenticated } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const isLoggedIn =
    Boolean(accessToken) && isAuthenticated && authStatus === "authenticated";
  const unreadBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const isActiveNav = (to: string) => {
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }

    try {
      const response = await api.get("/api/v1/notifications/unread-count");
      const data = unwrapResponse<UnreadCountResponse>(response.data);

      setUnreadCount(typeof data?.count === "number" ? data.count : 0);
    } catch (error) {
      console.error(error);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchUnreadCount();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchUnreadCount, location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleProtectedRoute = (to: string, requireAuth?: boolean) => {
    scrollToTop();

    if (requireAuth && !isLoggedIn) {
      navigate("/log-in");
      return;
    }

    navigate(to);
  };

  const handleProfileClick = () => {
    scrollToTop();
    navigate("/mypage");
  };

  const handleNotificationClick = () => {
    scrollToTop();
    navigate("/notification");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={scrollToTop}
          className="group flex items-center gap-2.5"
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-[14px] bg-slate-50 shadow-sm ring-1 ring-slate-200/80">
            <img
              src="/images/logo-symbol.png"
              alt="Submate"
              className="h-6 w-6 object-contain"
            />
          </span>

          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Submate
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = isActiveNav(item.to);

            return (
              <button
                key={item.to}
                type="button"
                onClick={() => handleProtectedRoute(item.to, item.requireAuth)}
                className={[
                  "inline-flex h-10 items-center rounded-full px-5 text-[15px] font-bold transition",
                  isActive
                    ? "bg-slate-100 text-slate-950 ring-1 ring-slate-200/80"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={handleNotificationClick}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="알림"
              >
                <Icon icon="mdi:bell-outline" className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white">
                    {unreadBadgeLabel}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleProfileClick}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="마이페이지"
              >
                <Icon icon="mdi:account-outline" className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              to="/log-in"
              onClick={scrollToTop}
              className="inline-flex h-10 items-center justify-center rounded-full bg-white px-3.5 text-sm font-bold text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:shadow-md active:scale-95"
            >
              시작하기
              <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-brand-main">
                소셜로그인
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
