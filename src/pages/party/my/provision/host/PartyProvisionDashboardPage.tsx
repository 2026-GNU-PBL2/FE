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

type PartySettingsResponse = {
  ottServiceName?: string | null;
  partyCreatedAt?: string | null;
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
      className: "bg-[#EEF4FF] text-[#1E3A8A] ring-[#D9E6FF]",
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

function formatDate(value?: string | null) {
  if (!value) return "-";

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateOnlyMatch) {
    return `${dateOnlyMatch[1]}.${dateOnlyMatch[2]}.${dateOnlyMatch[3]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function PartyProvisionDashboardPage() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();
  const [provision, setProvision] = useState<PartyProvisionResponse | null>(
    null,
  );
  const [partySettings, setPartySettings] =
    useState<PartySettingsResponse | null>(null);
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

  const memberSchedule = useMemo(() => {
    if (!provision?.members.length) {
      return {
        inviteSentAt: null,
        mustCompleteBy: null,
      };
    }

    const inviteSentAtValues = [
      ...new Set(
        provision.members
          .map((member) => member.inviteSentAt)
          .filter((value): value is string => Boolean(value)),
      ),
    ];
    const mustCompleteByValues = [
      ...new Set(
        provision.members
          .map((member) => member.mustCompleteBy)
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    return {
      inviteSentAt:
        inviteSentAtValues.length === 1 ? inviteSentAtValues[0] : null,
      mustCompleteBy:
        mustCompleteByValues.length === 1 ? mustCompleteByValues[0] : null,
    };
  }, [provision]);

  useEffect(() => {
    const fetchProvision = async () => {
      if (!partyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const [provisionResult, settingsResult] = await Promise.allSettled([
          api.get(`/api/v1/parties/${partyId}/provision`),
          api.get(`/api/v1/parties/${partyId}/settings`),
        ]);

        if (settingsResult.status === "fulfilled") {
          const settingsData = unwrapResponse<PartySettingsResponse>(
            settingsResult.value.data,
          );
          setPartySettings(settingsData);
        } else {
          setPartySettings(null);
        }

        if (provisionResult.status === "rejected") {
          throw provisionResult.reason;
        }

        const data = unwrapResponse<PartyProvisionResponse>(
          provisionResult.value.data,
        );

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
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-3xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-brand-main"
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
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl rounded-[32px] bg-white px-6 py-12 text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <Icon
            icon="solar:danger-circle-bold"
            className="mx-auto h-12 w-12 text-slate-300"
          />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            표시할 이용 현황이 없습니다.
          </p>
          <button
            onClick={() => navigate("/myparty")}
            className="mt-7 inline-flex h-13 items-center justify-center rounded-full bg-brand-main px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            나의 파티 목록으로 이동
          </button>
        </div>
      </div>
    );
  }

  const provisionTone = getStatusTone(provision.provisionStatus);
  return (
    <div className="min-h-screen bg-brand-bg px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/myparty")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50 hover:text-brand-main"
            aria-label="나의 파티로 이동"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${provisionTone.className}`}
            >
              <Icon icon={provisionTone.icon} className="h-4 w-4" />
              {getProvisionStatusLabel(provision.provisionStatus)}
            </span>
            <button
              type="button"
              onClick={() => navigate(`/myparty/${partyId}/provision/settings`)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50 hover:text-brand-main"
              aria-label="파티 설정으로 이동"
            >
              <Icon icon="solar:settings-bold" className="h-5 w-5" />
            </button>
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-linear-to-br from-blue-50 via-white to-sky-50 px-5 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-extrabold text-brand-main">HOST PARTY</p>
              <h1 className="mt-2 truncate text-[28px] font-extrabold tracking-tight text-slate-950">
                {partySettings?.ottServiceName || "파티 정보"}
              </h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {partySettings?.partyCreatedAt
                  ? `${formatDate(partySettings.partyCreatedAt)} 생성`
                  : "운영 중인 파티"}
              </p>
            </div>
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-main shadow-sm ring-1 ring-blue-100">
              <Icon icon="solar:crown-star-bold" className="h-6 w-6" />
            </div>
          </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-brand-main">
                  파티 이용 현황
                </p>
                <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-slate-950">
                  이용 확인 현황
                </h2>
                <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-500">
                  파티원 이용 확인 상태가 실시간으로 반영됩니다.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
                <Icon icon="solar:chart-2-bold" className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-400">
                <span>{progressPercent}% 확인 완료</span>
                <span>
                  {provision.activeMemberCount}명 완료 / {pendingMemberCount}명
                  대기
                </span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-main"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
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
          </div>

        </section>

        <section className="mt-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[13px] font-extrabold text-brand-main">Members</p>
              <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-slate-950">
                파티원 확인 상태
              </h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-100">
              {provision.members.length}명
            </span>
          </div>

          {(memberSchedule.inviteSentAt || memberSchedule.mustCompleteBy) && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {memberSchedule.inviteSentAt && (
                <ScheduleTile
                  icon="solar:letter-bold"
                  label="공통 발송 시각"
                  value={formatDateTime(memberSchedule.inviteSentAt)}
                />
              )}
              {memberSchedule.mustCompleteBy && (
                <ScheduleTile
                  icon="solar:calendar-mark-bold"
                  label="공통 확인 기한"
                  value={formatDateTime(memberSchedule.mustCompleteBy)}
                />
              )}
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
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
    <div className="min-w-0 rounded-2xl bg-slate-50 px-3 py-4 text-center ring-1 ring-slate-100">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ScheduleTile({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm shadow-slate-900/5 ring-1 ring-slate-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
        <Icon icon={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function MemberItem({ member }: { member: ProvisionMember }) {
  const memberTone = getStatusTone(member.memberStatus);

  return (
    <article className="px-5 py-5 sm:px-6">
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
                활성화 {formatDateTime(member.activatedAt)}
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
        </div>
      </div>
    </article>
  );
}
