import { Icon } from "@iconify/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  {
    label: "나의 파티",
    to: "/myparty",
    icon: "mdi:account-group-outline",
    requireAuth: true,
  },
  { label: "이벤트", to: "/event", icon: "mdi:gift-outline" },
  { label: "서비스 소개", to: "/about", icon: "mdi:information-outline" },
  { label: "고객센터", to: "/support", icon: "mdi:headset" },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const { accessToken, authStatus, isAuthenticated } = useAuthStore();
  const isLoggedIn =
    Boolean(accessToken) && isAuthenticated && authStatus === "authenticated";

  const handleRoute = (e: React.MouseEvent, requireAuth?: boolean) => {
    if (requireAuth && !isLoggedIn) {
      e.preventDefault();
      navigate("/log-in");
    }
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] md:hidden">
      <div className="mx-auto max-w-md rounded-[28px] border border-slate-200/80 bg-white/95 px-2 py-2 shadow-[0_12px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={(e) => handleRoute(e, item.requireAuth)}
              className="group flex min-w-0 flex-col items-center justify-center gap-1 rounded-3xl px-1.5 py-1.5 transition active:scale-95"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      "inline-flex h-10 w-10 items-center justify-center rounded-2xl transition",
                      isActive
                        ? "bg-blue-50 text-brand-main shadow-sm ring-1 ring-blue-100"
                        : "text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-700",
                    ].join(" ")}
                  >
                    <Icon icon={item.icon} className="h-[21px] w-[21px]" />
                  </span>

                  <span
                    className={[
                      "max-w-full truncate text-[11px] font-bold leading-4",
                      isActive ? "text-slate-900" : "text-slate-400",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
