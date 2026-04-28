import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type ProvisionType = "INVITE_LINK" | "SHARED_ACCOUNT" | string;
type ProvisionStatus = "WAITING" | "ACTIVE" | "RESET_REQUIRED" | string;
type MemberStatus =
  | "WAITING"
  | "ACTIVE"
  | "RESET_REQUIRED"
  | "COMPLETED"
  | string;

type ProvisionMember = {
  provisionMemberId: number;
  partyMemberId: number;
  userId: number;
  nickname: string;
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
  if (status === "ACTIVE") return "이용 중";
  if (status === "RESET_REQUIRED") return "재확인 필요";
  return status;
}

function getMemberStatusLabel(status: MemberStatus) {
  if (status === "WAITING") return "확인 대기";
  if (status === "ACTIVE") return "이용 중";
  if (status === "COMPLETED") return "확인 완료";
  if (status === "RESET_REQUIRED") return "재확인 필요";
  return status;
}

function getProvisionTypeLabel(type: ProvisionType) {
  if (type === "INVITE_LINK") return "초대 링크";
  if (type === "SHARED_ACCOUNT") return "공유 계정";
  return type;
}

function getStatusStyle(status: string) {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "bg-teal-50 text-teal-700 ring-teal-100";
  }

  if (status === "WAITING") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  if (status === "RESET_REQUIRED") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
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

export default function MyPartyDetailPage() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();

  const [provision, setProvision] = useState<PartyProvisionResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isWaitingRecruit, setIsWaitingRecruit] = useState(false);

  const progressPercent = useMemo(() => {
    if (!provision || provision.totalMemberCount <= 0) return 0;

    return Math.min(
      100,
      Math.round(
        (provision.activeMemberCount / provision.totalMemberCount) * 100,
      ),
    );
  }, [provision]);

  useEffect(() => {
    const fetchProvision = async () => {
      if (!partyId) {
        setIsWaitingRecruit(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsWaitingRecruit(false);

        const response = await api.get(`/api/v1/parties/${partyId}/provision`);
        const data = unwrapResponse<PartyProvisionResponse>(response.data);

        if (!data) {
          setIsWaitingRecruit(true);
          return;
        }

        setProvision(data);
      } catch (error) {
        console.error(error);
        setIsWaitingRecruit(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvision();
  }, [partyId]);

  const handleCopyInviteValue = async () => {
    if (!provision?.inviteValue) return;

    try {
      await navigator.clipboard.writeText(provision.inviteValue);
      toast.success("이용 정보가 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

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

  if (isWaitingRecruit || !provision) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-500">
              <Icon icon="solar:users-group-rounded-bold" className="h-9 w-9" />
            </div>

            <h1 className="mt-6 text-2xl font-extrabold text-slate-950">
              아직 파티원을 모집 중입니다
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              정해진 인원이 모두 모이면 이용 정보가 열립니다. 파티 구성이 완료될
              때까지 조금만 기다려주세요.
            </p>

            <button
              onClick={() => navigate("/myparty")}
              className="mt-8 rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-950"
            >
              나의 파티 목록으로 이동
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-900"
        >
          <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
          이전으로
        </button>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-blue-900 px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-sky-200">
                  Submate Provision
                </p>

                <h1 className="mt-2 text-2xl font-extrabold">파티 이용 현황</h1>

                <p className="mt-3 text-sm leading-6 text-blue-100">
                  파티 이용 정보와 멤버별 이용 확인 상태를 확인할 수 있습니다.
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${getStatusStyle(
                  provision.provisionStatus,
                )}`}
              >
                {getProvisionStatusLabel(provision.provisionStatus)}
              </span>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoCard
                label="이용 방식"
                value={getProvisionTypeLabel(provision.provisionType)}
                icon="solar:link-circle-bold"
              />
              <InfoCard
                label="참여 인원"
                value={`${provision.activeMemberCount}/${provision.totalMemberCount}명`}
                icon="solar:users-group-two-rounded-bold"
              />
              <InfoCard
                label="시작일"
                value={formatDateTime(provision.provisionStartedAt)}
                icon="solar:calendar-bold"
              />
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    이용 활성화 진행률
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    파티원이 이용 확인을 완료하면 자동으로 반영됩니다.
                  </p>
                </div>

                <p className="text-xl font-extrabold text-blue-900">
                  {progressPercent}%
                </p>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                <div
                  className="h-full rounded-full bg-teal-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {(provision.inviteValue || provision.sharedAccountEmail) && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-900">
                      이용 정보
                    </p>

                    {provision.sharedAccountEmail && (
                      <p className="mt-3 truncate text-sm font-semibold text-slate-600">
                        계정 이메일: {provision.sharedAccountEmail}
                      </p>
                    )}

                    {provision.inviteValue && (
                      <p className="mt-2 break-all rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                        {provision.inviteValue}
                      </p>
                    )}
                  </div>

                  {provision.inviteValue && (
                    <button
                      onClick={handleCopyInviteValue}
                      className="shrink-0 rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
                    >
                      복사
                    </button>
                  )}
                </div>
              </div>
            )}

            {provision.provisionGuide && (
              <div className="mt-6 rounded-3xl bg-teal-50 px-5 py-4 text-sm font-semibold leading-6 text-teal-800 ring-1 ring-teal-100">
                {provision.provisionGuide}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div>
            <p className="text-sm font-bold text-slate-400">Members</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950">
              파티원 이용 확인
            </h2>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-900 ring-1 ring-slate-200">
        <Icon icon={icon} className="h-6 w-6" />
      </div>

      <p className="mt-4 text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function MemberItem({ member }: { member: ProvisionMember }) {
  return (
    <div className="px-5 py-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-blue-900 ring-1 ring-slate-200">
          <Icon icon="solar:user-rounded-bold" className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-extrabold text-slate-800">
              {member.nickname}
            </p>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getStatusStyle(
                member.memberStatus,
              )}`}
            >
              {getMemberStatusLabel(member.memberStatus)}
            </span>

            {member.penaltyApplied && (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-100">
                패널티 적용
              </span>
            )}
          </div>

          {member.provisionMessage && (
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {member.provisionMessage}
            </p>
          )}

          <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-2">
            <p>초대 발송: {formatDateTime(member.inviteSentAt)}</p>
            <p>완료 기한: {formatDateTime(member.mustCompleteBy)}</p>
            <p>확인 완료: {formatDateTime(member.confirmedAt)}</p>
            <p>이용 활성화: {formatDateTime(member.activatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
