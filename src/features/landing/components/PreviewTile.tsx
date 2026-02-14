export default function PreviewTile({
  title,
  desc,
  right,
  bottom,
}: {
  title: string;
  desc: string;
  right: string;
  bottom: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-2 text-sm text-slate-600">{desc}</div>
        </div>
        <div className="shrink-0 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-black text-slate-900">
          {right}
        </div>
      </div>
      <div className="mt-4 text-xs text-slate-500">{bottom}</div>
    </div>
  );
}
