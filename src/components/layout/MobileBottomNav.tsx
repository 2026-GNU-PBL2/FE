import { Icon } from "@iconify/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  {
    label: "나의 파티",
    to: "/party",
    icon: "mdi:account-group-outline",
    requireAuth: true,
  },
  { label: "이벤트", to: "/event", icon: "mdi:gift-outline" },
  { label: "서비스 소개", to: "/about", icon: "mdi:information-outline" },
  { label: "고객센터", to: "/support", icon: "mdi:headset" },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleRoute = (e: React.MouseEvent, requireAuth?: boolean) => {
    if (requireAuth && !isAuthenticated) {
      e.preventDefault();
      navigate("/log-in");
    }
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-4 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={(e) => handleRoute(e, item.requireAuth)}
            className="flex flex-col items-center justify-center gap-1 px-2 py-3"
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl transition",
                    isActive
                      ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  <Icon icon={item.icon} className="h-5 w-5" />
                </span>

                <span
                  className={[
                    "text-[11px] font-semibold",
                    isActive ? "text-slate-900" : "text-slate-500",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
