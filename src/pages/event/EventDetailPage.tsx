import { Icon } from "@iconify/react";
import { Link, Navigate, useParams } from "react-router-dom";
import { events, getStatusClassName, type EventStatus } from "./eventData";

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = events.find((item) => String(item.id) === eventId);

  if (!event) {
    return <Navigate to="/event" replace />;
  }

  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Link
          to="/event"
          className="mb-4 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-slate-600 ring-1 ring-slate-100 transition hover:bg-slate-50"
        >
          <Icon icon="solar:alt-arrow-left-linear" className="h-4 w-4" />
          이벤트 목록
        </Link>

        <article className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <img
              src={event.image}
              alt={event.title}
              className="h-full w-full object-contain"
            />
            <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
              <StatusBadge status={event.status} />
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm ring-1 ring-white/80">
                {event.reward}
              </span>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-brand-main">
                이벤트 상세
              </p>

              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                {event.detailTitle}
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-500 sm:text-base">
                {event.detailDescription}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <InfoTile label="리워드" value={event.reward} />
                <InfoTile label="기간" value={event.period} />
                <InfoTile label="조건" value={event.condition} />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <section className="rounded-[28px] bg-slate-50 px-5 py-5 ring-1 ring-slate-100">
                <h2 className="text-lg font-extrabold text-slate-950">
                  참여 방법
                </h2>

                <div className="mt-4 space-y-3">
                  {event.steps.map((step, index) => (
                    <div
                      key={step}
                      className="flex gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-100"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-brand-main ring-1 ring-blue-100">
                        {index + 1}
                      </span>
                      <p className="text-sm font-semibold leading-6 text-slate-600">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] bg-slate-50 px-5 py-5 ring-1 ring-slate-100">
                <h2 className="text-lg font-extrabold text-slate-950">
                  유의사항
                </h2>

                <ul className="mt-4 space-y-3">
                  {event.notices.map((notice) => (
                    <li
                      key={notice}
                      className="flex gap-3 text-sm font-semibold leading-6 text-slate-600"
                    >
                      <Icon
                        icon="solar:check-circle-bold"
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#00875A]"
                      />
                      {notice}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1",
        getStatusClassName(status),
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-950">{value}</p>
    </div>
  );
}
