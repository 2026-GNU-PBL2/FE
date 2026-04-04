import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

const titleMap: Record<string, string> = {
  "/admin/dashboard": "운영 대시보드",
  "/admin/products": "상품 관리",
  "/admin/users": "회원 관리",
  "/admin/parties": "파티 관리",
};

type AdminHeaderProps = {
  onOpenSidebar: () => void;
};

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const location = useLocation();
  const { adminUser } = useAdminAuthStore();

  const matchedEntry = Object.keys(titleMap).find((path) =>
    location.pathname.startsWith(path),
  );

  const title = matchedEntry ? titleMap[matchedEntry] : "관리자";

  const adminInitial = adminUser?.name?.slice(0, 2).toUpperCase() ?? "AD";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <Icon
              icon="solar:hamburger-menu-bold-duotone"
              className="h-5 w-5"
            />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Submate Admin
            </p>
            <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
          >
            <Icon icon="solar:calendar-bold-duotone" className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
          >
            <Icon icon="solar:bell-bing-bold-duotone" className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
            {adminInitial}
          </div>
        </div>
      </div>
    </header>
  );
}
