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
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "예정") {
    return "bg-sky-50 text-sky-700";
  }

  return "bg-amber-50 text-amber-700";
}

function getStatusCount(status: EventStatus) {
  return events.filter((event) => event.status === status).length;
}

export default function EventPage() {
  const ongoingCount = getStatusCount("진행중");

  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            이벤트
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Submate에서 진행 중인 혜택을 확인해보세요
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Icon icon="solar:gift-bold" className="h-4 w-4" />
              이벤트 현황
            </div>

            <div className="text-sm font-semibold text-slate-800">
              진행 중인 이벤트 {ongoingCount}건
            </div>
          </div>
        </div>

        <div className="mt-8 divide-y divide-slate-200">
          {events.map((event) => (
            <article key={event.id} className="group py-5 first:pt-0 last:pb-0">
              <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[0.95fr_1.05fr] md:gap-6">
                <Link
                  to={`/event/${event.id}`}
                  className="block overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                </Link>

                <div className="px-0.5">
                  <div
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClassName(
                      event.status,
                    )}`}
                  >
                    {event.status}
                  </div>

                  <Link to={`/event/${event.id}`} className="block">
                    <h2 className="mt-3 text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-brand-main sm:text-2xl">
                      {event.title}
                    </h2>
                  </Link>

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    {event.period}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-[15px]">
                    {event.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                      <Icon
                        icon="solar:wallet-money-bold"
                        className="h-4 w-4"
                      />
                      {event.reward}
                    </div>

                    <Link
                      to={`/event/${event.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
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
