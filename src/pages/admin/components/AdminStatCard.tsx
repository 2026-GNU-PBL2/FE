import { Icon } from "@iconify/react";

type AdminStatCardProps = {
  label: string;
  value: number | string;
  description: string;
  icon: string;
  tone?: "blue" | "mint" | "amber" | "rose";
};

const toneClassMap = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  mint: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

export default function AdminStatCard({
  label,
  value,
  description,
  icon,
  tone = "blue",
}: AdminStatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-900/5 transition hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5">
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
            toneClassMap[tone],
          ].join(" ")}
        >
          <Icon icon={icon} className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-slate-500">
            {label}
          </p>
          <p className="mt-0.5 text-xl font-bold text-slate-900">
            {value}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
