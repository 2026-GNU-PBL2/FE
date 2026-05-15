import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/api/axios";
import AdminStatCard from "@/pages/admin/components/AdminStatCard";

type DashboardResponse = {
  operatingProductCount: number;
  activeMemberCount: number;
  recruitingPartyCount: number;
  failedPaymentCount: number;
  failedPaymentPartyCount: number;
  waitingMatchUserCount: number;
  recruitingPartyNoticeCount: number;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/api/v1/admin/dashboard");
        setData(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchDashboard();
  }, []);

  if (!data) {
    return (
      <div className="flex h-[360px] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-7 text-center ring-1 ring-slate-200">
          <Icon
            icon="solar:refresh-circle-bold-duotone"
            className="mx-auto h-10 w-10 animate-spin text-blue-700"
          />
          <p className="mt-4 text-sm font-bold text-slate-600">
            대시보드를 불러오는 중입니다
          </p>
        </div>
      </div>
    );
  }

  const alerts = [
    {
      id: "ALT-001",
      icon: "solar:danger-circle-bold-duotone",
      text: `결제 실패 파티가 ${data.failedPaymentPartyCount}건 있습니다.`,
      tone: "text-rose-600 bg-rose-50",
      link: "/admin/parties",
      linkText: "파티 관리로 이동",
    },
    {
      id: "ALT-002",
      icon: "solar:clock-circle-bold-duotone",
      text: `매칭 대기 중인 유저가 ${data.waitingMatchUserCount}명 있습니다.`,
      tone: "text-amber-600 bg-amber-50",
      link: "/admin/users",
      linkText: "회원 관리로 이동",
    },
    {
      id: "ALT-003",
      icon: "solar:users-group-rounded-bold-duotone",
      text: `현재 모집 중 파티 ${data.recruitingPartyCount}개 / 공지 필요 ${data.recruitingPartyNoticeCount}건`,
      tone: "text-blue-700 bg-blue-50",
      link: "/admin/parties",
      linkText: "모집 파티 확인",
    },
  ];

  const keyMetrics = [
    {
      label: "운영 상품",
      value: data.operatingProductCount,
      description: "현재 운영 중인 상품",
      icon: "solar:box-bold-duotone",
      tone: "blue" as const,
    },
    {
      label: "활성 회원",
      value: data.activeMemberCount,
      description: "서비스 이용 회원",
      icon: "solar:users-group-rounded-bold-duotone",
      tone: "mint" as const,
    },
    {
      label: "모집 파티",
      value: data.recruitingPartyCount,
      description: "현재 모집 진행",
      icon: "solar:layers-bold-duotone",
      tone: "amber" as const,
    },
    {
      label: "결제 실패",
      value: data.failedPaymentCount,
      description: "전체 실패 건수",
      icon: "solar:card-bold-duotone",
      tone: "rose" as const,
    },
    {
      label: "실패 파티",
      value: data.failedPaymentPartyCount,
      description: "문제 발생 파티",
      icon: "solar:danger-triangle-bold-duotone",
      tone: "rose" as const,
    },
    {
      label: "매칭 대기",
      value: data.waitingMatchUserCount,
      description: "자동 매칭 대기",
      icon: "solar:clock-circle-bold-duotone",
      tone: "amber" as const,
    },
    {
      label: "공지 필요",
      value: data.recruitingPartyNoticeCount,
      description: "운영 개입 필요",
      icon: "solar:bell-bold-duotone",
      tone: "blue" as const,
    },
  ];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 px-5 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
              <Icon icon="solar:widget-5-bold-duotone" className="h-4 w-4" />
              Admin Overview
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              운영 현황
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              핵심 지표와 우선 처리할 이슈를 한 화면에서 확인합니다.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to="/admin/parties"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-50 px-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
            >
              <Icon icon="solar:layers-bold-duotone" className="h-4 w-4" />
              파티 관리
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Icon
                icon="solar:users-group-rounded-bold-duotone"
                className="h-4 w-4"
              />
              회원 관리
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:grid-cols-4 lg:px-6">
          <DashboardMiniStat
            label="결제 실패"
            value={data.failedPaymentCount}
            tone="text-rose-600"
            icon="solar:card-bold-duotone"
          />
          <DashboardMiniStat
            label="실패 파티"
            value={data.failedPaymentPartyCount}
            tone="text-rose-600"
            icon="solar:danger-triangle-bold-duotone"
          />
          <DashboardMiniStat
            label="매칭 대기"
            value={data.waitingMatchUserCount}
            tone="text-amber-600"
            icon="solar:clock-circle-bold-duotone"
          />
          <DashboardMiniStat
            label="공지 필요"
            value={data.recruitingPartyNoticeCount}
            tone="text-blue-700"
            icon="solar:bell-bold-duotone"
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-950">핵심 지표</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              운영 상태를 빠르게 확인하세요.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {keyMetrics.map((metric) => (
            <AdminStatCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-base font-extrabold text-slate-950">운영 알림</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              우선 처리할 이슈입니다.
            </p>
          </div>
          <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
            {alerts.length}건
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset",
                    alert.tone,
                  ].join(" ")}
                >
                  <Icon icon={alert.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {alert.text}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    {alert.id}
                  </p>
                </div>
              </div>
              <Link
                to={alert.link}
                className="inline-flex h-9 items-center justify-center rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                {alert.linkText}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardMiniStat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">{label}</p>
          <p
            className={[
              "mt-1 text-2xl font-extrabold tabular-nums",
              tone,
            ].join(" ")}
          >
            {value}
          </p>
        </div>
        <Icon icon={icon} className={["h-5 w-5", tone].join(" ")} />
      </div>
    </div>
  );
}
