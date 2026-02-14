export default function StepCard({
  idx,
  icon,
  title,
  desc,
}: {
  idx: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-500">{idx}</div>
        <div className="text-xl">{icon}</div>
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{desc}</div>
    </div>
  );
}
