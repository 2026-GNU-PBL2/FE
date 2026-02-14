// src/features/challenge/ChallengePage.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Share2, MessageCircleHeart, ChevronRight } from "lucide-react";
import { mockServer } from "@/api/mockServer";
import { BenefitChart } from "@/features/challenge/components/BenefitChart";
import { PaymentHistory } from "@/features/challenge/components/PaymentHistory";
import { ChallengeCard } from "@/features/challenge/components/ChallengeCard";

const ChallengeMates = () => {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white/75 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
            className="h-10 w-10 rounded-full border-2 border-white object-cover"
            alt="사용자 1"
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop"
            className="h-10 w-10 rounded-full border-2 border-white object-cover"
            alt="사용자 2"
            loading="lazy"
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-slate-500">
            +2
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-900">챌린지 메이트</p>
          <p className="mt-0.5 text-xs text-slate-500">
            민지가 응원을 보냈어요!
          </p>
        </div>
      </div>

      <button
        type="button"
        className="rounded-full bg-brand-accent/15 p-2.5 text-brand-main transition hover:bg-brand-accent/20"
        aria-label="응원 보내기"
      >
        <MessageCircleHeart className="h-5 w-5" />
      </button>
    </div>
  );
};

export const ChallengePage = () => {
  // ✅ 플러그인 없이도 확실히 “등장 애니메이션” 트리거
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["challenge"],
    queryFn: mockServer.getChallenge,
  });

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-3 w-72 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="h-64 animate-pulse rounded-3xl border border-slate-100 bg-white lg:col-span-5" />
          <div className="h-64 animate-pulse rounded-3xl border border-slate-100 bg-white lg:col-span-7" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-slate-900">
          챌린지를 불러오지 못했어요.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const startDate = new Date(data.challenge.startDateISO);

  return (
    <div
      className={[
        "relative transform-gpu transition duration-500 ease-out",
        "motion-reduce:transition-none motion-reduce:transform-none",
        entered
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-95",
      ].join(" ")}
    >
      {/* Soft Background (프로젝트 톤 통일) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-50 -right-45 h-130 w-130 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -left-50 top-45 h-105 w-105 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">내 챌린지</h1>
            <p className="mt-1 text-base text-slate-500">
              구독 목표를 관리하고 진행 상황을 확인하세요.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-sub/15 px-5 py-2.5 text-sm font-semibold text-brand-main transition hover:bg-brand-sub/20 sm:w-auto"
          >
            <Share2 className="h-4 w-4" />
            진행 상황 공유
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left sticky column */}
          <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
            <ChallengeCard
              currentMonth={data.challenge.currentMonth}
              startDate={startDate}
            />

            <div className="hidden lg:block">
              <ChallengeMates />
            </div>
          </div>

          {/* Right column */}
          <div className="min-w-0 space-y-6 lg:col-span-7 xl:col-span-8">
            <div className="lg:hidden">
              <ChallengeMates />
            </div>

            {/* Chart */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="min-w-0 md:col-span-2">
                <BenefitChart
                  data={data.benefitChart}
                  currentMonth={data.challenge.currentMonth}
                />
              </div>
            </div>

            {/* Payment history */}
            <PaymentHistory historyData={data.paymentHistory} />

            {/* Bottom cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
                <h3 className="mb-2 text-sm font-bold text-slate-900">
                  구독 관리 팁
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  연간 요금제/번들 혜택을 활용하면 같은 서비스도 더 저렴하게
                  이용할 수 있어요. 스마트 스왑에서 추천 조합을 확인해 보세요.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-main transition hover:opacity-90"
                >
                  스마트 스왑 추천 보기
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
                <h3 className="mb-2 text-sm font-bold text-slate-900">
                  내 리워드
                </h3>

                <div className="mt-3 flex gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                    🎁
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl opacity-50">
                    🎫
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl opacity-50">
                    🎟️
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  지금 받을 수 있는 리워드가 2개 있어요.
                </p>

                <button
                  type="button"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-brand-main px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
                >
                  리워드 받기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
