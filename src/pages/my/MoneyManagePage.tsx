const moneyLogs = [
  {
    id: 1,
    title: "첫 결제 프로모션",
    date: "2026.03.30",
    type: "적립",
    amount: "+3,000원",
  },
  {
    id: 2,
    title: "파티 결제 차감",
    date: "2026.03.27",
    type: "사용",
    amount: "-4,900원",
  },
  {
    id: 3,
    title: "친구 초대 리워드",
    date: "2026.03.21",
    type: "적립",
    amount: "+2,000원",
  },
];

export default function MoneyManagePage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#1E3A8A_0%,#2563EB_55%,#2DD4BF_160%)] p-6 text-white">
          <p className="text-sm font-semibold text-white/75">보유 머니</p>
          <p className="mt-3 text-4xl font-bold">12,400원</p>
          <p className="mt-2 text-sm text-white/80">
            결제 시 머니를 먼저 차감하거나 이벤트 보상으로 적립할 수 있어요.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard label="이번 달 적립" value="5,000원" />
          <StatCard label="이번 달 사용" value="4,900원" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-slate-900">최근 머니 내역</p>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            전체 보기
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {moneyLogs.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.date}</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    item.type === "적립"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-200 text-slate-700",
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-5 py-5">
      <p className="text-xs font-semibold tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
