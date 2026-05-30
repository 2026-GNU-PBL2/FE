import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import {
  events,
  getStatusClassName,
  type EventItem,
  type EventStatus,
} from "./eventData";

export default function EventPage() {
  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-6 rounded-[32px] bg-white px-5 py-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100 sm:px-7 sm:py-8 lg:px-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-main ring-1 ring-blue-100">
            <Icon icon="solar:gift-bold-duotone" className="h-4 w-4" />
            이벤트
          </div>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
            Submate 혜택
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-500 sm:text-base">
            참여, 초대, 정산, 자동결제까지 이용 흐름에 맞춰 받을 수 있는
            리워드를 확인하세요.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
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

function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      to={`/event/${event.id}`}
      aria-label={`${event.title} 자세히 보기`}
      className="group block overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-main/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={event.image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={event.status} />
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm ring-1 ring-white/80">
            {event.reward}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold leading-snug text-slate-950 sm:text-xl">
              {event.title}
            </h2>

            <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
              {event.description}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-main transition group-hover:translate-x-0.5 group-hover:text-blue-800"
          >
            <Icon icon="solar:alt-arrow-right-linear" className="h-6 w-6" />
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-100">
            {event.condition}
          </span>
          <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-100">
            {event.period}
          </span>
        </div>
      </div>
    </Link>
  );
}
