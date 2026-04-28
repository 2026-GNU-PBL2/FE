import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { label: "나의 파티", to: "/myparty", requireAuth: true },
  { label: "이벤트", to: "/event", requireAuth: false },
  { label: "서비스 소개", to: "/about", requireAuth: false },
  { label: "고객센터", to: "/support", requireAuth: false },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { accessToken, authStatus, isAuthenticated } = useAuthStore();
  const isLoggedIn =
    Boolean(accessToken) && isAuthenticated && authStatus === "authenticated";

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
    <header className="sticky top-0 z-50 border-b border-slate-100/70 bg-white/70 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link
          to="/"
          onClick={scrollToTop}
          className="group flex items-center gap-2"
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <img
              src="/images/logo-symbol.png"
              alt="Submate"
              className="h-6 w-6 object-contain"
            />
            <span className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-md transition group-hover:opacity-100" />
          </span>

          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Submate
          </span>

          <span className="ml-1 hidden rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 sm:inline-flex">
            Beta
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.to}
              type="button"
              onClick={() => handleProtectedRoute(item.to, item.requireAuth)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={handleNotificationClick}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="알림"
              >
                <Icon icon="mdi:bell-outline" className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              <button
                type="button"
                onClick={handleProfileClick}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                aria-label="마이페이지"
              >
                <Icon icon="mdi:account-outline" className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              to="/log-in"
              onClick={scrollToTop}
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand-main shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
            >
              시작하기
              <span className="ml-2 inline-block rounded-full bg-brand-accent/20 px-2 py-0.5 text-[11px] font-semibold text-brand-main">
                소셜로그인
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
