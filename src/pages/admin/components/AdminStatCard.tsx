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
    <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200 transition hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-950">
            {value}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset",
            toneClassMap[tone],
          ].join(" ")}
        >
          <Icon icon={icon} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
