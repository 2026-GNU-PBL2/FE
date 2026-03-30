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
        label: "암호 관리",
        icon: "solar:lock-password-bold",
        to: "/mypage/password",
      },
      {
        label: "설정",
        icon: "solar:settings-bold",
        to: "/mypage/settings",
      },
    ],
  },
  {
    title: "결제",
    items: [
      {
        label: "결제 수단 관리",
        icon: "solar:card-bold",
        to: "/mypage/payment-method",
      },
      {
        label: "머니 관리",
        icon: "solar:wallet-money-bold",
        to: "/mypage/money",
      },
      {
        label: "결제 / 적립 내역",
        icon: "solar:bill-list-bold",
        to: "/mypage/payment-history",
      },
    ],
  },
  {
    title: "이용",
    items: [
      {
        label: "파티 히스토리",
        icon: "solar:clock-circle-bold",
        to: "/mypage/party-history",
      },
    ],
  },
];

const allMenuItems = sidebarSections.flatMap((section) => section.items);

function getCurrentMenuMeta(pathname: string) {
  const currentItem = allMenuItems.find((item) => item.to === pathname);

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

  // TODO: 실제 API 연결 전 더미값
  const moneyBalance = "12,400원";

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-4 sm:space-y-5">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:rounded-[28px]">
            <div className="relative overflow-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
              <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(135deg,#eff6ff_0%,#ecfeff_45%,#f8fafc_100%)] sm:h-24" />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-100/70 blur-2xl sm:h-32 sm:w-32" />
              <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-teal-100/70 blur-2xl sm:h-24 sm:w-24" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1E3A8A_0%,#2563EB_70%,#2DD4BF_140%)] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] sm:h-14 sm:w-14">
                    <Icon
                      icon="solar:user-bold"
                      className="h-6 w-6 sm:h-7 sm:w-7"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 sm:text-xs">
                      MY PAGE
                    </p>
                    <h1 className="mt-1 truncate text-xl font-bold text-slate-900 sm:text-2xl lg:text-[28px]">
                      {displayName}
                    </h1>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  <MoneyBadge value={moneyBalance} />
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-5">
            <aside className="hidden xl:block xl:sticky xl:top-24 xl:self-start">
              <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
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
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:rounded-[28px]">
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dbeafe_0%,#ccfbf1_100%)] text-blue-800 sm:h-11 sm:w-11">
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
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
                >
                  <Icon icon="solar:logout-2-bold" className="h-5 w-5" />
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
            ? "bg-slate-900 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
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
                ? "bg-white/15 text-white"
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
              isActive ? "text-white/80" : "text-slate-400",
            ].join(" ")}
          />
        </>
      )}
    </NavLink>
  );
}

function MobileMenuTabs() {
  return (
    <div className="-mx-4 overflow-x-auto no-scrollbar px-4 sm:-mx-6 sm:px-6">
      <div className="flex min-w-max gap-2">
        {allMenuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-all",
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
              ].join(" ")
            }
          >
            <Icon icon={item.icon} className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function MoneyBadge({ value }: { value: string }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:px-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dbeafe_0%,#ccfbf1_100%)] text-blue-800">
        <Icon icon="solar:wallet-money-bold" className="h-4 w-4" />
      </div>

      <div>
        <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">
          SUBMATE MONEY
        </p>
        <p className="text-sm font-bold text-slate-900 sm:text-base">{value}</p>
      </div>
    </div>
  );
}
