import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type ProvisionType = "INVITE_CODE" | "ACCOUNT_SHARE" | string;
type ProvisionStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "ACTIVE"
  | "RESET_REQUIRED"
  | string;
type MemberStatus =
  | "WAITING"
  | "REQUIRED"
  | "ACTIVE"
  | "RESET_REQUIRED"
  | string;

type ProvisionMember = {
  provisionMemberId: number;
  partyMemberId: number;
  userId: number;
  nickname: string;
  submateEmail?: string | null;
  memberStatus: MemberStatus;
  inviteSentAt: string | null;
  mustCompleteBy: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  activatedAt: string | null;
  lastResetAt: string | null;
  penaltyApplied: boolean;
  provisionMessage: string | null;
};

type PartyProvisionResponse = {
  provisionId: number;
  partyId: number;
  provisionType: ProvisionType;
  provisionStatus: ProvisionStatus;
  inviteValue: string | null;
  sharedAccountEmail: string | null;
  provisionGuide: string | null;
  totalMemberCount: number;
  activeMemberCount: number;
  provisionStartedAt: string | null;
  provisionCompletedAt: string | null;
  lastResetAt: string | null;
  members: ProvisionMember[];
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

function unwrapResponse<T>(
  value: T | ApiEnvelope<T> | undefined | null,
): T | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null) {
    const maybeEnvelope = value as ApiEnvelope<T>;

    if (maybeEnvelope.data) return maybeEnvelope.data;
    if (maybeEnvelope.result) return maybeEnvelope.result;
    if (maybeEnvelope.payload) return maybeEnvelope.payload;
  }

  return value as T;
}

function getProvisionStatusLabel(status: ProvisionStatus) {
  if (status === "WAITING") return "이용 확인 대기";
  if (status === "IN_PROGRESS") return "확인 진행 중";
  if (status === "ACTIVE") return "이용 중";
  if (status === "RESET_REQUIRED") return "재확인 필요";
  return status;
}

function getMemberStatusLabel(status: MemberStatus) {
  if (status === "WAITING") return "대기";
  if (status === "REQUIRED") return "확인 필요";
  if (status === "ACTIVE") return "확인 완료";
  if (status === "RESET_REQUIRED") return "재확인 필요";
  return status;
}

function getProvisionTypeLabel(type: ProvisionType) {
  if (type === "INVITE_CODE") return "초대 코드";
  if (type === "ACCOUNT_SHARE") return "공유 계정";
  return type;
}

function isInviteCodeProvision(type: ProvisionType) {
  return type === "INVITE_CODE" || type === "INVITE_LINK";
}

function getStatusStyle(status: string) {
  if (status === "ACTIVE") {
    return "bg-teal-50 text-teal-700 ring-teal-100";
  }

  if (status === "IN_PROGRESS" || status === "REQUIRED") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  if (status === "RESET_REQUIRED") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function getStatusTone(status: string) {
  if (status === "ACTIVE") {
    return {
      icon: "solar:check-circle-bold",
      className: "bg-[#EAFBF5] text-[#0F766E] ring-[#BDEFE4]",
    };
  }

  if (status === "IN_PROGRESS" || status === "REQUIRED") {
    return {
      icon: "solar:clock-circle-bold",
      className: "bg-[#EEF4FF] text-[#1E3A8A] ring-[#D9E6FF]",
    };
  }

  if (status === "RESET_REQUIRED") {
    return {
      icon: "solar:refresh-circle-bold",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
    };
  }

  return {
    icon: "solar:info-circle-bold",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  };
}

function formatDateTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function PartyProvisionDashboardPage() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();
  const [provision, setProvision] = useState<PartyProvisionResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const progressPercent = useMemo(() => {
    if (!provision || provision.totalMemberCount <= 0) return 0;

    return Math.min(
      100,
      Math.round(
        (provision.activeMemberCount / provision.totalMemberCount) * 100,
      ),
    );
  }, [provision]);

  const pendingMemberCount = useMemo(() => {
    if (!provision) return 0;
    return Math.max(
      0,
      provision.totalMemberCount - provision.activeMemberCount,
    );
  }, [provision]);

  useEffect(() => {
    const fetchProvision = async () => {
      if (!partyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await api.get(`/api/v1/parties/${partyId}/provision`);
        const data = unwrapResponse<PartyProvisionResponse>(response.data);
        console.log(data);

        if (!data) {
          toast.error("파티 이용 현황을 확인할 수 없습니다.");
          return;
        }

        setProvision(data);
      } catch (error) {
        console.error(error);
        toast.error("파티 이용 현황을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvision();
  }, [partyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-96 w-full max-w-3xl items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-blue-900"
            />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              파티 이용 현황을 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!provision) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <Icon
            icon="solar:danger-circle-bold"
            className="mx-auto h-12 w-12 text-slate-300"
          />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            표시할 이용 현황이 없습니다.
          </p>
          <button
            onClick={() => navigate("/myparty")}
            className="mt-7 rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-950"
          >
            나의 파티 목록으로 이동
          </button>
        </div>
      </div>
    );
  }

  const provisionTone = getStatusTone(provision.provisionStatus);
  const showInviteGuideButton = isInviteCodeProvision(provision.provisionType);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[760px]">
        <header className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/myparty")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            aria-label="나의 파티로 이동"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
          </button>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${provisionTone.className}`}
          >
            <Icon icon={provisionTone.icon} className="h-4 w-4" />
            {getProvisionStatusLabel(provision.provisionStatus)}
          </span>
        </header>

        <section className="mt-5 rounded-[32px] border border-slate-200 bg-white px-5 py-6 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.32)] sm:px-7 sm:py-7">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#14B8A6]">파티 이용 현황</p>
              <h1 className="mt-2 text-[28px] font-extrabold tracking-tight text-slate-950 sm:text-[34px]">
                {progressPercent}% 확인 완료
              </h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                파티원 이용 확인 상태가 실시간으로 반영됩니다.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-[#EAFBF5] text-[#0F766E] ring-1 ring-[#BDEFE4]">
              <Icon icon="solar:chart-2-bold" className="h-8 w-8" />
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>{provision.activeMemberCount}명 완료</span>
              <span>{pendingMemberCount}명 대기</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#14B8A6]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <MetricTile
              label="방식"
              value={getProvisionTypeLabel(provision.provisionType)}
            />
            <MetricTile
              label="완료"
              value={`${provision.activeMemberCount}/${provision.totalMemberCount}`}
            />
            <MetricTile
              label="등록"
              value={formatDateTime(provision.provisionStartedAt)}
            />
          </div>
        </section>

        {showInviteGuideButton && (
          <section className="mt-5 rounded-[28px] border border-sky-100 bg-sky-50 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-sky-600">INVITE</p>
                <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                  파티원 초대 방법
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  OTT 사이트의 추가 회원 초대 화면에 파티원 이메일을 입력해주세요.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(`/myparty/${partyId}/provision/invite-guide`)
                }
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-900 px-5 text-sm font-bold text-white transition hover:bg-blue-950"
              >
                <Icon icon="solar:map-arrow-right-bold" className="h-5 w-5" />
                초대 방법 보기
              </button>
            </div>
          </section>
        )}

        <section className="mt-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#14B8A6]">Members</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                파티원 확인 상태
              </h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
              {provision.members.length}명
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)]">
            {provision.members.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {provision.members.map((member) => (
                  <MemberItem key={member.provisionMemberId} member={member} />
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <Icon
                  icon="solar:user-rounded-bold"
                  className="mx-auto h-10 w-10 text-slate-300"
                />
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  표시할 파티원 정보가 없습니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#F8FAFC] px-3 py-4 text-center ring-1 ring-slate-100">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function MemberItem({ member }: { member: ProvisionMember }) {
  const memberTone = getStatusTone(member.memberStatus);

  return (
    <article className="px-5 py-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${memberTone.className}`}
        >
          <Icon icon={memberTone.icon} className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold text-slate-900">
                {member.nickname}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                확인 완료 {formatDateTime(member.confirmedAt)}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getStatusStyle(
                member.memberStatus,
              )}`}
            >
              {getMemberStatusLabel(member.memberStatus)}
            </span>
          </div>

          {member.provisionMessage && (
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {member.provisionMessage}
            </p>
          )}

          <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-3">
            <p className="rounded-2xl bg-[#F8FAFC] px-3 py-2">
              발송 {formatDateTime(member.inviteSentAt)}
            </p>
            <p className="rounded-2xl bg-[#F8FAFC] px-3 py-2">
              기한 {formatDateTime(member.mustCompleteBy)}
            </p>
            <p className="rounded-2xl bg-[#F8FAFC] px-3 py-2">
              활성화 {formatDateTime(member.activatedAt)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
