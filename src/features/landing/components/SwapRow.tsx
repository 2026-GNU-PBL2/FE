export default function SwapRow({
  from,
  to,
  reason,
  impact,
  accent,
}: {
  from: string;
  to: string;
  reason: string;
  impact: string;
  accent: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">
          {from} <span className="text-slate-400">→</span> {to}
        </div>
        <div className="mt-1 text-xs text-slate-500">{reason}</div>
      </div>
      <div
        className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: `${accent}22`, color: "#0f172a" }}
      >
        {impact}
      </div>
    </div>
  );
}
