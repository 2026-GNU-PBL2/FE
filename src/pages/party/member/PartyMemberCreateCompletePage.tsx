import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";

type PartyJoinApplyResponse = {
  joined: boolean;
  waiting: boolean;
  message: string;
};

function getStatusContent(result: PartyJoinApplyResponse | null) {
  if (result?.joined) {
    return {
      badge: "ACTIVE",
      icon: "solar:check-circle-bold",
      iconClassName: "bg-white text-[#00875A] ring-[#A9E6C9]",
      title: "파티 참여가 완료되었습니다",
      description:
        result.message || "즉시 참여 가능한 파티에 정상적으로 참여했습니다.",
    };
  }

  if (result?.waiting) {
    return {
      badge: "WAITING",
      icon: "solar:clock-circle-bold",
      iconClassName: "bg-white text-amber-500 ring-amber-100",
      title: "자동 매칭 대기열에 등록되었습니다",
      description:
        result.message ||
        "즉시 참여 가능한 파티가 없어 자동 매칭 대기 상태로 등록했습니다.",
    };
  }

  return {
    badge: "REQUESTED",
    icon: "solar:clipboard-check-bold",
    iconClassName: "bg-white text-[#00875A] ring-[#A9E6C9]",
    title: "파티 참여 신청이 접수되었습니다",
    description: result?.message || "파티 참여 신청 결과를 확인해 주세요.",
  };
}

export default function PartyMemberCreateCompletePage() {
  const location = useLocation();
  const result = location.state as PartyJoinApplyResponse | null;
  const content = getStatusContent(result);

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[520px] items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] bg-white text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-linear-to-br from-emerald-50 via-white to-emerald-50 px-6 py-10">
            <div
              className={[
                "mx-auto flex h-18 w-18 items-center justify-center rounded-full shadow-sm ring-1",
                content.iconClassName,
              ].join(" ")}
            >
              <Icon icon={content.icon} className="h-10 w-10" />
            </div>

            <h1 className="mt-6 text-[27px] font-extrabold tracking-tight text-slate-950 sm:text-[30px]">
              {content.title}
            </h1>

            <p className="mt-3 text-[15px] leading-6 text-slate-500">
              {content.description}
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="mx-auto mb-6 flex h-2 w-16 overflow-hidden rounded-full bg-emerald-50">
              <div className="h-full w-full rounded-full bg-[#00A86B]" />
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/myparty"
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#00A86B] text-[15px] font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-[#00875A]"
              >
                내 파티로 이동
              </Link>

              <Link
                to="/parties/member"
                className="inline-flex h-14 w-full items-center justify-center rounded-full border border-slate-100 bg-white text-[15px] font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
              >
                파티 목록으로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
