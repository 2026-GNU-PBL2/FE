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
      <div className="flex h-[300px] items-center justify-center text-slate-500">
        로딩 중...
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
      icon: "solar:user-clock-bold-duotone",
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
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-bold text-slate-900">운영 현황</p>
            <p className="mt-0.5 text-xs text-slate-500">
              핵심 지표와 확인이 필요한 항목을 한 화면에서 봅니다.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              to="/admin/parties"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              파티 관리
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#1E3A8A] px-3 text-xs font-semibold text-white hover:bg-[#1e40af]"
            >
              회원 관리
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {keyMetrics.map((metric) => (
            <AdminStatCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-base font-bold text-slate-900">운영 알림</p>
            <p className="mt-0.5 text-xs text-slate-500">
              우선 처리할 이슈입니다.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {alerts.length}건
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    alert.tone,
                  ].join(" ")}
                >
                  <Icon icon={alert.icon} className="h-4 w-4" />
                </span>
                <p className="min-w-0 truncate text-sm font-medium text-slate-800">
                  {alert.text}
                </p>
              </div>
              <Link
                to={alert.link}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
