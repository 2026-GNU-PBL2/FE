import { Icon } from "@iconify/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { loadTossPaymentsScript } from "@/utils/loadTossPayments";

type PartySettingsResponse = {
  ottServiceName?: string | null;
  monthlyPaymentAmount?: number | null;
  billingDayOfMonth?: number | null;
};

type PartyLeaveReservationStatus =
  | "ACTIVE"
  | "LEAVE_RESERVED"
  | "LEFT"
  | "PENDING"
  | string;

type PartyLeaveReserveResponse = {
  partyId: number;
  partyMemberId: number;
  userId: number;
  role: "HOST" | "MEMBER" | string;
  status: PartyLeaveReservationStatus;
  leaveReservedAt: string | null;
  vacancyType?: string | null;
  message?: string | null;
};

type PaymentStatus =
  | "PAYMENT_PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | string;

type PaymentHistoryItem = {
  partyId: number;
  partyCycleId: number;
  serviceName: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  failedAt: string | null;
  failureReason?: string | null;
  failureCode?: string | null;
  createdAt: string | null;
};

type BillingMethodResponse = {
  hasBillingKey: boolean;
  customerKey?: string | null;
  cardCompany?: string | null;
  maskedCardNumber?: string | null;
  status?: string | null;
  issuedAt?: string | null;
};

type BillingCustomerKeyResponse = {
  customerKey: string;
};

type ErrorResponse = {
  message?: string;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

const billingChangeRequests = new Map<string, Promise<void>>();

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

function getStatusLabel(status?: PartyLeaveReservationStatus | null) {
  if (status === "LEAVE_RESERVED") return "해지 예약";
  if (status === "ACTIVE") return "이용 중";
  if (status === "LEFT") return "이용 종료";
  if (status === "PENDING") return "예약 대기";
  return status || "-";
}

function getPaymentStatusLabel(status?: PaymentStatus | null) {
  if (status === "PAYMENT_PENDING") return "결제 대기";
  if (status === "PROCESSING") return "처리 중";
  if (status === "PAID") return "결제 완료";
  if (status === "FAILED") return "결제 실패";
  if (status === "CANCELLED") return "취소";
  return status || "-";
}

function getPaymentStatusClassName(status?: PaymentStatus | null) {
  if (status === "PAID") return "bg-[#EAFBF5] text-[#0F766E] ring-[#BDEFE4]";
  if (status === "FAILED") return "bg-rose-50 text-rose-700 ring-rose-100";
  if (status === "CANCELLED")
    return "bg-slate-100 text-slate-600 ring-slate-200";
  if (status === "PROCESSING" || status === "PAYMENT_PENDING") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }
  return "bg-slate-100 text-slate-600 ring-slate-200";
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

function formatWon(value?: number | null) {
  if (value === null || value === undefined) return "-";
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatDayOfMonth(value?: number | null) {
  if (value === null || value === undefined) return "-";
  return `매달 ${value}일`;
}

function requestBillingChange(authKey: string) {
  const existingRequest = billingChangeRequests.get(authKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = api
    .post("/api/v1/payments/billing/change", { authKey })
    .then(() => undefined)
    .finally(() => {
      billingChangeRequests.delete(authKey);
    });

  billingChangeRequests.set(authKey, request);
  return request;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as ErrorResponse | undefined;

    if (responseData?.message) {
      return responseData.message;
    }
  }

  return fallbackMessage;
}

export default function PartyMemberSettingsPage() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();
  const [searchParams] = useSearchParams();
  const [partySettings, setPartySettings] =
    useState<PartySettingsResponse | null>(null);
  const [billingMethod, setBillingMethod] =
    useState<BillingMethodResponse | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    [],
  );
  const [leaveReservation, setLeaveReservation] =
    useState<PartyLeaveReserveResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBillingChanging, setIsBillingChanging] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const clientKey = import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY as
    | string
    | undefined;

  const fetchSettings = useCallback(
    async (showLoading = true) => {
      if (!partyId) {
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }

        const [settingsResult, billingResult, paymentHistoryResult] =
          await Promise.allSettled([
            api.get(`/api/v1/parties/${partyId}/settings`),
            api.get("/api/v1/payments/billing/me"),
            api.get("/api/v1/payments/me/history", {
              params: { page: 0, size: 20 },
            }),
          ]);

        if (settingsResult.status === "fulfilled") {
          const data = unwrapResponse<PartySettingsResponse>(
            settingsResult.value.data,
          );

          setPartySettings(data);
        } else {
          setPartySettings(null);
        }

        if (billingResult.status === "fulfilled") {
          const data = unwrapResponse<BillingMethodResponse>(
            billingResult.value.data,
          );

          setBillingMethod(data);
        } else {
          setBillingMethod(null);
        }

        if (paymentHistoryResult.status === "fulfilled") {
          const data = unwrapResponse<PaymentHistoryItem[]>(
            paymentHistoryResult.value.data,
          );

          setPaymentHistory(Array.isArray(data) ? data : []);
        } else {
          setPaymentHistory([]);
        }
      } catch (error) {
        console.error(error);
        toast.error("파티 설정 정보를 불러오지 못했습니다.");
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [partyId],
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const billingChange = searchParams.get("billingChange");
    const rawAuthKey = searchParams.get("authKey") ?? "";
    const authKey = rawAuthKey.replace(/ /g, "+");

    if (!partyId || billingChange !== "success") {
      if (billingChange === "fail") {
        toast.error("카드 변경 인증이 취소되었거나 실패했습니다.");
        navigate(`/myparty/${partyId}/provision/member-settings`, {
          replace: true,
        });
      }
      return;
    }

    if (!authKey) {
      toast.error("카드 변경 승인 정보가 없습니다.");
      navigate(`/myparty/${partyId}/provision/member-settings`, {
        replace: true,
      });
      return;
    }

    const dedupeKey = `billing-change:${authKey}`;

    if (sessionStorage.getItem(dedupeKey) === "done") {
      navigate(`/myparty/${partyId}/provision/member-settings`, {
        replace: true,
      });
      return;
    }

    let cancelled = false;

    async function changeBillingMethod() {
      try {
        setIsBillingChanging(true);

        await requestBillingChange(authKey);
        sessionStorage.setItem(dedupeKey, "done");

        if (cancelled) return;

        toast.success("결제수단이 변경되었습니다.");
        await fetchSettings(false);
        navigate(`/myparty/${partyId}/provision/member-settings`, {
          replace: true,
        });
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast.error("결제수단 변경에 실패했습니다.");
        }
      } finally {
        if (!cancelled) {
          setIsBillingChanging(false);
        }
      }
    }

    void changeBillingMethod();

    return () => {
      cancelled = true;
    };
  }, [fetchSettings, navigate, partyId, searchParams]);

  const handleChangeBillingMethod = async () => {
    if (!partyId || isBillingChanging) return;

    try {
      setIsBillingChanging(true);

      if (!clientKey) {
        throw new Error(
          "VITE_TOSS_PAYMENTS_CLIENT_KEY 환경변수가 설정되지 않았습니다.",
        );
      }

      await loadTossPaymentsScript();

      if (!window.TossPayments) {
        throw new Error("토스페이먼츠 SDK가 준비되지 않았습니다.");
      }

      let customerKey = billingMethod?.customerKey || "";

      if (!customerKey) {
        const response = await api.get("/api/v1/payments/billing/customer-key");
        const data = unwrapResponse<BillingCustomerKeyResponse>(response.data);
        customerKey = data?.customerKey || "";
      }

      if (!customerKey) {
        throw new Error("customerKey 응답이 올바르지 않습니다.");
      }

      const tossPayments = window.TossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey });
      const successUrl = new URL(
        `/myparty/${partyId}/provision/member-settings`,
        window.location.origin,
      );
      const failUrl = new URL(
        `/myparty/${partyId}/provision/member-settings`,
        window.location.origin,
      );

      successUrl.searchParams.set("billingChange", "success");
      failUrl.searchParams.set("billingChange", "fail");

      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: successUrl.toString(),
        failUrl: failUrl.toString(),
      });
    } catch (error) {
      console.error(error);
      toast.error("카드 변경창을 열지 못했습니다.");
      setIsBillingChanging(false);
    }
  };

  const handleReserveLeave = async () => {
    if (
      !partyId ||
      isSubmitting ||
      leaveReservation?.status === "LEAVE_RESERVED"
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post(`/api/v1/party-leave/${partyId}/reserve`);
      const data = unwrapResponse<PartyLeaveReserveResponse>(response.data);

      if (!data) {
        toast.error("해지 예약 결과를 확인할 수 없습니다.");
        return;
      }

      setLeaveReservation(data);
      setIsLeaveConfirmOpen(false);
      toast.success(data.message || "파티 탈퇴가 예약되었습니다.");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "파티 해지 예약에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLeaveReserved = leaveReservation?.status === "LEAVE_RESERVED";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-96 w-full max-w-[720px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-blue-900"
            />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              파티원 설정을 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[720px]">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/myparty/${partyId}/provision/member-dashboard`)
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            aria-label="파티원 대시보드로 이동"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
            <Icon icon="solar:settings-bold" className="h-4 w-4" />
            파티원 설정
          </span>
        </header>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_48px_-40px_rgba(15,23,42,0.28)] sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#14B8A6]">
                {partySettings?.ottServiceName || "파티"}
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-950">
                결제 및 파티 설정
              </h1>
              <p className="mt-1.5 text-sm font-medium leading-6 text-slate-500">
                내 결제 정보와 파티 해지를 관리합니다.
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAFBF5] text-[#0F766E] ring-1 ring-[#BDEFE4]">
              <Icon icon="solar:settings-bold" className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <MetricTile
              label="월 결제 금액"
              value={formatWon(partySettings?.monthlyPaymentAmount)}
            />
            <MetricTile
              label="결제일"
              value={formatDayOfMonth(partySettings?.billingDayOfMonth)}
            />
          </div>
        </section>

        <BillingMethodCard
          billingMethod={billingMethod}
          isChanging={isBillingChanging}
          onChange={handleChangeBillingMethod}
        />

        <PaymentHistorySection payments={paymentHistory} partyId={partyId} />

        {leaveReservation && (
          <section className="mt-5 rounded-[28px] border border-amber-100 bg-amber-50 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 ring-1 ring-amber-100">
                <Icon icon="solar:user-cross-bold" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-extrabold text-slate-950">
                  내 해지 예약 상태
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {getStatusLabel(leaveReservation.status)} · 예약 시각{" "}
                  {formatDateTime(leaveReservation.leaveReservedAt)}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-5 rounded-[24px] border border-rose-100 bg-white px-4 py-4 shadow-[0_14px_46px_-42px_rgba(15,23,42,0.24)] sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <Icon icon="solar:logout-3-bold" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-950">
                파티 해지하기
              </h2>
              <p className="mt-1 text-sm font-normal leading-6 text-slate-500">
                다음 결제일에 탈퇴가 반영됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLeaveConfirmOpen(true)}
              disabled={isSubmitting || isLeaveReserved}
              className={`flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-3 text-xs font-semibold ring-1 transition disabled:cursor-not-allowed ${
                isLeaveReserved
                  ? "bg-[#EAFBF5] text-[#0F766E] ring-[#BDEFE4]"
                  : "bg-rose-50 text-rose-600 ring-rose-100 hover:bg-rose-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200"
              }`}
            >
              <Icon
                icon={
                  isSubmitting
                    ? "solar:refresh-circle-bold"
                    : isLeaveReserved
                      ? "solar:check-circle-bold"
                      : "solar:logout-3-bold"
                }
                className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`}
              />
              {isSubmitting
                ? "해지 중"
                : isLeaveReserved
                  ? "해지 예약됨"
                  : "해지"}
            </button>
          </div>
        </section>
      </div>
      {isLeaveConfirmOpen && (
        <LeaveReserveConfirmModal
          isSubmitting={isSubmitting}
          title="파티 해지하기"
          description="즉시 탈퇴되지는 않으며, 다음 결제일에 새 이용 주기가 시작될 때 파티원 탈퇴가 반영됩니다."
          onClose={() => setIsLeaveConfirmOpen(false)}
          onConfirm={handleReserveLeave}
        />
      )}
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#F8FAFC] px-3 py-4 text-center ring-1 ring-slate-100">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function LeaveReserveConfirmModal({
  title,
  description,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:items-center sm:py-8"
      onMouseDown={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        className="w-full max-w-[420px] rounded-[28px] bg-white px-5 py-5 shadow-[0_28px_90px_-34px_rgba(15,23,42,0.7)] sm:px-6"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-confirm-title"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <Icon icon="solar:logout-3-bold" className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="leave-confirm-title"
              className="text-lg font-semibold text-slate-950"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm font-normal leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center rounded-2xl bg-[#F8FAFC] text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-50 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200"
          >
            <Icon
              icon={
                isSubmitting
                  ? "solar:refresh-circle-bold"
                  : "solar:logout-3-bold"
              }
              className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`}
            />
            {isSubmitting ? "해지 중" : "해지"}
          </button>
        </div>
      </section>
    </div>
  );
}

function BillingMethodCard({
  billingMethod,
  isChanging,
  onChange,
}: {
  billingMethod: BillingMethodResponse | null;
  isChanging: boolean;
  onChange: () => void;
}) {
  const hasBillingKey = Boolean(billingMethod?.hasBillingKey);
  const cardLabel = [
    billingMethod?.cardCompany,
    billingMethod?.maskedCardNumber,
  ]
    .filter(Boolean)
    .join("  ");

  return (
    <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)]">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#14B8A6]">BILLING</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">
              내 결제 수단
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              자동결제에 사용할 등록 카드 정보를 확인합니다.
            </p>
          </div>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${
              hasBillingKey
                ? "bg-[#EAFBF5] text-[#0F766E] ring-[#BDEFE4]"
                : "bg-slate-100 text-slate-400 ring-slate-200"
            }`}
          >
            <Icon icon="solar:card-bold" className="h-6 w-6" />
          </div>
        </div>
      </div>

      {hasBillingKey ? (
        <div className="border-t border-slate-100 bg-[#F8FAFC] px-5 py-5 sm:px-6">
          <div className="rounded-[24px] bg-white px-5 py-5 ring-1 ring-slate-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAFBF5] text-[#0F766E] ring-1 ring-[#BDEFE4]">
                <Icon icon="solar:card-2-bold" className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-400">
                  등록 카드
                </p>
                <p className="mt-1 truncate text-base font-bold text-slate-950">
                  {cardLabel || "카드 정보 확인 중"}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  등록일 {formatDateTime(billingMethod?.issuedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={onChange}
                disabled={isChanging}
                className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[#EAFBF5] px-3 text-xs font-bold text-[#0F766E] ring-1 ring-[#BDEFE4] transition hover:bg-[#DDF8EF] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200"
              >
                <Icon
                  icon={
                    isChanging
                      ? "solar:refresh-circle-bold"
                      : "solar:refresh-bold"
                  }
                  className={`h-4 w-4 ${isChanging ? "animate-spin" : ""}`}
                />
                {isChanging ? "변경 중" : "변경"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-100 bg-[#F8FAFC] px-5 py-5 sm:px-6">
          <div className="rounded-[24px] bg-white px-5 py-6 text-center ring-1 ring-slate-200">
            <Icon
              icon="solar:card-bold"
              className="mx-auto h-9 w-9 text-slate-300"
            />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              등록된 결제 수단이 없습니다.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function PaymentHistorySection({
  payments,
  partyId,
}: {
  payments: PaymentHistoryItem[];
  partyId?: string;
}) {
  const visiblePayments = partyId
    ? payments.filter((payment) => String(payment.partyId) === partyId)
    : payments;

  return (
    <section className="mt-5 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)] sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#14B8A6]">PAYMENTS</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">내 결제내역</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            현재 파티에 해당하는 최근 결제내역입니다.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
          {visiblePayments.length}건
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        {visiblePayments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {visiblePayments.map((payment) => (
              <PaymentHistoryItemCard
                key={`${payment.partyId}-${payment.partyCycleId}-${payment.createdAt}`}
                payment={payment}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#F8FAFC] px-5 py-8 text-center">
            <Icon
              icon="solar:bill-list-bold"
              className="mx-auto h-10 w-10 text-slate-300"
            />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              표시할 결제내역이 없습니다.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function PaymentHistoryItemCard({ payment }: { payment: PaymentHistoryItem }) {
  const date =
    payment.status === "FAILED"
      ? payment.failedAt || payment.createdAt
      : payment.paidAt || payment.createdAt;

  return (
    <article className="bg-white px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#1E3A8A] ring-1 ring-slate-100">
          <Icon icon="solar:bill-check-bold" className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {payment.serviceName || "파티 결제"}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                {formatDateTime(date)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-slate-900">
                {formatWon(payment.amount)}
              </p>
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getPaymentStatusClassName(
                  payment.status,
                )}`}
              >
                {getPaymentStatusLabel(payment.status)}
              </span>
            </div>
          </div>

          {payment.status === "FAILED" && (
            <p className="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-medium leading-5 text-rose-700 ring-1 ring-rose-100">
              {payment.failureReason || "결제 실패"}
              {payment.failureCode ? ` · ${payment.failureCode}` : ""}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
