import { Icon } from "@iconify/react";
import {
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

type SidebarMenuItem = {
  label: string;
  icon: string;
  to: string;
};

type SidebarMenuSection = {
  title: string;
  items: SidebarMenuItem[];
};

const sidebarSections: SidebarMenuSection[] = [
  {
    title: "계정",
    items: [
      {
        label: "내 정보 관리",
        icon: "solar:user-id-bold",
        to: "/mypage/profile",
      },
      {
        label: "설정",
        icon: "solar:settings-bold",
        to: "/mypage/settings",
      },
    ],
  },
  {
    title: "결제 / 정산",
    items: [
      {
        label: "결제 관리",
        icon: "solar:card-bold",
        to: "/mypage/payment-method",
      },
      {
        label: "머니 관리",
        icon: "solar:wallet-money-bold",
        to: "/mypage/money",
      },
    ],
  },
  {
    title: "이용 내역",
    items: [
      {
        label: "파티 히스토리",
        icon: "solar:clock-circle-bold",
        to: "/mypage/party-history",
      },
      {
        label: "메일함",
        icon: "solar:inbox-bold",
        to: "/mypage/mailbox",
      },
      {
        label: "위반 이력",
        icon: "solar:shield-warning-bold",
        to: "/mypage/violations",
      },
    ],
  },
];

const allMenuItems = sidebarSections.flatMap((section) => section.items);

function getCurrentMenuMeta(pathname: string) {
  const currentItem = allMenuItems.find((item) => pathname.startsWith(item.to));

  if (!currentItem) {
    return {
      title: "마이페이지",
      icon: "solar:widget-4-bold",
    };
  }

  return {
    title: currentItem.label,
    icon: currentItem.icon,
  };
}

export default function MyPageLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  if (!user) {
    return null;
  }

  if (location.pathname === "/mypage") {
    return <Navigate to="/mypage/profile" replace />;
  }

  const displayName = user.nickname?.trim() || "닉네임 미설정";
  const displayEmail = user.submateEmail?.trim() || "이메일 미등록";
  const currentMenu = getCurrentMenuMeta(location.pathname);

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-full bg-brand-bg">
      <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-6 md:pb-6 lg:px-8 lg:pt-8 lg:pb-8">
        <div className="space-y-4 sm:space-y-5">
          <section className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200">
            <div className="px-5 py-6 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                    <Icon
                      icon="solar:user-bold"
                      className="h-7 w-7"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold text-rose-700">
                      MY PAGE
                    </p>
                    <h1 className="mt-2 truncate text-[28px] font-extrabold leading-tight tracking-tight text-slate-950">
                      {displayName}
                    </h1>
                    <p className="mt-2 truncate text-sm font-semibold leading-6 text-slate-500">
                      {displayEmail}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-5">
            <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
              <div className="rounded-[28px] bg-white p-4 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
                <div className="flex items-center justify-between px-2 pb-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                      DASHBOARD
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      메뉴
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Icon icon="solar:widget-4-bold" className="h-5 w-5" />
                  </div>
                </div>

                <nav className="space-y-4">
                  {sidebarSections.map((section) => (
                    <div key={section.title}>
                      <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                        {section.title}
                      </p>

                      <div className="space-y-1.5">
                        {section.items.map((item) => (
                          <DesktopMenuLink key={item.to} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-slate-100 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                  >
                    <Icon icon="solar:logout-2-bold" className="h-5 w-5" />
                    로그아웃
                  </button>
                </div>
              </div>
            </aside>

            <section className="min-w-0">
              <div className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-100 sm:h-11 sm:w-11">
                      <Icon icon={currentMenu.icon} className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 sm:text-xs">
                        ACCOUNT
                      </p>
                      <h3 className="mt-1 truncate text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
                        {currentMenu.title}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 xl:hidden">
                    <MobileMenuTabs />
                  </div>
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                  <Outlet />
                </div>
              </div>

              <div className="mt-3 xl:hidden">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-14 w-full items-center justify-center gap-2.5 rounded-[20px] border border-slate-200 bg-white px-4 text-base font-bold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
                >
                  <Icon icon="solar:logout-2-bold" className="h-6 w-6" />
                  로그아웃
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopMenuLink({ item }: { item: SidebarMenuItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-[20px] px-3 py-3 transition-all",
          isActive
            ? "bg-slate-100 text-slate-950 ring-1 ring-slate-200"
            : "text-slate-700 hover:bg-slate-50",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all",
              isActive
                ? "bg-white text-slate-900 ring-1 ring-slate-200"
                : "bg-slate-100 text-slate-700 group-hover:bg-slate-200",
            ].join(" ")}
          >
            <Icon icon={item.icon} className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{item.label}</p>
          </div>

          <Icon
            icon="solar:alt-arrow-right-linear"
            className={[
              "h-4 w-4 shrink-0 transition-all",
              isActive ? "text-slate-500" : "text-slate-400",
            ].join(" ")}
          />
        </>
      )}
    </NavLink>
  );
}

function MobileMenuTabs() {
  return (
    <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:-mx-6 sm:px-6">
      <div className="flex min-w-max gap-2">
        {allMenuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "inline-flex h-[52px] items-center gap-2.5 whitespace-nowrap rounded-2xl border px-4 text-sm font-bold transition-all",
                isActive
                  ? "border-slate-200 bg-white text-slate-950 shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
              ].join(" ")
            }
          >
            <Icon icon={item.icon} className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
