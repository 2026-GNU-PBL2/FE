import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

type EventStatus = "진행중" | "예정" | "종료임박";

type EventItem = {
  id: number;
  title: string;
  description: string;
  reward: string;
  period: string;
  status: EventStatus;
  image: string;
};

const events: EventItem[] = [
  {
    id: 1,
    title: "첫 이용 고객 플랫폼 머니 지급",
    description:
      "Submate에서 처음 파티에 참여하거나 처음 파티를 생성한 고객에게 플랫폼 머니를 지급합니다.",
    reward: "플랫폼 머니 3,000원",
    period: "2026.03.25 - 2026.04.30",
    status: "진행중",
    image: "/images/events/event-welcome.png",
  },
  {
    id: 2,
    title: "친구 초대 리워드 이벤트",
    description:
      "친구가 내 초대 링크를 통해 가입하고 첫 참여를 완료하면 초대한 사람과 친구 모두에게 플랫폼 머니를 드립니다.",
    reward: "친구와 나 각각 2,000원",
    period: "상시",
    status: "진행중",
    image: "/images/events/event-invite.png",
  },
  {
    id: 3,
    title: "파티장 첫 정산 완료 보너스",
    description:
      "첫 정산까지 정상적으로 완료한 파티장에게 운영 시작 보너스를 지급합니다.",
    reward: "플랫폼 머니 5,000원",
    period: "2026.03.25 - 2026.04.15",
    status: "예정",
    image: "/images/events/event-host.png",
  },
  {
    id: 4,
    title: "자동결제 등록 완료 혜택",
    description:
      "파티원이 자동결제 등록을 완료하면 다음 결제 주기에 사용할 수 있는 플랫폼 머니를 추가 지급합니다.",
    reward: "플랫폼 머니 1,000원",
    period: "2026.03.25 - 2026.04.10",
    status: "종료임박",
    image: "/images/events/event-billing.png",
  },
];

function getStatusClassName(status: EventStatus) {
  if (status === "진행중") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "예정") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  return "bg-amber-50 text-amber-700 ring-amber-100";
}

function getStatusCount(status: EventStatus) {
  return events.filter((event) => event.status === status).length;
}

export default function EventPage() {
  const ongoingCount = getStatusCount("진행중");
  const upcomingCount = getStatusCount("예정");
  const urgentCount = getStatusCount("종료임박");
  const featuredEvent = events[0];
  const remainingEvents = events.slice(1);

  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="overflow-hidden rounded-[32px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
          <div className="grid gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-main ring-1 ring-blue-100">
                <Icon
                  icon="solar:gift-bold-duotone"
                  className="h-4 w-4"
                />
                Submate 혜택
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                받을 수 있는 혜택을
                <br />
                모아봤어요
              </h1>

              <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-500 sm:text-base">
                첫 참여, 초대, 정산 완료까지 지금 받을 수 있는 리워드를
                확인해 보세요.
              </p>
            </div>

            <div className="rounded-[28px] bg-slate-50 p-2.5 ring-1 ring-slate-100">
              <div className="grid grid-cols-3 gap-2">
                <EventCount label="진행 중" count={ongoingCount} />
                <EventCount label="예정" count={upcomingCount} />
                <EventCount label="종료임박" count={urgentCount} />
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold text-brand-main">
                추천 이벤트
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                놓치기 쉬운 혜택
              </h2>
            </div>
          </div>

          <article className="group overflow-hidden rounded-[32px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(15,23,42,0.09)]">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr]">
              <Link
                to={`/event/${featuredEvent.id}`}
                className="relative block overflow-hidden bg-slate-100"
              >
                <div className="aspect-[16/9] lg:h-full lg:aspect-auto">
                  <img
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                  />
                </div>
              </Link>

              <EventContent event={featuredEvent} featured />
            </div>
          </article>
        </section>

        <section className="mt-7">
          <div className="mb-4">
            <p className="text-xs font-extrabold text-slate-400">전체 혜택</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
              진행 중인 이벤트
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {remainingEvents.map((event) => (
              <article
                key={event.id}
                className="group overflow-hidden rounded-[28px] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(15,23,42,0.08)]"
              >
                <Link to={`/event/${event.id}`} className="block bg-slate-100">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                    />
                  </div>
                </Link>

                <EventContent event={event} compact />
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function EventCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-[20px] bg-white px-3 py-3 text-center ring-1 ring-slate-100">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-950">
        {count}
        <span className="ml-0.5 text-xs font-bold text-slate-400">건</span>
      </p>
    </div>
  );
}

function EventContent({
  event,
  featured = false,
  compact = false,
}: {
  event: EventItem;
  featured?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "px-4 py-4" : "px-5 py-6 sm:px-6 lg:p-7"}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${getStatusClassName(
            event.status,
          )}`}
        >
          {event.status}
        </span>

        <span className="text-xs font-bold text-slate-400">{event.period}</span>
      </div>

      <Link to={`/event/${event.id}`} className="block">
        <h2
          className={[
            "mt-3 font-extrabold leading-snug tracking-tight text-slate-950 transition group-hover:text-brand-main",
            featured ? "text-2xl sm:text-3xl" : "text-lg",
          ].join(" ")}
        >
          {event.title}
        </h2>
      </Link>

      <p
        className={[
          "mt-2 font-semibold text-slate-500",
          compact ? "line-clamp-3 text-sm leading-6" : "text-sm leading-7",
        ].join(" ")}
      >
        {event.description}
      </p>

      <div
        className={[
          "mt-5 flex gap-3",
          compact
            ? "flex-col"
            : "flex-col sm:flex-row sm:items-center sm:justify-between",
        ].join(" ")}
      >
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-sm font-bold text-teal-700 ring-1 ring-teal-100">
          <Icon icon="solar:wallet-money-bold-duotone" className="h-4 w-4" />
          {event.reward}
        </div>

        <Link
          to={`/event/${event.id}`}
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-full bg-blue-50 px-4 text-sm font-extrabold text-brand-main ring-1 ring-blue-100 transition hover:bg-blue-100 active:scale-95"
        >
          자세히 보기
          <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
