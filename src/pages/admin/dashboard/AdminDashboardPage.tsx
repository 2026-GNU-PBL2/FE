import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import AdminStatCard from "@/pages/admin/components/AdminStatCard";
import {
  formatDate,
  getDashboardSummary,
  getStatusClassName,
  getStatusLabel,
} from "@/pages/admin/mock/adminMock";

export default function AdminDashboardPage() {
  const summary = getDashboardSummary();

  const alerts = [
    {
      id: "ALT-001",
      icon: "solar:danger-circle-bold-duotone",
      text: `미입금 또는 결제 실패 파티원이 포함된 파티가 ${summary.failedPayments}건 감지되었습니다.`,
      tone: "text-rose-600 bg-rose-50",
      link: "/admin/parties",
      linkText: "파티 관리로 이동",
    },
    {
      id: "ALT-002",
      icon: "solar:clock-circle-bold-duotone",
      text: `승인 대기 중인 신규 회원이 ${summary.pendingUsers}명 있습니다.`,
      tone: "text-amber-600 bg-amber-50",
      link: "/admin/users",
      linkText: "회원 관리로 이동",
    },
    {
      id: "ALT-003",
      icon: "solar:users-group-rounded-bold-duotone",
      text: `현재 모집 중인 파티는 총 ${summary.recruitingParties}개입니다. 빈자리 채우기 운영이 필요합니다.`,
      tone: "text-blue-700 bg-blue-50",
      link: "/admin/parties",
      linkText: "모집 파티 확인",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <AdminStatCard
          label="운영 중 상품"
          value={summary.activeProducts}
          description="현재 사용자에게 노출 중인 상품 수"
          icon="solar:box-bold-duotone"
          tone="blue"
        />
        <AdminStatCard
          label="활성 회원"
          value={summary.activeUsers}
          description="정상 상태로 서비스 이용 중인 회원 수"
          icon="solar:users-group-rounded-bold-duotone"
          tone="mint"
        />
        <AdminStatCard
          label="모집 중 파티"
          value={summary.recruitingParties}
          description="빈자리 충원이 필요한 파티 수"
          icon="solar:layers-bold-duotone"
          tone="amber"
        />
        <AdminStatCard
          label="실패 결제"
          value={summary.failedPayments}
          description="즉시 확인이 필요한 결제 실패 건수"
          icon="solar:card-bold-duotone"
          tone="rose"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                주의 필요 항목
              </p>
              <p className="mt-1 text-sm text-slate-500">
                운영자가 바로 확인하면 좋은 항목들입니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/admin/parties"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                파티 관리 이동
              </Link>
              <Link
                to="/admin/users"
                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                회원 관리 이동
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col gap-3 rounded-3xl border border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={[
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                      alert.tone,
                    ].join(" ")}
                  >
                    <Icon icon={alert.icon} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-6 text-slate-800">
                      {alert.text}
                    </p>
                  </div>
                </div>

                <Link
                  to={alert.link}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {alert.linkText}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
          <div className="mb-4">
            <p className="text-lg font-semibold text-slate-900">
              운영 체크 포인트
            </p>
            <p className="mt-1 text-sm text-slate-500">
              실서비스 운영 기준으로 먼저 챙기면 좋은 흐름입니다.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                step: "01",
                title: "신규 상품 등록 및 상태 관리",
                desc: "새로운 OTT 상품이 생기면 활성/비활성 상태까지 함께 관리합니다.",
              },
              {
                step: "02",
                title: "회원 상태와 위험 계정 점검",
                desc: "가입 대기, 정지, 결제 실패 이력이 있는 회원을 우선 확인합니다.",
              },
              {
                step: "03",
                title: "파티 모집 상태와 정산 일정 확인",
                desc: "빈자리 파티와 정산 예정일이 가까운 파티를 중심으로 운영합니다.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-3xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-blue-900 ring-1 ring-inset ring-slate-200">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <p className="text-lg font-semibold text-slate-900">최근 이벤트</p>
          <p className="mt-1 text-sm text-slate-500">
            대시보드에서 바로 확인할 수 있는 운영 이벤트입니다.
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.3fr_2.6fr_1.2fr_1fr_1fr] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span>구분</span>
              <span>내용</span>
              <span>담당</span>
              <span>상태</span>
              <span>시간</span>
            </div>

            {summary.recentEvents.map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-[1.3fr_2.6fr_1.2fr_1fr_1fr] gap-4 border-b border-slate-100 px-6 py-4 text-sm last:border-b-0"
              >
                <div className="font-medium text-slate-700">{event.type}</div>
                <div className="text-slate-800">{event.title}</div>
                <div className="text-slate-500">{event.actor}</div>
                <div>
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      getStatusClassName(event.status),
                    ].join(" ")}
                  >
                    {getStatusLabel(event.status)}
                  </span>
                </div>
                <div className="text-slate-500">
                  {event.time.includes("오늘")
                    ? event.time
                    : formatDate(event.time)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
