import { Icon } from "@iconify/react";
import { useState } from "react";
import { Link } from "react-router-dom";

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
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                Support
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">
                고객센터
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                자주 묻는 질문을 먼저 확인하고, 필요한 경우 바로 문의를 남길 수
                있습니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/support/inquiry"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Icon icon="solar:pen-new-square-bold" className="text-base" />
                문의하기
              </Link>

              <Link
                to="/support/history"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Icon icon="solar:document-text-bold" className="text-base" />
                문의 내역
              </Link>
            </div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <Link
              to="/support/notice"
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm ring-1 ring-slate-200/70">
                  <Icon icon="solar:bell-bing-bold" className="text-xl" />
                </div>
                <Icon
                  icon="solar:arrow-right-linear"
                  className="text-lg text-slate-300 transition group-hover:translate-x-0.5"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                공지사항
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                점검, 정책 변경, 운영 관련 소식을 확인하세요.
              </p>
            </Link>

            <Link
              to="/support/guide"
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm ring-1 ring-slate-200/70">
                  <Icon icon="solar:book-bookmark-bold" className="text-xl" />
                </div>
                <Icon
                  icon="solar:arrow-right-linear"
                  className="text-lg text-slate-300 transition group-hover:translate-x-0.5"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                이용 가이드
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                월 이용권, 파티 운영, 정산 구조를 쉽게 확인하세요.
              </p>
            </Link>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <Icon icon="solar:chat-round-dots-bold" className="text-xl" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                빠른 처리 팁
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                결제 시간, 오류 화면, 파티 정보가 있으면 더 빠르게 확인할 수
                있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={[
                  "rounded-full px-3.5 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950 sm:text-lg">
                  자주 묻는 질문
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  가장 많이 찾는 문의를 먼저 정리했습니다.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                {filteredFaqs.length}개
              </div>
            </div>

            <div className="px-5">
              {filteredFaqs.map((item) => {
                const isOpened = openedFaqIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(item.id)}
                      className="flex w-full items-start gap-3 py-4 text-left"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Icon
                          icon="solar:question-circle-bold"
                          className="text-lg"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {item.category}
                          </span>
                          <p className="text-sm font-medium leading-6 text-slate-900">
                            {item.question}
                          </p>
                        </div>

                        {isOpened ? (
                          <p className="mt-3 pr-2 text-sm leading-7 text-slate-500">
                            {item.answer}
                          </p>
                        ) : null}
                      </div>

                      <div className="pt-1 text-slate-400">
                        <Icon
                          icon={
                            isOpened
                              ? "solar:alt-arrow-up-linear"
                              : "solar:alt-arrow-down-linear"
                          }
                          className="text-base"
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    최근 공지
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    최근 등록된 안내를 확인해 주세요.
                  </p>
                </div>

                <Link
                  to="/support/notice"
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  전체보기
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {noticeItems.map((notice) => (
                  <Link
                    key={notice.id}
                    to={`/support/notice/${notice.id}`}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                        {notice.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {notice.date}
                      </span>
                    </div>

                    <p className="mt-2.5 text-sm font-medium leading-6 text-slate-900">
                      {notice.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-teal-50 via-sky-50 to-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm ring-1 ring-white">
                <Icon icon="solar:shield-check-bold" className="text-xl" />
              </div>

              <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
                문의 전에 확인해 주세요
              </h2>

              <div className="mt-4 space-y-2.5">
                <div className="rounded-2xl bg-white/90 p-3.5 ring-1 ring-white">
                  <p className="text-sm leading-6 text-slate-600">
                    결제 관련 문의는 결제 시각과 오류 화면을 함께 남기면 더 빠른
                    확인이 가능합니다.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/90 p-3.5 ring-1 ring-white">
                  <p className="text-sm leading-6 text-slate-600">
                    신고 접수 시 파티 정보와 사유를 함께 남기면 처리에 도움이
                    됩니다.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/90 p-3.5 ring-1 ring-white">
                  <p className="text-sm leading-6 text-slate-600">
                    자주 묻는 질문에서 해결되지 않는 경우 1:1 문의로 접수하는
                    흐름이 가장 효율적입니다.
                  </p>
                </div>
              </div>

              <Link
                to="/support/inquiry"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                1:1 문의 바로가기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
