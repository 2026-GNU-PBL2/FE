export default function MetricCard({
  title,
  value,
  sub,
  main,
}: {
  title: string;
  value: string;
  sub: string;
  main: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{title}</div>
      <div
        className="mt-2 text-2xl font-black tracking-tight"
        style={{ color: main }}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}
