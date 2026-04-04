import { Link, Navigate, useParams } from "react-router-dom";
import {
  formatCurrency,
  formatDateTime,
  getAdminUserById,
  getStatusClassName,
  getStatusLabel,
  getUserOwnedParties,
} from "@/pages/admin/mock/adminMock";

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const user = userId ? getAdminUserById(userId) : null;

  if (!user) {
    return <Navigate to="/admin/users" replace />;
  }

  const ownedParties = getUserOwnedParties(user.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-18 w-18 items-center justify-center rounded-[28px] bg-linear-to-br from-blue-900 to-sky-500 text-xl font-semibold text-white shadow-lg shadow-blue-900/15">
              {user.name.slice(0, 2)}
            </div>
            <div>
              <p className="text-sm text-slate-500">{user.id}</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                {user.name}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div>
            <span
              className={[
                "inline-flex rounded-full px-3 py-1.5 text-sm font-semibold",
                getStatusClassName(user.status),
              ].join(" ")}
            >
              {getStatusLabel(user.status)}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <p className="text-sm font-medium text-slate-500">회원 역할</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {user.role}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <p className="text-sm font-medium text-slate-500">누적 결제 금액</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {formatCurrency(user.totalPayments)}원
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <p className="text-sm font-medium text-slate-500">보유 파티 수</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {user.ownedPartyCount}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <p className="text-sm font-medium text-slate-500">가입일</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {formatDateTime(user.joinedAt)}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-base font-semibold text-slate-900">기본 정보</p>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                이메일
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                전화번호
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {user.phone}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                상태
              </p>
              <div className="mt-2">
                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                    getStatusClassName(user.status),
                  ].join(" ")}
                >
                  {getStatusLabel(user.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <p className="text-lg font-semibold text-slate-900">운영 중인 파티</p>
          <p className="mt-1 text-sm text-slate-500">
            이 회원이 파티장으로 운영 중인 파티 목록입니다.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {ownedParties.length > 0 ? (
            ownedParties.map((party) => (
              <div
                key={party.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {party.productName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {party.id} · {party.currentMembers}/{party.maxMembers}명
                  </p>
                </div>

                <Link
                  to={`/admin/parties/${party.id}`}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  파티 상세 보기
                </Link>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              현재 운영 중인 파티가 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
