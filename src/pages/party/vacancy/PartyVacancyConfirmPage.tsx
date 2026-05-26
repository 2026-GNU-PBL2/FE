import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  getVacancyConfirmPath,
  type VacancyRouteType,
  withRedirect,
} from "./vacancyFlow";

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

type PartyVacancyJoinResponse = {
  partyId: number;
  productId: string;
  productName: string;
  joinedAt: string;
  message: string;
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

export default function PartyVacancyConfirmPage() {
  const navigate = useNavigate();
  const { type, partyId } = useParams<{
    type: VacancyRouteType;
    partyId: string;
  }>();

  const [detail, setDetail] = useState<PartyVacancyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const isHostRecruit = type === "hosts";
  const isMemberRecruit = type === "members";

  const pageTone = isHostRecruit
    ? {
        text: "text-[#1E3A8A]",
        bg: "bg-[#1E3A8A]",
        hover: "hover:bg-blue-800",
        lightBg: "bg-blue-50",
        ring: "ring-blue-100",
        title: "파티장 참여 최종 확인",
        readyLabel: "정산 계좌 확인 완료",
        readyDescription:
          "등록된 대표 정산 계좌가 확인되었습니다. 결원 파티장 참여를 완료할 수 있습니다.",
        action: "파티장 참여 완료하기",
      }
    : {
        text: "text-[#047857]",
        bg: "bg-[#10B981]",
        hover: "hover:bg-[#059669]",
        lightBg: "bg-[#ECFDF5]",
        ring: "ring-[#6EE7B7]",
        title: "파티원 참여 최종 확인",
        readyLabel: "결제 카드 확인 완료",
        readyDescription:
          "등록된 자동결제 카드가 확인되었습니다. 결원 파티원 참여를 완료할 수 있습니다.",
        action: "파티원 참여 완료하기",
      };

  useEffect(() => {
    let mounted = true;

    const fetchAndGuard = async () => {
      if (!type || (!isHostRecruit && !isMemberRecruit) || !partyId) {
        navigate("/parties", { replace: true });
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
          toast.error("결원 파티 정보를 불러오지 못했습니다.");
          setDetail(null);
          return;
        }

        const hasRequiredMethod = isHostRecruit
          ? await hasPrimarySettlementAccount()
          : await hasBillingMethod();

        if (!mounted) return;

        if (!hasRequiredMethod) {
          const confirmPath = getVacancyConfirmPath(type, partyId);
          toast.info(
            isHostRecruit
              ? "정산 계좌 등록 후 참여를 완료할 수 있습니다."
              : "결제 카드 등록 후 참여를 완료할 수 있습니다.",
          );

          navigate(
            isHostRecruit
              ? withRedirect(
                  `/party/create/${payload.productId}/host/agreement`,
                  confirmPath,
                )
              : withRedirect(
                  `/party/create/${payload.productId}/member/agreement`,
                  confirmPath,
                ),
            { replace: true },
          );
          return;
        }

        setDetail(payload);
      } catch (error) {
        console.error("결원 파티 확인 실패", error);
        if (mounted) {
          toast.error("결원 파티 정보를 불러오지 못했습니다.");
          setDetail(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchAndGuard();

    return () => {
      mounted = false;
    };
  }, [isHostRecruit, isMemberRecruit, navigate, partyId, type]);

  const handleApply = async () => {
    if (!partyId || !detail?.joinAvailable || isApplying) return;

    try {
      setIsApplying(true);

      const response = await api.post<
        PartyVacancyJoinResponse | ApiEnvelope<PartyVacancyJoinResponse>
      >(`/api/v1/party-vacancy/${partyId}/join`);

      const payload = unwrapResponse<PartyVacancyJoinResponse>(response.data);
      const nextPartyId = payload?.partyId ?? detail.partyId;

      toast.success(payload?.message || "결원 파티 참여가 완료되었습니다.");
      navigate(`/myparty/${nextPartyId}`, {
        replace: true,
        state: {
          productId: payload?.productId ?? detail.productId,
          productName: payload?.productName ?? detail.productName,
          role: isHostRecruit ? "HOST" : "MEMBER",
          status: "SCHEDULED",
          startAt: detail.nextPaymentDate,
          endAt: null,
          operationType: detail.operationType,
        },
      });
    } catch (error) {
      console.error("결원 파티 참여 실패", error);
      toast.error(
        getApiErrorMessage(error, "결원 파티 참여 중 문제가 발생했습니다."),
      );
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-2xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className={`mx-auto h-11 w-11 animate-spin ${pageTone.text}`}
            />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              참여 조건을 확인하는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-2xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <section className="px-6 py-10 text-center">
            <Icon
              icon="solar:info-circle-bold"
              className={`mx-auto h-12 w-12 ${pageTone.text}`}
            />
            <h1 className="mt-5 text-2xl font-extrabold text-slate-950">
              참여 정보를 확인할 수 없습니다
            </h1>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-3xl">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${pageTone.lightBg} ${pageTone.text} ring-1 ${pageTone.ring}`}
            >
              <Icon icon="solar:shield-check-bold" className="h-4 w-4" />
              참여 조건 확인
            </div>

            <h1 className="mt-4 text-[28px] font-extrabold tracking-tight text-slate-950 sm:text-[32px]">
              {pageTone.title}
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              상품과 금액을 마지막으로 확인한 뒤 결원 참여를 완료합니다.
            </p>
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
                <p className="text-xs font-bold text-slate-400">참여 파티</p>
                <h2 className="mt-1 truncate text-xl font-extrabold text-slate-950">
                  {detail.productName}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {formatOperationType(detail.operationType)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="flex gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white ${pageTone.text} ring-1 ${pageTone.ring}`}
                >
                  <Icon
                    icon={
                      isHostRecruit
                        ? "solar:wallet-money-bold"
                        : "solar:card-bold"
                    }
                    className="h-5 w-5"
                  />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    {pageTone.readyLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                    {pageTone.readyDescription}
                  </p>
                </div>
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

            <button
              type="button"
              onClick={handleApply}
              disabled={!detail.joinAvailable || isApplying}
              className={[
                "mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white disabled:shadow-none disabled:hover:translate-y-0",
                detail.joinAvailable && !isApplying
                  ? `${pageTone.bg} ${pageTone.hover} hover:-translate-y-0.5`
                  : "",
              ].join(" ")}
            >
              {isApplying ? "참여 처리 중..." : pageTone.action}
              <Icon
                icon={
                  isApplying
                    ? "solar:refresh-circle-bold"
                    : "solar:arrow-right-linear"
                }
                className={["h-5 w-5", isApplying ? "animate-spin" : ""].join(
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
