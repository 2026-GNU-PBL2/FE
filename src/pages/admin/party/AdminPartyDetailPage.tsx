import { Link, Navigate, useParams } from "react-router-dom";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getAdminPartyById,
  getStatusClassName,
  getStatusLabel,
} from "@/pages/admin/mock/adminMock";

export default function AdminPartyDetailPage() {
  const { partyId } = useParams();
  const party = partyId ? getAdminPartyById(partyId) : null;

  if (!party) {
    return <Navigate to="/admin/parties" replace />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">{party.id}</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {party.productName}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              파티장: {party.hostName} · 생성일{" "}
              {formatDateTime(party.createdAt)}
            </p>
          </div>

          <div>
            <span
              className={[
                "inline-flex rounded-full px-3 py-1.5 text-sm font-semibold",
                getStatusClassName(party.status),
              ].join(" ")}
            >
              {getStatusLabel(party.status)}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">파티 인원</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {party.currentMembers}/{party.maxMembers}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">1인 월 이용 금액</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {formatCurrency(party.monthlyAmount)}원
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">다음 정산일</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatDate(party.nextSettlementDate)}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">파티장</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {party.hostName}
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <p className="text-lg font-semibold text-slate-900">참여 멤버 목록</p>
          <p className="mt-1 text-sm text-slate-500">
            파티장과 파티원의 결제 상태를 함께 볼 수 있습니다.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {party.members.map((member) => (
            <div
              key={`${party.id}-${member.id}`}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div>
                <p className="font-semibold text-slate-900">{member.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {member.id} · {member.role}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                    getStatusClassName(member.paymentStatus),
                  ].join(" ")}
                >
                  {getStatusLabel(member.paymentStatus)}
                </span>

                <Link
                  to={`/admin/users/${member.id}`}
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  회원 보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
