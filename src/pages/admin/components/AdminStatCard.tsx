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
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div
          className={[
            "flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset",
            toneClassMap[tone],
          ].join(" ")}
        >
          <Icon icon={icon} className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
