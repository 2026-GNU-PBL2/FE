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
        console.log(res);
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

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <AdminStatCard
          label="운영 상품"
          value={data.operatingProductCount}
          description="현재 운영 중인 상품 수"
          icon="solar:box-bold-duotone"
          tone="blue"
        />
        <AdminStatCard
          label="활성 회원"
          value={data.activeMemberCount}
          description="서비스 이용 중인 회원 수"
          icon="solar:users-group-rounded-bold-duotone"
          tone="mint"
        />
        <AdminStatCard
          label="모집 파티"
          value={data.recruitingPartyCount}
          description="현재 모집 진행 중 파티"
          icon="solar:layers-bold-duotone"
          tone="amber"
        />
        <AdminStatCard
          label="결제 실패"
          value={data.failedPaymentCount}
          description="결제 실패 전체 건수"
          icon="solar:card-bold-duotone"
          tone="rose"
        />
      </section>

      {/* 추가 지표 카드 */}
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <AdminStatCard
          label="결제 실패 파티"
          value={data.failedPaymentPartyCount}
          description="문제 발생 파티 수"
          icon="solar:danger-triangle-bold-duotone"
          tone="rose"
        />
        <AdminStatCard
          label="매칭 대기 유저"
          value={data.waitingMatchUserCount}
          description="자동 매칭 대기 인원"
          icon="solar:user-clock-bold-duotone"
          tone="amber"
        />
        <AdminStatCard
          label="모집 공지 필요"
          value={data.recruitingPartyNoticeCount}
          description="운영 개입 필요 파티"
          icon="solar:bell-bold-duotone"
          tone="blue"
        />
      </section>

      {/* 알림 영역 */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">운영 알림</p>
            <p className="mt-1 text-sm text-slate-500">
              즉시 확인이 필요한 항목입니다.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/admin/parties"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              파티 관리
            </Link>
            <Link
              to="/admin/users"
              className="rounded-2xl bg-[#1E3A8A] px-4 py-2.5 text-sm text-white hover:bg-[#1e40af]"
            >
              회원 관리
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-2xl",
                    alert.tone,
                  ].join(" ")}
                >
                  <Icon icon={alert.icon} className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-800">{alert.text}</p>
              </div>

              <Link
                to={alert.link}
                className="h-10 rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-center"
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
