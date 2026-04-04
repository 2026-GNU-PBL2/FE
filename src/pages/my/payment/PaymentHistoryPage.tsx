const historyItems = [
  {
    id: 1,
    title: "Netflix 파티 월 이용권 결제",
    date: "2026.03.28 19:12",
    type: "결제",
    method: "등록 카드",
    amount: "-4,900원",
  },
  {
    id: 2,
    title: "친구 초대 이벤트 포인트 적립",
    date: "2026.03.25 10:30",
    type: "적립",
    method: "이벤트",
    amount: "+2,000P",
  },
  {
    id: 3,
    title: "YouTube Premium 파티 월 이용권 결제",
    date: "2026.03.03 21:06",
    type: "결제",
    method: "등록 카드",
    amount: "-3,900원",
  },
];

export default function PaymentHistoryPage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="이번 달 결제" value="8,800원" />
        <SummaryCard label="이번 달 적립" value="2,000P" />
        <SummaryCard label="자동결제 상태" value="정상" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{item.date}</span>
                  <span>{item.method}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    item.type === "적립"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700",
                  ].join(" ")}
                >
                  {item.type}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {item.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-5 py-5">
      <p className="text-xs font-semibold tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
