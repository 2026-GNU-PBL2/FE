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

  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="rounded-[32px] bg-white px-5 py-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100 sm:px-7 sm:py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                <Icon
                  icon="solar:gift-bold"
                  className="h-4 w-4 text-brand-main"
                />
                Submate 혜택
              </div>

              <h1 className="mt-4 text-[30px] font-extrabold tracking-tight text-slate-950 sm:text-[40px]">
                이벤트
              </h1>

              <p className="mt-3 max-w-xl text-[15px] font-semibold leading-7 text-slate-500">
                파티 참여와 운영에 필요한 혜택을 한곳에서 확인해보세요.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 sm:min-w-[260px]">
              <div className="rounded-[22px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
                <p className="text-xs font-bold text-slate-500">진행 중</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">
                  {ongoingCount}
                  <span className="ml-0.5 text-sm font-bold text-slate-500">
                    건
                  </span>
                </p>
              </div>

              <div className="rounded-[22px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
                <p className="text-xs font-bold text-slate-500">예정</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">
                  {upcomingCount}
                  <span className="ml-0.5 text-sm font-bold text-slate-500">
                    건
                  </span>
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-5 grid gap-4">
          {events.map((event) => (
            <article
              key={event.id}
              className="group overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-slate-900/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
                <Link
                  to={`/event/${event.id}`}
                  className="block min-h-0 overflow-hidden bg-slate-100"
                >
                  <div className="relative aspect-16/9 w-full overflow-hidden md:h-full md:aspect-auto">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                </Link>

                <div className="min-w-0 px-5 py-5 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${getStatusClassName(
                        event.status,
                      )}`}
                    >
                      {event.status}
                    </span>

                    <span className="text-xs font-bold text-slate-400">
                      {event.period}
                    </span>
                  </div>

                  <Link to={`/event/${event.id}`} className="block">
                    <h2 className="mt-3 text-xl font-extrabold leading-snug tracking-tight text-slate-950 transition group-hover:text-brand-main sm:text-2xl">
                      {event.title}
                    </h2>
                  </Link>

                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    {event.description}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                      <Icon
                        icon="solar:wallet-money-bold"
                        className="h-4 w-4"
                      />
                      {event.reward}
                    </div>

                    <Link
                      to={`/event/${event.id}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      자세히 보기
                      <Icon
                        icon="solar:alt-arrow-right-linear"
                        className="h-4 w-4"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
