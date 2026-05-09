import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { loadTossPaymentsScript } from "@/utils/loadTossPayments";

type PaymentStatus =
  | "PAYMENT_PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | string;

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

type PartyHistoryItem = {
  partyId: number;
  displayPartyId?: string | null;
  productName?: string | null;
  role?: string | null;
  status?: string | null;
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

function formatWon(value?: number | null) {
  if (value === null || value === undefined) return "-";
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
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

function getPaymentStatusLabel(status?: PaymentStatus | null) {
  if (status === "PAYMENT_PENDING") return "결제 대기";
  if (status === "PROCESSING") return "처리 중";
  if (status === "PAID") return "결제 완료";
  if (status === "FAILED") return "결제 실패";
  if (status === "CANCELLED") return "취소";
  return status || "-";
}

function getPaymentStatusClassName(status?: PaymentStatus | null) {
  if (status === "PAID") return "bg-teal-50 text-teal-700 ring-teal-100";
  if (status === "FAILED") return "bg-rose-50 text-rose-700 ring-rose-100";
  if (status === "CANCELLED")
    return "bg-slate-100 text-slate-600 ring-slate-200";
  if (status === "PROCESSING" || status === "PAYMENT_PENDING") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function getPartyRoleLabel(role?: string | null) {
  if (role === "HOST") return "파티장";
  if (role === "MEMBER") return "파티원";
  return role || "파티";
}

export default function PaymentMethodManagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingMethod, setBillingMethod] =
    useState<BillingMethodResponse | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    [],
  );
  const [partyHistory, setPartyHistory] = useState<PartyHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBillingChanging, setIsBillingChanging] = useState(false);

  const clientKey = import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY as
    | string
    | undefined;

  const partyMap = useMemo(() => {
    const map = new Map<number, PartyHistoryItem>();

    partyHistory.forEach((party) => {
      map.set(party.partyId, party);
    });

    return map;
  }, [partyHistory]);

  const visiblePayments = useMemo(() => {
    return [...paymentHistory].sort((a, b) => {
      const aDate = a.paidAt || a.failedAt || a.createdAt || "";
      const bDate = b.paidAt || b.failedAt || b.createdAt || "";

      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [paymentHistory]);

  const thisMonthPaidAmount = useMemo(() => {
    const now = new Date();

    return visiblePayments
      .filter((payment) => {
        if (payment.status !== "PAID") return false;

        const date = new Date(payment.paidAt || payment.createdAt || "");

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  }, [visiblePayments]);

  const fetchPaymentData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const [billingResult, paymentHistoryResult, partyHistoryResult] =
        await Promise.allSettled([
          api.get("/api/v1/payments/billing/me"),
          api.get("/api/v1/payments/me/history", {
            params: { page: 0, size: 50 },
          }),
          api.get("/api/v1/me/party-history"),
        ]);

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

      if (partyHistoryResult.status === "fulfilled") {
        const data = unwrapResponse<PartyHistoryItem[]>(
          partyHistoryResult.value.data,
        );

        setPartyHistory(Array.isArray(data) ? data : []);
      } else {
        setPartyHistory([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("결제 정보를 불러오지 못했습니다.");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchPaymentData();
  }, [fetchPaymentData]);

  useEffect(() => {
    const billingChange = searchParams.get("billingChange");
    const rawAuthKey = searchParams.get("authKey") ?? "";
    const authKey = rawAuthKey.replace(/ /g, "+");

    if (billingChange !== "success") {
      if (billingChange === "fail") {
        toast.error("카드 변경 인증이 취소되었거나 실패했습니다.");
        navigate("/mypage/payment-method", { replace: true });
      }
      return;
    }

    if (!authKey) {
      toast.error("카드 변경 승인 정보가 없습니다.");
      navigate("/mypage/payment-method", { replace: true });
      return;
    }

    const dedupeKey = `billing-change:${authKey}`;

    if (sessionStorage.getItem(dedupeKey) === "done") {
      navigate("/mypage/payment-method", { replace: true });
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
        await fetchPaymentData(false);
        navigate("/mypage/payment-method", { replace: true });
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
  }, [fetchPaymentData, navigate, searchParams]);

  const handleChangeBillingMethod = async () => {
    if (isBillingChanging) return;

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
        "/mypage/payment-method",
        window.location.origin,
      );
      const failUrl = new URL(
        "/mypage/payment-method",
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

  if (isLoading) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-16 text-center">
        <Icon
          icon="solar:refresh-circle-bold"
          className="mx-auto h-10 w-10 animate-spin text-blue-900"
        />
        <p className="mt-4 text-sm font-semibold text-slate-500">
          결제 정보를 불러오는 중입니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BillingMethodCard
        billingMethod={billingMethod}
        isChanging={isBillingChanging}
        onChange={handleChangeBillingMethod}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <SummaryCard
          icon="solar:bill-list-bold"
          label="이번 달 결제"
          value={formatWon(thisMonthPaidAmount)}
        />
        <SummaryCard
          icon="solar:card-bold"
          label="등록 카드"
          value={
            billingMethod?.hasBillingKey
              ? billingMethod.cardCompany || "등록 완료"
              : "미등록"
          }
        />
      </section>

      <PaymentHistorySection
        payments={visiblePayments}
        partyMap={partyMap}
      />
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
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${
              hasBillingKey
                ? "bg-blue-50 text-blue-900 ring-blue-100"
                : "bg-slate-50 text-slate-400 ring-slate-200"
            }`}
          >
            <Icon icon="solar:card-bold" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-900">결제 관리</p>
            <h2 className="mt-1 text-base font-bold text-slate-950">
              {hasBillingKey ? cardLabel || "등록 카드" : "등록된 카드 없음"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {hasBillingKey
                ? `등록일 ${formatDateTime(billingMethod?.issuedAt)}`
                : "파티 자동결제에 사용할 카드를 등록해 주세요."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onChange}
          disabled={isChanging}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-900 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 md:w-auto"
        >
          <Icon
            icon={isChanging ? "solar:refresh-circle-bold" : "solar:refresh-bold"}
            className={`h-5 w-5 ${isChanging ? "animate-spin" : ""}`}
          />
          {isChanging ? "변경 중" : hasBillingKey ? "카드 변경" : "카드 등록"}
        </button>
      </div>
    </section>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-blue-900 ring-1 ring-slate-200">
        <Icon icon={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-1 truncate text-base font-bold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function PaymentHistorySection({
  payments,
  partyMap,
}: {
  payments: PaymentHistoryItem[];
  partyMap: Map<number, PartyHistoryItem>;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-blue-900">결제 내역</p>
            <h2 className="mt-1 text-base font-bold text-slate-950">
              파티별 결제 기록
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              결제가 발생한 파티와 처리 상태를 확인합니다.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
            {payments.length}건
          </span>
        </div>
      </div>

      {payments.length > 0 ? (
        <div className="space-y-2 p-3 sm:p-4">
          {payments.map((payment) => (
            <PaymentHistoryItemCard
              key={`${payment.partyId}-${payment.partyCycleId}-${payment.createdAt}`}
              payment={payment}
              party={partyMap.get(payment.partyId)}
            />
          ))}
        </div>
      ) : (
        <div className="px-5 py-14 text-center">
          <Icon
            icon="solar:bill-list-bold"
            className="mx-auto h-10 w-10 text-slate-300"
          />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            표시할 결제내역이 없습니다.
          </p>
        </div>
      )}
    </section>
  );
}

function PaymentHistoryItemCard({
  payment,
  party,
}: {
  payment: PaymentHistoryItem;
  party?: PartyHistoryItem;
}) {
  const date =
    payment.status === "FAILED"
      ? payment.failedAt || payment.createdAt
      : payment.paidAt || payment.createdAt;
  const partyName = party?.productName || payment.serviceName || "파티 결제";
  const displayPartyId = party?.displayPartyId || `#${payment.partyId}`;

  return (
    <article className="rounded-2xl border border-slate-100 bg-white px-4 py-4 transition hover:border-slate-200 hover:bg-slate-50">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 ring-1 ring-blue-100">
            <Icon icon="solar:bill-check-bold" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-bold text-slate-950">
                {partyName}
              </p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                {getPartyRoleLabel(party?.role)}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
              <span>파티 {displayPartyId}</span>
              <span>{formatDateTime(date)}</span>
            </div>

            {payment.status === "FAILED" && (
              <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                {payment.failureReason || "결제 실패"}
                {payment.failureCode ? ` · ${payment.failureCode}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="pl-13 text-left md:pl-0 md:text-right">
          <p className="text-base font-bold text-slate-950">
            {formatWon(payment.amount)}
          </p>
          <span
            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getPaymentStatusClassName(
              payment.status,
            )}`}
          >
            {getPaymentStatusLabel(payment.status)}
          </span>
        </div>
      </div>
    </article>
  );
}
