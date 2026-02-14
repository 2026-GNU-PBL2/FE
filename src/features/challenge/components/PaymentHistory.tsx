// src/features/challenge/components/PaymentHistory.tsx

import { Check, ArrowUpRight, Clock } from "lucide-react";
import { clsx } from "clsx";

type HistoryItem = {
  id: number;
  month: number;
  date: string;
  amount: number;
  status: "Paid" | "Pending";
  method: string;
};

export const PaymentHistory = ({
  historyData,
}: {
  historyData: HistoryItem[];
}) => {
  const statusLabel = (s: HistoryItem["status"]) => {
    if (s === "Paid") return "완료";
    return "예정";
  };

  const statusPillClass = (s: HistoryItem["status"]) => {
    if (s === "Paid")
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  const formatMoney = (n: number) => `₩${n.toLocaleString()}`;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900">챌린지 결제 기록</h3>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-main transition hover:opacity-90"
        >
          전체 보기 <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative space-y-6">
        <div className="absolute bottom-4 left-5 top-4 -z-10 w-0.5 bg-slate-100" />

        {/* Next upcoming (UI용 더미) - 맨 위로 이동 */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-indigo-700 shadow-sm"
              aria-label="다음 결제 예정"
            >
              <Clock className="h-4 w-4" strokeWidth={2.5} />
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <div className="mb-1 flex items-start justify-between gap-3">
              <span className="truncate font-bold text-slate-900">
                다음 결제(예정)
              </span>
              <span className="shrink-0 font-bold text-slate-900">
                -{formatMoney(12000)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
              <span className="truncate">결제 예정일: 2026-03-01</span>

              <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
                예정
              </span>
            </div>
          </div>
        </div>

        {/* History items */}
        {historyData.map((item) => {
          const paid = item.status === "Paid";

          return (
            <div key={item.id} className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm",
                    paid
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500",
                  )}
                  aria-label={paid ? "결제 완료" : "결제 예정"}
                >
                  {paid ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <Clock className="h-4 w-4" strokeWidth={2.5} />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <span className="truncate font-bold text-slate-900">
                    {item.month}개월차 적립
                  </span>
                  <span className="shrink-0 font-bold text-slate-900">
                    -{formatMoney(item.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span className="truncate">
                    {item.date} • {item.method}
                  </span>

                  <span
                    className={clsx(
                      "shrink-0 rounded-full border px-2 py-0.5 font-semibold",
                      statusPillClass(item.status),
                    )}
                  >
                    {statusLabel(item.status)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
