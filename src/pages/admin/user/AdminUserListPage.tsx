import { Link } from "react-router-dom";
import {
  formatCurrency,
  formatDateTime,
  getAdminUsers,
  getStatusClassName,
  getStatusLabel,
} from "@/pages/admin/mock/adminMock";

export default function AdminUserListPage() {
  const users = getAdminUsers();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="grid grid-cols-[1.8fr_1.4fr_1fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span>회원</span>
              <span>연락처</span>
              <span>역할</span>
              <span>상태</span>
              <span>가입일</span>
              <span>누적 결제</span>
              <span>상세</span>
            </div>

            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1.8fr_1.4fr_1fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-slate-100 px-6 py-5 text-sm last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {user.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user.email} · {user.id}
                  </p>
                </div>
                <div className="text-slate-600">{user.phone}</div>
                <div className="text-slate-700">{user.role}</div>
                <div>
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      getStatusClassName(user.status),
                    ].join(" ")}
                  >
                    {getStatusLabel(user.status)}
                  </span>
                </div>
                <div className="text-slate-600">
                  {formatDateTime(user.joinedAt)}
                </div>
                <div className="text-slate-700">
                  {formatCurrency(user.totalPayments)}원
                </div>
                <div>
                  <Link
                    to={`/admin/users/${user.id}`}
                    className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
