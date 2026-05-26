import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/utils/api-error";
import { getVacancyConfirmPath, withRedirect } from "./vacancyFlow";

type PartyVacancyDetail = {
  partyId: number;
  productId: string;
  productName: string;
  thumbnailUrl: string;
  hostUserId: number;
  totalCapacity: number;
  currentMemberCount: number;
  remainingSeatCount: number;
  monthlyPaymentAmount: number;
  nextPaymentDate: string | null;
  operationType: string;
  recruitStatus: string;
  operationStatus: string;
  vacancyType: string;
  joinAvailable: boolean;
};

type PrimaryBankAccountResponse = {
  accountType: string | null;
  isPrimary: boolean;
};

type BillingMethodResponse = {
  hasBillingKey: boolean;
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

function formatPrice(value?: number | null) {
  if (typeof value !== "number") return "-";
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatShortDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatOperationType(value?: string) {
  if (value === "ACCOUNT_SHARE") return "계정 공유";
  if (value === "INVITE_CODE") return "초대 코드";
  return value || "-";
}

function formatRecruitStatus(value?: string) {
  if (value === "RECRUITING") return "모집중";
  if (value === "CLOSED") return "모집 종료";
  return value || "-";
}

async function hasPrimarySettlementAccount() {
  try {
    const response = await api.get<
      PrimaryBankAccountResponse | ApiEnvelope<PrimaryBankAccountResponse>
    >("/api/v1/bank/accounts/primary");
    const account = unwrapResponse<PrimaryBankAccountResponse>(response.data);

    return account?.accountType === "SETTLEMENT" && account.isPrimary === true;
  } catch {
    return false;
  }
}

async function hasBillingMethod() {
  try {
    const response = await api.get<
      BillingMethodResponse | ApiEnvelope<BillingMethodResponse>
    >("/api/v1/payments/billing/me");
    const billing = unwrapResponse<BillingMethodResponse>(response.data);

    return Boolean(billing?.hasBillingKey);
  } catch {
    return false;
  }
}

function formatOperationStatus(value?: string) {
  if (value === "WAITING_START") return "시작 대기";
  if (value === "ACTIVE") return "운영중";
  if (value === "ENDED") return "종료";
  return value || "-";
}

export default function PartyVacancyDetailPage() {
  const navigate = useNavigate();
  const { type, partyId } = useParams<{
    type: "hosts" | "members";
    partyId: string;
  }>();
  const [detail, setDetail] = useState<PartyVacancyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  const isHostRecruit = type === "hosts";
  const isMemberRecruit = type === "members";

  const pageTone = isHostRecruit
    ? {
        text: "text-[#1E3A8A]",
        bg: "bg-[#1E3A8A]",
        lightBg: "bg-blue-50",
        ring: "ring-blue-100",
        buttonHover: "hover:bg-blue-800",
        action: "파티장 참여하기",
        caption: "HOST VACANCY",
        headline: "파티장 참여 정보를 확인해 주세요",
        description:
          "파티장 참여 전 상품 정보, 다음 회차 기준 인원 현황, 월 결제 금액을 확인합니다.",
        noticeTitle: "파티장 참여 안내",
      }
    : {
        text: "text-[#00875A]",
        bg: "bg-[#00A86B]",
        lightBg: "bg-[#EAF8F1]",
        ring: "ring-[#A9E6C9]",
        buttonHover: "hover:bg-[#00875A]",
        action: "파티원 참여하기",
        caption: "MEMBER VACANCY",
        headline: "파티원 참여 정보를 확인해 주세요",
        description:
          "파티원 참여 전 상품 정보, 다음 회차 기준 인원 현황, 월 결제 금액을 확인합니다.",
        noticeTitle: "파티원 참여 안내",
      };

  useEffect(() => {
    let mounted = true;

    const fetchDetail = async () => {
      if (!isHostRecruit && !isMemberRecruit) {
        navigate("/parties", { replace: true });
        return;
      }

      if (!partyId) {
        toast.error("파티 정보가 올바르지 않습니다.");
        navigate(`/parties/${type}`, { replace: true });
        return;
      }

      try {
        setIsLoading(true);

        const response = await api.get<
          PartyVacancyDetail | ApiEnvelope<PartyVacancyDetail>
        >(`/api/v1/party-vacancy/${type}/${partyId}`);

        const payload = unwrapResponse<PartyVacancyDetail>(response.data);
        if (!mounted) return;

        if (!payload) {
          toast.error("결원 파티 상세 정보를 불러오지 못했습니다.");
          setDetail(null);
          return;
        }

        setDetail(payload);
      } catch (error) {
        if (!mounted) return;

        console.error("결원 파티 상세 조회 실패", error);
        toast.error("결원 파티 상세 정보를 불러오지 못했습니다.");
        setDetail(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchDetail();

    return () => {
      mounted = false;
    };
  }, [isHostRecruit, isMemberRecruit, navigate, partyId, type]);

  const handleJoinVacancyParty = async () => {
    if (!partyId || !detail?.joinAvailable || isJoining) return;

    try {
      setIsJoining(true);

      const confirmPath = getVacancyConfirmPath(
        isHostRecruit ? "hosts" : "members",
        partyId,
      );
      const hasRequiredMethod = isHostRecruit
        ? await hasPrimarySettlementAccount()
        : await hasBillingMethod();

      if (hasRequiredMethod) {
        navigate(confirmPath);
        return;
      }

      toast.info(
        isHostRecruit
          ? "정산 계좌 등록 후 참여를 완료할 수 있습니다."
          : "결제 카드 등록 후 참여를 완료할 수 있습니다.",
      );

      navigate(
        isHostRecruit
          ? withRedirect(
              `/party/create/${detail.productId}/host/agreement`,
              confirmPath,
            )
          : withRedirect(
              `/party/create/${detail.productId}/member/agreement`,
              confirmPath,
            ),
      );
    } catch (error) {
      console.error("결원 파티 참여 조건 확인 실패", error);
      toast.error(
        getApiErrorMessage(error, "참여 조건 확인 중 문제가 발생했습니다."),
      );
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-3xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className={`mx-auto h-11 w-11 animate-spin ${pageTone.text}`}
            />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              결원 파티 정보를 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-3xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <section className="px-6 py-10 text-center">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-3xl ${pageTone.lightBg} ${pageTone.text} ring-1 ${pageTone.ring}`}
            >
              <Icon icon="solar:info-circle-bold" className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950">
              파티 정보를 확인할 수 없습니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              잠시 후 다시 시도해 주세요.
            </p>
          </section>
        </div>
      </div>
    );
  }

  const infoRows = [
    {
      label: "현재 인원",
      value: `${detail.currentMemberCount}/${detail.totalCapacity}명`,
    },
    { label: "운영 방식", value: formatOperationType(detail.operationType) },
    { label: "모집 상태", value: formatRecruitStatus(detail.recruitStatus) },
    {
      label: "운영 상태",
      value: formatOperationStatus(detail.operationStatus),
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-3xl">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${pageTone.lightBg} ${pageTone.text} ring-1 ${pageTone.ring}`}
                >
                  <Icon
                    icon="solar:users-group-rounded-bold"
                    className="h-4 w-4"
                  />
                  {pageTone.caption}
                </div>

                <h1 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[32px]">
                  {pageTone.headline}
                </h1>

                <p className="mt-3 max-w-[560px] text-sm leading-6 text-slate-500">
                  {pageTone.description}
                </p>
              </div>

              <span
                className={[
                  "w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ring-1",
                  detail.joinAvailable
                    ? `${pageTone.lightBg} ${pageTone.text} ${pageTone.ring}`
                    : "bg-slate-100 text-slate-500 ring-slate-200",
                ].join(" ")}
              >
                {detail.joinAvailable ? "참여 가능" : "참여 불가"}
              </span>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-100">
                {detail.thumbnailUrl ? (
                  <img
                    src={detail.thumbnailUrl}
                    alt={detail.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon
                    icon="solar:play-circle-bold"
                    className={`h-8 w-8 ${pageTone.text}`}
                  />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400">선택한 파티</p>
                <h2 className="mt-1 truncate text-xl font-extrabold text-slate-950">
                  {detail.productName}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {formatOperationType(detail.operationType)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <SummaryCard
                label="월 결제 금액"
                value={formatPrice(detail.monthlyPaymentAmount)}
                icon="solar:wallet-money-bold"
                toneClassName={pageTone.text}
              />
              <SummaryCard
                label="남은 자리"
                value={`${detail.remainingSeatCount}명`}
                icon="solar:user-plus-rounded-bold"
                toneClassName={pageTone.text}
              />
              <SummaryCard
                label="다음 결제일"
                value={formatShortDate(detail.nextPaymentDate)}
                icon="solar:calendar-bold"
                toneClassName={pageTone.text}
              />
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white ${pageTone.text} ring-1 ${pageTone.ring}`}
                >
                  <Icon icon="solar:info-circle-bold" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    {detail.joinAvailable ? pageTone.noticeTitle : "참여 제한"}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                    {detail.joinAvailable
                      ? "상품 정보와 금액을 확인한 뒤 참여를 진행해 주세요."
                      : "현재 상태에서는 이 결원 파티에 참여할 수 없습니다."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[24px] bg-white ring-1 ring-slate-100">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="text-sm font-extrabold text-slate-950">
                  상세 정보
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {infoRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <p className="text-sm font-semibold text-slate-500">
                      {row.label}
                    </p>
                    <p className="text-right text-sm font-extrabold text-slate-950">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleJoinVacancyParty}
              disabled={!detail.joinAvailable || isJoining}
              className={[
                "mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white disabled:shadow-none disabled:hover:translate-y-0",
                detail.joinAvailable && !isJoining
                  ? `${pageTone.bg} ${pageTone.buttonHover} ${
                      isHostRecruit
                        ? "shadow-blue-900/20"
                        : "shadow-emerald-900/20"
                    } hover:-translate-y-0.5`
                  : "",
              ].join(" ")}
            >
              {isJoining ? "참여 조건 확인 중..." : pageTone.action}
              <Icon
                icon={
                  isJoining
                    ? "solar:refresh-circle-bold"
                    : "solar:arrow-right-linear"
                }
                className={["h-5 w-5", isJoining ? "animate-spin" : ""].join(
                  " ",
                )}
              />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  toneClassName,
}: {
  label: string;
  value: string;
  icon: string;
  toneClassName: string;
}) {
  return (
    <div className="min-w-0 rounded-[20px] bg-slate-50 px-2.5 py-3 text-center ring-1 ring-slate-100 sm:rounded-[22px] sm:p-5 sm:text-left">
      <div
        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-2xl bg-white ${toneClassName} ring-1 ring-slate-100 sm:mx-0 sm:h-10 sm:w-10`}
      >
        <Icon icon={icon} className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <p className="mt-2 text-[11px] font-bold leading-tight text-slate-400 sm:mt-4 sm:text-xs">
        {label}
      </p>
      <p className="mt-1 truncate text-[13px] font-extrabold text-slate-950 sm:text-sm">
        {value}
      </p>
    </div>
  );
}
