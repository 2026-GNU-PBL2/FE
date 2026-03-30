const partyHistories = [
  {
    id: 1,
    title: "Netflix 4인 파티",
    role: "파티원",
    status: "이용 중",
    date: "2026.03.01 ~ 이용 중",
  },
  {
    id: 2,
    title: "YouTube Premium 6인 파티",
    role: "파티장",
    status: "종료",
    date: "2026.01.05 ~ 2026.02.05",
  },
  {
    id: 3,
    title: "Disney+ 4인 파티",
    role: "파티원",
    status: "종료",
    date: "2025.12.10 ~ 2026.01.10",
  },
];

export default function PartyHistoryPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="space-y-3">
          {partyHistories.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-900">
                  {item.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{item.role}</span>
                  <span>{item.date}</span>
                </div>
              </div>

              <span
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                  item.status === "이용 중"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-200 text-slate-700",
                ].join(" ")}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
