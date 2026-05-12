import { Icon } from "@iconify/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type ProvisionType =
  | "INVITE_CODE"
  | "INVITE_LINK"
  | "ACCOUNT_SHARE"
  | "SHARED_ACCOUNT"
  | string;
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
  | "COMPLETED"
  | "RESET_REQUIRED"
  | string;

type PartyMemberProvisionMeResponse = {
  partyId?: number;
  productName?: string | null;
  provisionType?: ProvisionType | null;
  provisionStatus?: ProvisionStatus | null;
  memberStatus?: MemberStatus | null;
  inviteValue?: string | null;
  sharedAccountEmail?: string | null;
  maskedSharedAccountPassword?: string | null;
  passwordRevealAvailable?: boolean | null;
  provisionGuide?: string | null;
  provisionStartedAt?: string | null;
  provisionCompletedAt?: string | null;
  lastResetAt?: string | null;
  provision?: {
    provisionType?: ProvisionType | null;
    provisionStatus?: ProvisionStatus | null;
    inviteValue?: string | null;
    sharedAccountEmail?: string | null;
    maskedSharedAccountPassword?: string | null;
    passwordRevealAvailable?: boolean | null;
    provisionGuide?: string | null;
    provisionStartedAt?: string | null;
    provisionCompletedAt?: string | null;
    lastResetAt?: string | null;
  } | null;
  member?: {
    memberStatus?: MemberStatus | null;
    provisionMessage?: string | null;
  } | null;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

type SharedAccountPasswordResponse = {
  sharedAccountPassword?: string | null;
};

const INVITE_CODE_PLACEHOLDER_VALUE = "https://submate.example/invite-code";

function getVisibleInviteValue(value?: string | null) {
  if (!value || value === INVITE_CODE_PLACEHOLDER_VALUE) return null;
  return value;
}

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

function getProvisionTypeLabel(type?: ProvisionType | null) {
  if (type === "INVITE_CODE" || type === "INVITE_LINK") return "초대 링크";
  if (type === "ACCOUNT_SHARE" || type === "SHARED_ACCOUNT") return "공유 계정";
  return type || "-";
}

function isInviteProvisionType(type?: ProvisionType | null) {
  return type === "INVITE_CODE" || type === "INVITE_LINK";
}

function isConfirmedStatus(status?: MemberStatus | null) {
  return status === "ACTIVE" || status === "COMPLETED";
}

function getProvisionStatusLabel(status?: ProvisionStatus | null) {
  if (status === "WAITING") return "이용 확인 대기";
  if (status === "IN_PROGRESS") return "확인 진행 중";
  if (status === "ACTIVE") return "이용 중";
  if (status === "RESET_REQUIRED") return "재확인 필요";
  return status || "-";
}

function getMemberStatusLabel(status?: MemberStatus | null) {
  if (status === "WAITING") return "대기";
  if (status === "REQUIRED") return "확인 필요";
  if (status === "ACTIVE" || status === "COMPLETED") return "확인 완료";
  if (status === "RESET_REQUIRED") return "재확인 필요";
  return status || "-";
}

function getStatusStyle(status?: string | null) {
  if (status === "ACTIVE" || status === "COMPLETED") {
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

function getStatusTone(status?: string | null) {
  if (status === "ACTIVE" || status === "COMPLETED") {
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

export default function PartyMemberProvisionDashboardPage() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();
  const [provisionMe, setProvisionMe] =
    useState<PartyMemberProvisionMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sharedAccountPassword, setSharedAccountPassword] = useState<
    string | null
  >(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const view = useMemo(() => {
    const provision = provisionMe?.provision;
    const member = provisionMe?.member;

    return {
      productName: provisionMe?.productName || "파티 이용 현황",
      provisionType: provision?.provisionType ?? provisionMe?.provisionType,
      provisionStatus:
        provision?.provisionStatus ?? provisionMe?.provisionStatus,
      memberStatus: member?.memberStatus ?? provisionMe?.memberStatus,
      inviteValue: getVisibleInviteValue(
        provision?.inviteValue ?? provisionMe?.inviteValue,
      ),
      sharedAccountEmail:
        provision?.sharedAccountEmail ?? provisionMe?.sharedAccountEmail,
      maskedSharedAccountPassword:
        provision?.maskedSharedAccountPassword ??
        provisionMe?.maskedSharedAccountPassword,
      passwordRevealAvailable:
        provision?.passwordRevealAvailable ??
        provisionMe?.passwordRevealAvailable,
      provisionGuide: isInviteProvisionType(
        provision?.provisionType ?? provisionMe?.provisionType,
      )
        ? null
        : (provision?.provisionGuide ?? provisionMe?.provisionGuide),
      provisionStartedAt:
        provision?.provisionStartedAt ?? provisionMe?.provisionStartedAt,
      provisionCompletedAt:
        provision?.provisionCompletedAt ?? provisionMe?.provisionCompletedAt,
      lastResetAt: provision?.lastResetAt ?? provisionMe?.lastResetAt,
      provisionMessage: member?.provisionMessage,
    };
  }, [provisionMe]);

  useEffect(() => {
    if (!partyId || !provisionMe) return;

    const provisionType =
      provisionMe.provision?.provisionType ?? provisionMe.provisionType;
    const memberStatus =
      provisionMe.member?.memberStatus ?? provisionMe.memberStatus;

    if (
      isInviteProvisionType(provisionType) &&
      !isConfirmedStatus(memberStatus)
    ) {
      navigate(`/myparty/${partyId}/provision/invite-activation`, {
        replace: true,
      });
    }
  }, [navigate, partyId, provisionMe]);

  useEffect(() => {
    const fetchProvisionMe = async () => {
      if (!partyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await api.get(
          `/api/v1/parties/${partyId}/provision/me`,
        );
        const data = unwrapResponse<PartyMemberProvisionMeResponse>(
          response.data,
        );
        console.log(data);

        if (!data) {
          toast.error("파티원 이용 현황을 확인할 수 없습니다.");
          return;
        }

        setProvisionMe(data);
      } catch (error) {
        console.error(error);
        toast.error("파티원 이용 현황을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvisionMe();
  }, [partyId]);

  const handleRevealPassword = async () => {
    if (!partyId || isPasswordLoading) return;

    try {
      setIsPasswordLoading(true);

      const response = await api.post(
        `/api/v1/parties/${partyId}/provision/me/password`,
      );
      const data = unwrapResponse<SharedAccountPasswordResponse>(response.data);

      if (!data?.sharedAccountPassword) {
        toast.error("비밀번호를 확인할 수 없습니다.");
        return;
      }

      setSharedAccountPassword(data.sharedAccountPassword);
    } catch (error) {
      console.error(error);
      toast.error("비밀번호를 불러오지 못했습니다.");
    } finally {
      setIsPasswordLoading(false);
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
              파티원 이용 현황을 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!provisionMe) {
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

  if (
    isInviteProvisionType(view.provisionType) &&
    !isConfirmedStatus(view.memberStatus)
  ) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-96 w-full max-w-3xl items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Icon
            icon="solar:refresh-circle-bold"
            className="h-11 w-11 animate-spin text-blue-900"
          />
        </div>
      </div>
    );
  }

  const memberTone = getStatusTone(view.memberStatus);
  const canRevealPassword = Boolean(
    partyId &&
    view.maskedSharedAccountPassword &&
    view.passwordRevealAvailable &&
    !isInviteProvisionType(view.provisionType) &&
    view.memberStatus !== "WAITING",
  );
  const isInviteProvision = isInviteProvisionType(view.provisionType);
  const shouldShowEmptyAccessState =
    !view.sharedAccountEmail &&
    !view.maskedSharedAccountPassword &&
    !view.inviteValue &&
    !isInviteProvision &&
    !view.provisionGuide;
  const metrics = [
    {
      label: "방식",
      value: getProvisionTypeLabel(view.provisionType),
    },
    {
      label: "파티 상태",
      value: getProvisionStatusLabel(view.provisionStatus),
    },
  ].filter((item) => item.value !== "-");
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

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${getStatusStyle(
                view.memberStatus,
              )}`}
            >
              <Icon icon={memberTone.icon} className="h-4 w-4" />
              {getMemberStatusLabel(view.memberStatus)}
            </span>
            <button
              type="button"
              onClick={() =>
                navigate(`/myparty/${partyId}/provision/member-settings`)
              }
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
              aria-label="파티원 설정으로 이동"
            >
              <Icon icon="solar:settings-bold" className="h-5 w-5" />
            </button>
          </div>
        </header>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_48px_-40px_rgba(15,23,42,0.28)] sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#14B8A6]">MEMBER PARTY</p>
              <h1 className="mt-1 truncate text-xl font-bold text-slate-950">
                {view.productName}
              </h1>
              <p className="mt-1.5 text-sm font-normal leading-6 text-slate-500">
                현재 이용 중인 파티입니다.
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAFBF5] text-[#0F766E] ring-1 ring-[#BDEFE4]">
              <Icon icon="solar:user-check-bold" className="h-5 w-5" />
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_56px_-46px_rgba(15,23,42,0.3)]">
          <div className="px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#14B8A6]">
                  파티원 이용 현황
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  이용 정보 확인
                </h2>
                <p className="mt-1.5 text-sm font-normal leading-6 text-slate-500">
                  {isInviteProvision
                    ? "OTT 계정 활성화와 이용 확인 상태를 확인할 수 있습니다."
                    : "공유계정 안내 확인과 이용 활성화 상태를 확인할 수 있습니다."}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${memberTone.className}`}
              >
                <Icon icon={memberTone.icon} className="h-5 w-5" />
              </div>
            </div>

            {metrics.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                {metrics.map((metric) => (
                  <MetricTile
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {isInviteProvision ? (
          <section className="mt-5 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)] sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAFBF5] text-[#0F766E] ring-1 ring-[#BDEFE4]">
                <Icon icon="solar:check-circle-bold" className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-400">STATUS</p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  OTT 계정 활성화 완료
                </h2>
                <p className="mt-2 text-sm font-normal leading-6 text-slate-500">
                  이용 확인이 완료되었습니다. 초대 메일이나 OTT 계정 관련 내용은
                  메일함에서 확인할 수 있습니다.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/mypage/mailbox")}
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#1E3A8A] ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  <Icon icon="solar:inbox-bold" className="h-4 w-4" />
                  메일함 확인
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-5 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)] sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400">ACCESS</p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  이용 정보
                </h2>
              </div>
              <Icon
                icon="solar:lock-password-bold"
                className="h-6 w-6 text-slate-300"
              />
            </div>

            <div className="mt-5 space-y-3">
              {view.sharedAccountEmail && (
                <InfoRow
                  icon="solar:user-id-bold"
                  label="계정 아이디"
                  value={view.sharedAccountEmail}
                />
              )}
              {view.maskedSharedAccountPassword && (
                <InfoRow
                  icon="solar:password-bold"
                  label="계정 비밀번호"
                  value={
                    sharedAccountPassword ?? view.maskedSharedAccountPassword
                  }
                  action={
                    !sharedAccountPassword && canRevealPassword ? (
                      <button
                        type="button"
                        onClick={handleRevealPassword}
                        disabled={isPasswordLoading}
                        className="flex h-9 shrink-0 items-center justify-center rounded-xl bg-[#14B8A6] px-3 text-xs font-bold text-white transition hover:bg-[#0D9488] disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {isPasswordLoading ? "조회 중" : "보기"}
                      </button>
                    ) : null
                  }
                />
              )}
              {view.inviteValue && (
                <InfoRow
                  icon="solar:link-circle-bold"
                  label="초대 링크"
                  value={view.inviteValue}
                />
              )}
              {view.provisionGuide && (
                <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4 ring-1 ring-slate-100">
                  <p className="text-xs font-medium text-slate-400">
                    이용 안내
                  </p>
                  <p className="mt-2 text-sm font-normal leading-6 text-slate-600">
                    {view.provisionGuide}
                  </p>
                </div>
              )}
              {shouldShowEmptyAccessState && (
                <div className="rounded-2xl bg-[#F8FAFC] px-4 py-5 text-center ring-1 ring-slate-100">
                  <p className="text-sm font-normal text-slate-500">
                    표시할 이용 정보가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {view.provisionMessage && (
          <section className="mt-5 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)] sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#1E3A8A] ring-1 ring-slate-100">
                <Icon icon="solar:info-circle-bold" className="h-5 w-5" />
              </div>
              <p className="text-sm font-normal leading-6 text-slate-600">
                {view.provisionMessage}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#F8FAFC] px-3 py-4 text-center ring-1 ring-slate-100">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  action,
}: {
  icon: string;
  label: string;
  value: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] px-4 py-4 ring-1 ring-slate-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1E3A8A] ring-1 ring-slate-200">
        <Icon icon={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>
      {action}
    </div>
  );
}
