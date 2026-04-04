import { Icon } from "@iconify/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    label: "대시보드",
    to: "/admin/dashboard",
    icon: "solar:widget-5-bold-duotone",
  },
  {
    label: "상품 관리",
    to: "/admin/products",
    icon: "solar:box-bold-duotone",
  },
  {
    label: "회원 관리",
    to: "/admin/users",
    icon: "solar:users-group-rounded-bold-duotone",
  },
  {
    label: "파티 관리",
    to: "/admin/parties",
    icon: "solar:layers-bold-duotone",
  },
];

function SidebarContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { logout } = useAdminAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-18 shrink-0 items-center justify-between border-b border-slate-200 px-5">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-blue-900 to-cyan-400 text-white shadow-lg shadow-blue-900/15">
            <Icon icon="solar:shield-user-bold-duotone" className="h-5 w-5" />
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">Submate</p>
            <p className="text-xs text-slate-500">Admin Console</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
        >
          <Icon icon="solar:close-circle-bold-duotone" className="h-5 w-5" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-50 text-blue-900 shadow-sm ring-1 ring-inset ring-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")
              }
            >
              <div
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-xl transition",
                  "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
                ].join(" ")}
              >
                <Icon icon={item.icon} className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mt-auto shrink-0 border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Icon icon="solar:logout-3-bold-duotone" className="h-5 w-5" />
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({
  mobileOpen,
  onClose,
}: AdminSidebarProps) {
  return (
    <>
      <aside className="hidden h-screen w-[280px] shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:block">
        <SidebarContent onClose={onClose} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40"
          />
          <div className="absolute left-0 top-0 h-full w-[280px] max-w-[84vw] shadow-2xl">
            <SidebarContent onClose={onClose} />
          </div>
        </div>
      ) : null}
    </>
  );
}
