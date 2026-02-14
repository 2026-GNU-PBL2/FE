// src/shared/ui/Header.tsx
import {
  Bell,
  User,
  LayoutDashboard,
  Sparkles,
  Users,
  Trophy,
} from "lucide-react";
import { useMemo } from "react";
import { useNavStore } from "@/stores/useNavStore";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { useNavigate } from "react-router-dom";

type PageId = "dashboard" | "swap" | "party" | "savings";

export const Header = () => {
  const currentPage = useNavStore((s) => s.currentPage) as PageId;
  const navigateTab = useNavStore((s) => s.navigate) as (id: PageId) => void;

  const nav = useNavigate();
  const { scrollToTop } = useScrollToTop();

  const navItems = useMemo(
    () =>
      [
        { id: "dashboard" as const, label: "대시보드", icon: LayoutDashboard },
        { id: "swap" as const, label: "스마트 스왑", icon: Sparkles },
        { id: "party" as const, label: "파티", icon: Users },
        { id: "savings" as const, label: "챌린지", icon: Trophy },
      ] as const,
    [],
  );

  const go = (id: PageId) => {
    navigateTab(id);
    scrollToTop();
  };

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <button
              type="button"
              className="group inline-flex items-center gap-2"
              onClick={() => go("dashboard")}
              aria-label="대시보드로"
            >
              <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <img
                  src="/images/logo-symbol.png"
                  alt="Sub-Life"
                  className="h-6 w-6 object-contain"
                />
                <span className="pointer-events-none absolute -inset-1 rounded-2xl bg-brand-sub/10 opacity-0 blur-md transition group-hover:opacity-100" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                SubLife
              </span>
              <span className="ml-1 hidden rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 sm:inline-flex">
                Beta
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className={[
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-brand-main/10 text-brand-main ring-1 ring-brand-main/15"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right icons (icon-only) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-50 hover:text-brand-main"
              aria-label="알림"
              onClick={() => nav("/notifications")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="프로필"
              onClick={() => nav("/mypage")}
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (불투명 고정) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-4 px-2">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className="flex flex-col items-center justify-center gap-1 px-2 py-3"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={[
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl transition",
                    active
                      ? "bg-brand-main/10 text-brand-main ring-1 ring-brand-main/15"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  <item.icon className="h-5 w-5" />
                </span>

                <span
                  className={[
                    "text-[11px] font-extrabold",
                    active ? "text-brand-main" : "text-slate-500",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
