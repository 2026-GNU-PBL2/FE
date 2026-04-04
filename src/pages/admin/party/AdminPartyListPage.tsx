import { Link } from "react-router-dom";
import {
  formatCurrency,
  formatDate,
  getAdminParties,
  getStatusClassName,
  getStatusLabel,
} from "@/pages/admin/mock/adminMock";

export default function AdminPartyListPage() {
  const parties = getAdminParties();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="grid grid-cols-[1.8fr_1.2fr_1fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span>파티</span>
              <span>파티장</span>
              <span>인원 현황</span>
              <span>월 이용 금액</span>
              <span>정산일</span>
              <span>상태</span>
              <span>상세</span>
            </div>

            {parties.map((party) => (
              <div
                key={party.id}
                className="grid grid-cols-[1.8fr_1.2fr_1fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-slate-100 px-6 py-5 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {party.productName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{party.id}</p>
                </div>
                <div className="text-slate-700">{party.hostName}</div>
                <div className="text-slate-700">
                  {party.currentMembers}/{party.maxMembers}명
                </div>
                <div className="text-slate-700">
                  {formatCurrency(party.monthlyAmount)}원
                </div>
                <div className="text-slate-600">
                  {formatDate(party.nextSettlementDate)}
                </div>
                <div>
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      getStatusClassName(party.status),
                    ].join(" ")}
                  >
                    {getStatusLabel(party.status)}
                  </span>
                </div>
                <div>
                  <Link
                    to={`/admin/parties/${party.id}`}
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
