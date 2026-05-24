import { Icon } from "@iconify/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import {
  createPartyMemberDevice,
  getApiErrorMessage,
  getSharedCredentials,
  reportConcurrentIssue,
  reportDeviceAlert,
  type DeviceAlertReportResponse,
  type PartyMemberDevice,
} from "@/api/concurrent";

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
  ottServiceName?: string | null;
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

type PartySettingsResponse = {
  ottServiceName?: string | null;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
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

function isAccountShareProvisionType(type?: ProvisionType | null) {
  return (
    type === "ACCOUNT_SHARE" ||
    type === "SHARED_ACCOUNT" ||
    type === "SHARED_CREDENTIAL" ||
    type === "SHARED_CREDENTIALS"
  );
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

function formatDateTime(value?: string | null) {
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

export default function PartyMemberProvisionDashboardPage() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();
  const [provisionMe, setProvisionMe] =
    useState<PartyMemberProvisionMeResponse | null>(null);
  const [partySettings, setPartySettings] =
    useState<PartySettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sharedAccountPassword, setSharedAccountPassword] = useState<
    string | null
  >(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isConcurrentIssueModalOpen, setIsConcurrentIssueModalOpen] =
    useState(false);
  const [isConcurrentIssueSubmitting, setIsConcurrentIssueSubmitting] =
    useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isDeviceSubmitting, setIsDeviceSubmitting] = useState(false);
  const [registeredDevice, setRegisteredDevice] =
    useState<PartyMemberDevice | null>(null);
  const [deviceType, setDeviceType] = useState("PC");
  const [deviceOs, setDeviceOs] = useState("");
  const [deviceBrowser, setDeviceBrowser] = useState("");
  const [isDeviceAlertModalOpen, setIsDeviceAlertModalOpen] = useState(false);
  const [isDeviceAlertSubmitting, setIsDeviceAlertSubmitting] = useState(false);
  const [detectedDevice, setDetectedDevice] = useState("");
  const [detectedLocation, setDetectedLocation] = useState("");
  const [deviceAlertResult, setDeviceAlertResult] =
    useState<DeviceAlertReportResponse | null>(null);

  const view = useMemo(() => {
    const provision = provisionMe?.provision;
    const member = provisionMe?.member;

    return {
      productName:
        provisionMe?.productName ||
        provisionMe?.ottServiceName ||
        partySettings?.ottServiceName ||
        "파티 정보",
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
  }, [partySettings, provisionMe]);

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

        const [provisionResult, settingsResult] = await Promise.allSettled([
          api.get(`/api/v1/parties/${partyId}/provision/me`),
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

        if (provisionResult.status !== "fulfilled") {
          toast.error("파티원 이용 현황을 불러오지 못했습니다.");
          return;
        }

        const data = unwrapResponse<PartyMemberProvisionMeResponse>(
          provisionResult.value.data,
        );
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

      const data = await getSharedCredentials(partyId);

      if (!data?.sharedAccountPassword) {
        toast.error("비밀번호를 확인할 수 없습니다.");
        return;
      }

      setSharedAccountPassword(data.sharedAccountPassword);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "비밀번호를 불러오지 못했습니다."));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-3xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-brand-main"
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
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl rounded-[32px] bg-white px-6 py-12 text-center shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <Icon
            icon="solar:danger-circle-bold"
            className="mx-auto h-12 w-12 text-slate-300"
          />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            표시할 이용 현황이 없습니다.
          </p>
          <button
            onClick={() => navigate("/myparty")}
            className="mt-7 rounded-full bg-brand-main px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
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
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-3xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <Icon
            icon="solar:refresh-circle-bold"
            className="h-11 w-11 animate-spin text-brand-main"
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
  const isAccountShareProvision = isAccountShareProvisionType(
    view.provisionType,
  );
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

  const handleSubmitConcurrentIssue = async () => {
    if (!partyId || isConcurrentIssueSubmitting) return;

    try {
      setIsConcurrentIssueSubmitting(true);

      const result = await reportConcurrentIssue(partyId);

      toast.success(
        result?.warningLevel === "SECOND"
          ? "신고가 접수되어 파티 해체 예정 상태로 전환되었습니다."
          : "신고가 접수되어 파티장에게 조치 알림이 발송되었습니다.",
      );
      setIsConcurrentIssueModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "신고를 접수하지 못했습니다."));
    } finally {
      setIsConcurrentIssueSubmitting(false);
    }
  };

  const handleCreateDevice = async () => {
    if (!partyId || isDeviceSubmitting) return;

    if (!deviceType.trim() || !deviceOs.trim()) {
      toast.error("기기 종류와 OS를 입력해주세요.");
      return;
    }

    try {
      setIsDeviceSubmitting(true);
      const result = await createPartyMemberDevice(partyId, {
        deviceType: deviceType.trim(),
        os: deviceOs.trim(),
        browser: deviceBrowser.trim() || null,
      });

      if (result) setRegisteredDevice(result);
      toast.success("내 기기를 등록했습니다.");
      setIsDeviceModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "기기를 등록하지 못했습니다."));
    } finally {
      setIsDeviceSubmitting(false);
    }
  };

  const handleReportDeviceAlert = async () => {
    if (!partyId || isDeviceAlertSubmitting) return;

    if (!detectedDevice.trim() || !detectedLocation.trim()) {
      toast.error("감지된 기기와 위치를 입력해주세요.");
      return;
    }

    try {
      setIsDeviceAlertSubmitting(true);
      const result = await reportDeviceAlert(partyId, {
        detectedDevice: detectedDevice.trim(),
        detectedLocation: detectedLocation.trim(),
      });

      setDeviceAlertResult(result);
      toast.success("전체 파티원에게 내 기기인지 확인 요청 알림이 발송되었습니다.");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "낯선 기기 신고에 실패했습니다."));
    } finally {
      setIsDeviceAlertSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-3xl">
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

        <section className="mt-5 overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="px-5 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-[#14B8A6]">
                  MEMBER PARTY
                </p>
                <h1 className="mt-2 truncate text-[28px] font-extrabold tracking-tight text-slate-950">
                  {view.productName}
                </h1>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  현재 이용 중인 파티입니다.
                </p>
              </div>
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#EAFBF5] text-[#0F766E] ring-1 ring-[#BDEFE4]">
                <Icon icon="solar:user-check-bold" className="h-6 w-6" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
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
          <section className="mt-5 rounded-[28px] bg-white px-5 py-5 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100 sm:px-6">
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
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-brand-main ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <Icon icon="solar:inbox-bold" className="h-4 w-4" />
                  메일함 확인
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-5 rounded-[28px] bg-white px-5 py-5 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100 sm:px-6">
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
                  <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
                    <p className="text-xs font-medium text-slate-400">
                      이용 안내
                    </p>
                    <p className="mt-2 text-sm font-normal leading-6 text-slate-600">
                      {view.provisionGuide}
                    </p>
                  </div>
                )}
                {shouldShowEmptyAccessState && (
                  <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center ring-1 ring-slate-100">
                    <p className="text-sm font-normal text-slate-500">
                      표시할 이용 정보가 없습니다.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {isAccountShareProvision && (
              <>
                <MemberDeviceTools
                  registeredDevice={registeredDevice}
                  onAddDevice={() => setIsDeviceModalOpen(true)}
                  onReportDevice={() => {
                    setDeviceAlertResult(null);
                    setIsDeviceAlertModalOpen(true);
                  }}
                />
                <ConcurrentIssueReportCard
                  onOpen={() => setIsConcurrentIssueModalOpen(true)}
                />
              </>
            )}
          </>
        )}

        {view.provisionMessage && (
          <section className="mt-5 rounded-[28px] bg-white px-5 py-5 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-brand-main ring-1 ring-slate-100">
                <Icon icon="solar:info-circle-bold" className="h-5 w-5" />
              </div>
              <p className="text-sm font-normal leading-6 text-slate-600">
                {view.provisionMessage}
              </p>
            </div>
          </section>
        )}
      </div>
      {isConcurrentIssueModalOpen && (
        <ConcurrentIssueModal
          isSubmitting={isConcurrentIssueSubmitting}
          onClose={() => {
            if (!isConcurrentIssueSubmitting) {
              setIsConcurrentIssueModalOpen(false);
            }
          }}
          onSubmit={handleSubmitConcurrentIssue}
        />
      )}
      {isDeviceModalOpen && (
        <DeviceRegisterModal
          deviceType={deviceType}
          os={deviceOs}
          browser={deviceBrowser}
          isSubmitting={isDeviceSubmitting}
          onDeviceTypeChange={setDeviceType}
          onOsChange={setDeviceOs}
          onBrowserChange={setDeviceBrowser}
          onClose={() => {
            if (!isDeviceSubmitting) setIsDeviceModalOpen(false);
          }}
          onSubmit={handleCreateDevice}
        />
      )}
      {isDeviceAlertModalOpen && (
        <DeviceAlertReportModal
          detectedDevice={detectedDevice}
          detectedLocation={detectedLocation}
          result={deviceAlertResult}
          isSubmitting={isDeviceAlertSubmitting}
          onDetectedDeviceChange={setDetectedDevice}
          onDetectedLocationChange={setDetectedLocation}
          onClose={() => {
            if (!isDeviceAlertSubmitting) setIsDeviceAlertModalOpen(false);
          }}
          onSubmit={handleReportDeviceAlert}
        />
      )}
    </div>
  );
}

function MemberDeviceTools({
  registeredDevice,
  onAddDevice,
  onReportDevice,
}: {
  registeredDevice: PartyMemberDevice | null;
  onAddDevice: () => void;
  onReportDevice: () => void;
}) {
  return (
    <section className="mt-5 rounded-[28px] bg-white px-5 py-5 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#14B8A6]">DEVICE</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            내 기기 관리
          </h2>
          <p className="mt-2 text-sm font-normal leading-6 text-slate-500">
            자주 쓰는 기기를 미리 등록하면 새 기기 감지 알림에 더 빠르게
            대응할 수 있어요.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:w-40">
          <button
            type="button"
            onClick={onAddDevice}
            className="flex h-10 items-center justify-center rounded-full bg-[#1E3A8A] px-4 text-xs font-bold text-white transition hover:bg-blue-900"
          >
            기기 추가
          </button>
          <button
            type="button"
            onClick={onReportDevice}
            className="flex h-10 items-center justify-center rounded-full bg-amber-50 px-4 text-xs font-bold text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100"
          >
            낯선 기기 신고
          </button>
        </div>
      </div>

      {registeredDevice && (
        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-400">최근 등록 기기</p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {registeredDevice.deviceType} · {registeredDevice.os}
            {registeredDevice.browser ? ` · ${registeredDevice.browser}` : ""}
          </p>
        </div>
      )}
    </section>
  );
}

function ConcurrentIssueReportCard({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="mt-5 rounded-[28px] bg-amber-50 px-5 py-5 shadow-xl shadow-slate-900/5 ring-1 ring-amber-100 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 ring-1 ring-amber-100">
            <Icon icon="solar:danger-triangle-bold" className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-950">
              이용 중 문제가 생겼나요?
            </h2>
            <p className="mt-1 text-sm font-normal leading-6 text-slate-600">
              동시접속 초과, 모르는 시청 기록, 비밀번호 오류를 신고할 수
              있어요.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-amber-600 px-4 text-sm font-bold text-white shadow-sm shadow-amber-900/15 transition hover:bg-amber-700"
        >
          동시접속 초과 신고하기
        </button>
      </div>
    </section>
  );
}

function ConcurrentIssueModal({
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:py-8"
      onMouseDown={() => {
        if (!isSubmitting) onClose();
      }}
      role="presentation"
    >
      <section
        className="w-full max-w-[480px] rounded-[28px] bg-white px-5 py-5 shadow-[0_28px_90px_-34px_rgba(15,23,42,0.7)] ring-1 ring-slate-100 sm:px-6"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-concurrent-issue-title"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
            <Icon icon="solar:danger-triangle-bold" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-amber-700">문제 신고</p>
            <h2
              id="member-concurrent-issue-title"
              className="mt-1 text-lg font-bold text-slate-950"
            >
              동시접속 문제를 신고할까요?
            </h2>
            <p className="mt-2 text-sm font-normal leading-6 text-slate-500">
              파티 이용에 영향을 준 상황을 남겨주시면 확인 후 조치됩니다.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-4 ring-1 ring-amber-100">
          <p className="text-sm font-semibold leading-6 text-amber-800">
            신고 유형은 동시접속 위반 의심으로 접수됩니다. 1차 신고 시 파티
            전체에 경고가 발송되고, 2차 신고 시 해체 예정 상태로 전환됩니다.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-600 ring-1 ring-slate-100 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center rounded-2xl bg-amber-600 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "접수 중" : "신고하기"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DeviceRegisterModal({
  deviceType,
  os,
  browser,
  isSubmitting,
  onDeviceTypeChange,
  onOsChange,
  onBrowserChange,
  onClose,
  onSubmit,
}: {
  deviceType: string;
  os: string;
  browser: string;
  isSubmitting: boolean;
  onDeviceTypeChange: (value: string) => void;
  onOsChange: (value: string) => void;
  onBrowserChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:py-8"
      onMouseDown={() => {
        if (!isSubmitting) onClose();
      }}
      role="presentation"
    >
      <section
        className="w-full max-w-[460px] rounded-[28px] bg-white px-5 py-5 shadow-[0_28px_90px_-34px_rgba(15,23,42,0.7)] ring-1 ring-slate-100 sm:px-6"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-bold text-slate-950">내 기기 추가</h2>
        <p className="mt-2 text-sm font-normal leading-6 text-slate-500">
          파티에서 사용할 내 기기 정보를 등록합니다.
        </p>

        <div className="mt-5 space-y-3">
          <DeviceInput
            label="기기 종류"
            value={deviceType}
            placeholder="PC, MOBILE, TABLET"
            onChange={onDeviceTypeChange}
          />
          <DeviceInput
            label="OS"
            value={os}
            placeholder="Windows 11, iOS 18"
            onChange={onOsChange}
          />
          <DeviceInput
            label="브라우저"
            value={browser}
            placeholder="Chrome"
            onChange={onBrowserChange}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-600 ring-1 ring-slate-100 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center rounded-2xl bg-[#1E3A8A] text-sm font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "등록 중" : "등록하기"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DeviceAlertReportModal({
  detectedDevice,
  detectedLocation,
  result,
  isSubmitting,
  onDetectedDeviceChange,
  onDetectedLocationChange,
  onClose,
  onSubmit,
}: {
  detectedDevice: string;
  detectedLocation: string;
  result: DeviceAlertReportResponse | null;
  isSubmitting: boolean;
  onDetectedDeviceChange: (value: string) => void;
  onDetectedLocationChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:py-8"
      onMouseDown={() => {
        if (!isSubmitting) onClose();
      }}
      role="presentation"
    >
      <section
        className="w-full max-w-[520px] rounded-[28px] bg-white px-5 py-5 shadow-[0_28px_90px_-34px_rgba(15,23,42,0.7)] ring-1 ring-slate-100 sm:px-6"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-bold text-slate-950">낯선 기기 신고</h2>
        {result ? (
          <div className="mt-5">
            <div className="rounded-2xl bg-teal-50 px-4 py-4 ring-1 ring-teal-100">
              <p className="text-sm font-bold text-teal-800">
                전체 파티원에게 내 기기인지 확인 요청 알림이 발송되었습니다.
              </p>
              <p className="mt-2 text-sm font-semibold text-teal-700">
                알림 {result.notifiedCount}명 · 응답 기한{" "}
                {formatDateTime(result.expiresAt)}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {result.registeredDevices.map((device, index) => (
                <div
                  key={`${device.userId}-${index}`}
                  className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                >
                  <p className="text-sm font-bold text-slate-900">
                    user #{device.userId}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {device.deviceType} · {device.os}
                    {device.browser ? ` · ${device.browser}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <DeviceInput
              label="감지된 기기"
              value={detectedDevice}
              placeholder="Windows PC"
              onChange={onDetectedDeviceChange}
            />
            <DeviceInput
              label="감지 위치"
              value={detectedLocation}
              placeholder="부산"
              onChange={onDetectedLocationChange}
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-600 ring-1 ring-slate-100 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            닫기
          </button>
          {!result && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex h-11 items-center justify-center rounded-2xl bg-amber-600 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "신고 중" : "신고하기"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function DeviceInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-2xl bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none ring-1 ring-slate-100 transition focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 px-3 py-4 text-center ring-1 ring-slate-100">
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
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-main ring-1 ring-blue-100">
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
