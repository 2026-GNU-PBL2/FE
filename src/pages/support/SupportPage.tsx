import { Icon } from "@iconify/react";
import { useState } from "react";

type SupportCategory = "전체" | "결제" | "파티" | "정산" | "계정" | "기타";

type FaqItem = {
  id: number;
  category: Exclude<SupportCategory, "전체">;
  question: string;
  answer: string;
};

type NoticeItem = {
  id: number;
  label: string;
  title: string;
  date: string;
};

const categoryOptions: SupportCategory[] = [
  "전체",
  "결제",
  "파티",
  "정산",
  "계정",
  "기타",
];

const faqItems: FaqItem[] = [
  {
    id: 1,
    category: "결제",
    question: "중도 탈퇴하면 환불되나요?",
    answer:
      "Submate는 월 이용권 기준으로 운영됩니다. 결제가 완료되면 다음 결제일까지 이용할 수 있으며, 중도 탈퇴하더라도 환불은 제공되지 않습니다.",
  },
  {
    id: 2,
    category: "정산",
    question: "파티장은 언제 정산을 받나요?",
    answer:
      "파티원이 플랫폼을 통해 결제를 완료하면 수수료를 제외한 금액이 정산 기준에 따라 파티장에게 정산됩니다. 실제 반영 시점은 결제 상태와 운영 정책에 따라 달라질 수 있습니다.",
  },
  {
    id: 3,
    category: "파티",
    question: "파티원이 중간에 나가면 금액이 다시 계산되나요?",
    answer:
      "아니요. Submate는 월 이용권 기반 구조이기 때문에 중간 탈퇴가 발생해도 즉시 재정산하지 않습니다. 빈자리는 새로운 파티원을 모집하는 방식으로 운영됩니다.",
  },
  {
    id: 4,
    category: "결제",
    question: "결제 실패 시 파티 참여는 어떻게 되나요?",
    answer:
      "결제가 정상 완료되지 않으면 참여 상태가 반영되지 않을 수 있습니다. 반복 실패가 발생하면 결제 수단과 승인 내역을 확인한 뒤 1:1 문의로 접수해 주세요.",
  },
  {
    id: 5,
    category: "계정",
    question: "소셜 로그인 후 계정 정보를 수정할 수 있나요?",
    answer:
      "닉네임이나 프로필 이미지 등 일부 항목은 추후 수정 가능하도록 제공할 수 있습니다. 다만 로그인 연동 정보와 본인 확인 관련 정보는 보안상 제한될 수 있습니다.",
  },
  {
    id: 6,
    category: "파티",
    question: "파티 참여 후 바로 이용할 수 있나요?",
    answer:
      "파티 상태와 결제 상태에 따라 즉시 반영되거나 잠시 대기 상태가 될 수 있습니다. 모집 인원과 파티 승인 조건에 따라 실제 이용 시작 시점은 달라질 수 있습니다.",
  },
  {
    id: 7,
    category: "정산",
    question: "정산 기록은 어디서 확인하나요?",
    answer:
      "서비스는 결제, 정산, 상태 변경 이력을 기반으로 운영됩니다. 추후 마이페이지 또는 파티 상세에서 거래 및 정산 내역을 확인할 수 있도록 연결하는 구성이 적합합니다.",
  },
  {
    id: 8,
    category: "기타",
    question: "파티원이나 파티장을 신고할 수 있나요?",
    answer:
      "네, 운영 정책 위반이나 비정상 이용이 의심되는 경우 신고 접수가 가능합니다. 관련 파티 정보와 사유를 함께 제출해 주시면 운영 기준에 따라 확인합니다.",
  },
];

const noticeItems: NoticeItem[] = [
  {
    id: 1,
    label: "안내",
    title: "정산 내역 조회 기능 점검 안내",
    date: "2026.03.25",
  },
  {
    id: 2,
    label: "정책",
    title: "월 이용권 기준 운영 정책 안내",
    date: "2026.03.20",
  },
  {
    id: 3,
    label: "문의",
    title: "1:1 문의 응답 시간 안내",
    date: "2026.03.18",
  },
];

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<SupportCategory>("전체");
  const [openedFaqIds, setOpenedFaqIds] = useState<number[]>([1]);

  const filteredFaqs = faqItems.filter((item) => {
    return selectedCategory === "전체" || item.category === selectedCategory;
  });

  const toggleFaq = (id: number) => {
    setOpenedFaqIds((prev) =>
      prev.includes(id) ? prev.filter((faqId) => faqId !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
          <div className="grid gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[1fr_320px] lg:items-center lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-main ring-1 ring-blue-100">
                <Icon icon="solar:chat-round-dots-bold-duotone" className="h-4 w-4" />
                고객센터
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                무엇을 도와드릴까요?
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                자주 묻는 질문을 먼저 확인해 보세요. 해결되지 않는 내용은
                고객센터 메일로 보내주시면 순서대로 확인합니다.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <a
                  href="mailto:hello@submate.app"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-main px-5 text-sm font-bold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-800 active:scale-95"
                >
                  <Icon icon="solar:letter-bold-duotone" className="h-4 w-4" />
                  문의 메일 보내기
                </a>

                <a
                  href="#faq"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-50 px-5 text-sm font-bold text-slate-700 ring-1 ring-slate-100 transition hover:bg-slate-100 active:scale-95"
                >
                  <Icon icon="solar:question-circle-bold-duotone" className="h-4 w-4" />
                  FAQ 보기
                </a>
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main">
                  <Icon icon="solar:clock-circle-bold-duotone" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    평균 응답 시간
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    영업일 기준 24시간 이내
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <SupportMiniStat label="문의 전 확인" value="FAQ" />
                <SupportMiniStat label="고객센터" value="메일 접수" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <SupportInfoCard
            icon="solar:card-bold-duotone"
            title="결제 오류"
            description="결제 시각과 오류 화면을 함께 보내면 더 빠르게 확인할 수 있어요."
          />
          <SupportInfoCard
            icon="solar:users-group-rounded-bold-duotone"
            title="파티 문의"
            description="파티 이름, 상품, 참여 상태를 알려주면 상황 파악이 쉬워요."
          />
          <SupportInfoCard
            icon="solar:wallet-money-bold-duotone"
            title="정산 문의"
            description="정산 기준일과 결제 내역을 함께 확인해 주세요."
          />
        </div>
      </section>

      <section
        id="faq"
        className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-16"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">
                    자주 묻는 질문
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    카테고리를 선택하면 필요한 답변만 볼 수 있어요.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-100">
                  {filteredFaqs.length}개
                </span>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categoryOptions.map((category) => {
                  const isActive = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={[
                        "h-9 shrink-0 rounded-full px-3.5 text-sm font-bold transition",
                        isActive
                          ? "bg-blue-50 text-brand-main ring-1 ring-blue-100"
                          : "bg-slate-50 text-slate-500 ring-1 ring-slate-100 hover:bg-slate-100 hover:text-slate-800",
                      ].join(" ")}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredFaqs.map((item) => {
                const isOpened = openedFaqIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    className="block w-full px-5 py-5 text-left transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
                        <Icon icon="solar:question-circle-bold" className="h-4.5 w-4.5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                            {item.category}
                          </span>
                          <p className="text-sm font-extrabold leading-6 text-slate-950 sm:text-base">
                            {item.question}
                          </p>
                        </div>

                        {isOpened ? (
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            {item.answer}
                          </p>
                        ) : null}
                      </div>

                      <Icon
                        icon={
                          isOpened
                            ? "solar:alt-arrow-up-linear"
                            : "solar:alt-arrow-down-linear"
                        }
                        className="mt-1 h-5 w-5 shrink-0 text-slate-400"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-950">
                    최근 공지
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    중요한 안내를 확인해 주세요.
                  </p>
                </div>
                <Icon icon="solar:bell-bing-bold-duotone" className="h-6 w-6 text-brand-main" />
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {noticeItems.map((notice) => (
                  <div key={notice.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-brand-main">
                        {notice.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {notice.date}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                      {notice.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-blue-50 p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ring-1 ring-blue-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-main shadow-sm ring-1 ring-blue-100">
                <Icon icon="solar:letter-bold-duotone" className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-lg font-extrabold text-slate-950">
                해결되지 않았나요?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                문의 내용을 정리해서 보내주시면 담당자가 확인 후 답변합니다.
              </p>

              <a
                href="mailto:hello@submate.app"
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-extrabold text-brand-main shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-50 active:scale-95"
              >
                hello@submate.app
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function SupportMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function SupportInfoCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] ring-1 ring-slate-100">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-brand-main ring-1 ring-slate-100">
        <Icon icon={icon} className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-extrabold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
