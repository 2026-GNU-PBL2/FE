import { Icon } from "@iconify/react";

type Props = {
  icon: string; // iconify icon name (e.g. "mdi:brain", "mdi:swap-horizontal", ...)
  title: string;
  points: string[];
};

export default function FeatureCard({ icon, title, points }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      {/* soft highlight */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-sub/10 blur-2xl transition group-hover:bg-brand-sub/15" />

      <div className="relative flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-main/10 ring-1 ring-brand-main/10">
          <Icon icon={icon} className="h-6 w-6 text-brand-main" />
        </div>

        <div className="min-w-0">
          <div className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </div>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-600">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
