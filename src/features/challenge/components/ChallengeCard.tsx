// src/features/challenge/components/ChallengeCard.tsx
import { useMemo } from "react";
import { CalendarDays, Flame, Flag, Sparkles } from "lucide-react";

type Props = {
  currentMonth: number;
  startDate: Date;
};

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function diffInDays(a: Date, b: Date) {
  // a - b (days)
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export const ChallengeCard = ({ currentMonth, startDate }: Props) => {
  const today = new Date();

  const totalMonths = 6;
  const safeMonth = Math.max(0, Math.min(currentMonth, totalMonths));
  const progressPercent = Math.min((safeMonth / totalMonths) * 100, 100);

  const startedLabel = startDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const endDate = useMemo(() => addMonths(startDate, totalMonths), [startDate]);
  const endLabel = endDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const elapsedDays = Math.max(0, diffInDays(today, startDate));
  const remainingDays = Math.max(0, diffInDays(endDate, today));
  const remainingMonths = Math.max(totalMonths - safeMonth, 0);

  const statusLabel = safeMonth >= totalMonths ? "완료" : "진행 중";

  const milestones = [1, 3, 6];
  const nextMilestone = milestones.find((m) => safeMonth < m) ?? null;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              구독 적립 챌린지
            </h3>

            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
              <Sparkles className="h-3.5 w-3.5" />
              6개월
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            구독료를 줄이고, 남는 금액을 적립해요.
          </p>
        </div>

        <div
          className={[
            "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
            statusLabel === "완료"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-brand-accent/20 bg-brand-accent/10 text-emerald-700",
          ].join(" ")}
        >
          <Flame className="h-3.5 w-3.5" />
          {statusLabel}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>진행률</span>
          <span>
            {safeMonth} / {totalMonths}개월
          </span>
        </div>

        <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-linear-to-r from-brand-main to-brand-sub transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
            aria-label="진행률 바"
          />
        </div>

        {/* Milestones */}
        <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-400">
          {milestones.map((m) => {
            const reached = safeMonth >= m;
            return (
              <div key={m} className="flex items-center gap-2">
                <div
                  className={[
                    "h-2.5 w-2.5 rounded-full border",
                    reached
                      ? "border-brand-main bg-brand-main"
                      : "border-slate-200 bg-white",
                  ].join(" ")}
                />
                <span className={reached ? "text-slate-600" : ""}>{m}개월</span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-xs text-slate-400">
          {statusLabel === "완료" ? (
            <span>축하해요! 6개월 챌린지를 완료했어요 🎉</span>
          ) : nextMilestone ? (
            <span>
              다음 목표까지{" "}
              <span className="font-bold text-slate-600">
                약 {nextMilestone - safeMonth}개월
              </span>{" "}
              남았어요.
            </span>
          ) : (
            <span>꾸준히 잘 하고 있어요!</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500">경과</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {elapsedDays}일
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500">남은 기간</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {remainingMonths}개월
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500">D-day</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {statusLabel === "완료" ? "D+0" : `D-${remainingDays}`}
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 시작일 */}
        <div className="rounded-2xl border border-brand-sub/20 bg-brand-sub/10 p-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="
        flex shrink-0 items-center justify-center bg-white shadow-sm
        h-10 w-10 rounded-2xl text-brand-main
        sm:h-8 sm:w-8 sm:rounded-xl
      "
            >
              <CalendarDays className="h-5 w-5 sm:h-4 sm:w-4" />
            </div>

            {/* Text */}
            <div>
              <p className="text-[11px] font-bold text-brand-main">시작일</p>
              <p
                className="
          mt-0.5 font-medium text-slate-700
          text-sm sm:text-[13px]
        "
              >
                {startedLabel}
              </p>
            </div>
          </div>
        </div>

        {/* 종료일 */}
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="
        flex shrink-0 items-center justify-center bg-white shadow-sm
        h-10 w-10 rounded-2xl text-slate-700
        sm:h-8 sm:w-8 sm:rounded-xl
      "
            >
              <Flag className="h-5 w-5 sm:h-4 sm:w-4" />
            </div>

            {/* Text */}
            <div>
              <p className="text-[11px] font-bold text-slate-600">종료 예정</p>
              <p
                className="
          mt-0.5 font-medium text-slate-700
          text-sm sm:text-[13px]
        "
              >
                {endLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline details instead of "상세" navigation */}
      <details className="group mt-5 rounded-2xl border border-slate-100 bg-white/70 p-4">
        <summary className="cursor-pointer list-none select-none">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">
                이번 챌린지 가이드
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                상세 페이지 대신 여기서 핵심만 빠르게 확인해요.
              </p>
            </div>

            <div className="ml-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 transition group-open:bg-slate-50">
              {(() => {
                const label = statusLabel === "완료" ? "닫기" : "보기";
                return label;
              })()}
            </div>
          </div>
        </summary>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-bold text-slate-900">추천 루틴</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>• 이번 달 구독 조합을 1번만 정리해요.</li>
              <li>• 불필요한 구독 1개는 해지(또는 연간/번들 전환)해요.</li>
              <li>• 절감액은 “적립”으로 고정해요.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-bold text-slate-900">다음 목표</p>
            <p className="mt-2 text-sm text-slate-600">
              {statusLabel === "완료" ? (
                <span>완료한 챌린지를 리포트로 정리해 보세요.</span>
              ) : nextMilestone ? (
                <span>
                  <span className="font-bold text-slate-900">
                    {nextMilestone}개월
                  </span>{" "}
                  마일스톤을 목표로, 이번 달은 “구독 1개 최적화”만 해도
                  충분해요.
                </span>
              ) : (
                <span>현재 페이스 유지가 최고예요.</span>
              )}
            </p>
          </div>
        </div>
      </details>
    </div>
  );
};
