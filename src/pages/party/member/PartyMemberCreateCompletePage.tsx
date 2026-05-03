import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";

type PartyJoinApplyResponse = {
  joined: boolean;
  waiting: boolean;
  partyId: number;
  joinRequestId: number;
  message: string;
};

function getStatusContent(result: PartyJoinApplyResponse | null) {
  if (result?.joined) {
    return {
      badge: "ACTIVE",
      icon: "solar:check-circle-bold",
      iconClassName: "bg-[#EAFBF5] text-[#2DD4BF]",
      title: "파티 참여가 완료되었습니다",
      description:
        result.message || "즉시 참여 가능한 파티에 정상적으로 참여했습니다.",
    };
  }

  if (result?.waiting) {
    return {
      badge: "WAITING",
      icon: "solar:clock-circle-bold",
      iconClassName: "bg-amber-50 text-amber-500",
      title: "자동 매칭 대기열에 등록되었습니다",
      description:
        result.message ||
        "즉시 참여 가능한 파티가 없어 자동 매칭 대기 상태로 등록했습니다.",
    };
  }

  return {
    badge: "REQUESTED",
    icon: "solar:clipboard-check-bold",
    iconClassName: "bg-[#EEF4FF] text-[#1E3A8A]",
    title: "파티 참여 신청이 접수되었습니다",
    description: result?.message || "파티 참여 신청 결과를 확인해 주세요.",
  };
}

export default function PartyMemberCreateCompletePage() {
  const location = useLocation();
  const result = location.state as PartyJoinApplyResponse | null;
  const content = getStatusContent(result);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-120 items-center justify-center">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white px-5 py-6 text-center shadow-[0_24px_70px_-36px_rgba(15,23,42,0.22)] sm:px-8 sm:py-8">
          <div
            className={[
              "mx-auto flex h-18 w-18 items-center justify-center rounded-full",
              content.iconClassName,
            ].join(" ")}
          >
            <Icon icon={content.icon} className="h-9 w-9" />
          </div>

          <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-[#0F766E]">
            {content.badge}
          </p>

          <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950 sm:text-[32px]">
            {content.title}
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
            {content.description}
          </p>

          <div className="mt-8 space-y-3 rounded-[28px] bg-slate-50 px-5 py-5 text-left">
            <div className="rounded-2xl bg-white px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">
                PARTY ID
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                {result?.partyId || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">
                JOIN REQUEST ID
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                {result?.joinRequestId || "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              to="/myparty"
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#14B8A6] text-base font-semibold tracking-tight text-white"
            >
              내 파티로 이동
            </Link>

            <Link
              to="/parties/member"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold tracking-tight text-slate-700"
            >
              파티 목록으로 이동
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
