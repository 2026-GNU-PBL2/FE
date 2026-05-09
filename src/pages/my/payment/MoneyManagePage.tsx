import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type SettlementStatus = "ACCRUED" | string;
type WithdrawStatus = "REQUESTED" | "COMPLETED" | "REJECTED" | string;
type ActiveTab = "settlements" | "withdraws";

type PointBalanceResponse = {
  balance: number;
};

type SettlementHistoryItem = {
  id: number;
  partyId: number;
  memberCount: number;
  unitAmount: number;
  totalAmount: number;
  feeDeducted: number;
  status: SettlementStatus;
  createdAt: string;
};

type WithdrawRequestItem = {
  id: number;
  amount: number;
  status: WithdrawStatus;
  bankNameSnapshot: string;
  accountMaskedSnapshot: string;
  requestedAt: string;
  processedAt: string | null;
  rejectReason: string | null;
  externalTxId: string | null;
  internalPayoutRef: string | null;
};

type PrimaryBankAccountResponse = {
  id: number;
  fintechUseNum: string;
  bankName: string;
  accountAlias: string;
  accountNumMasked: string;
  accountType: string | null;
  isPrimary: boolean;
  verificationStatus: string;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
  content?: T;
};

type PageResponse<T> = {
  content?: T[];
  items?: T[];
  list?: T[];
  data?: T[];
  result?: T[];
  payload?: T[];
  totalPages?: number;
  totalElements?: number;
  page?: number;
  size?: number;
  number?: number;
  last?: boolean;
};

const PAGE_SIZE = 20;
const MIN_WITHDRAW_AMOUNT = 10000;
const MAX_WITHDRAW_AMOUNT = 100000;

function unwrapResponse<T>(
  value: T | ApiEnvelope<T> | undefined | null,
): T | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null) {
    const maybeEnvelope = value as ApiEnvelope<T>;

    if (maybeEnvelope.data !== undefined) return maybeEnvelope.data;
    if (maybeEnvelope.result !== undefined) return maybeEnvelope.result;
    if (maybeEnvelope.payload !== undefined) return maybeEnvelope.payload;
    if (maybeEnvelope.content !== undefined) return maybeEnvelope.content;
  }

  return value as T;
}

function unwrapList<T>(value: unknown): T[] {
  const unwrapped = unwrapResponse<unknown>(value);

  if (Array.isArray(unwrapped)) return unwrapped as T[];

  if (typeof unwrapped === "object" && unwrapped !== null) {
    const page = unwrapped as PageResponse<T>;

    if (Array.isArray(page.content)) return page.content;
    if (Array.isArray(page.items)) return page.items;
    if (Array.isArray(page.list)) return page.list;
    if (Array.isArray(page.data)) return page.data;
    if (Array.isArray(page.result)) return page.result;
    if (Array.isArray(page.payload)) return page.payload;
  }

  return [];
}

function getTotalPages(value: unknown) {
  const unwrapped = unwrapResponse<unknown>(value);

  if (typeof unwrapped !== "object" || unwrapped === null) return 1;

  const page = unwrapped as PageResponse<unknown>;

  if (typeof page.totalPages === "number" && page.totalPages > 0) {
    return page.totalPages;
  }

  return 1;
}

function formatCurrency(value: number | null | undefined) {
  return `${Number(value ?? 0).toLocaleString("ko-KR")}원`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(value: string | null | undefined) {
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

function getSettlementStatusLabel(status: SettlementStatus) {
  switch (status) {
    case "ACCRUED":
      return "적립 완료";
    default:
      return status;
  }
}

function getWithdrawStatusLabel(status: WithdrawStatus) {
  switch (status) {
    case "REQUESTED":
      return "처리 대기";
    case "COMPLETED":
      return "환급 완료";
    case "REJECTED":
      return "환급 거절";
    default:
      return status;
  }
}

function getWithdrawStatusClassName(status: WithdrawStatus) {
  switch (status) {
    case "REQUESTED":
      return "bg-sky-50 text-sky-700";
    case "COMPLETED":
      return "bg-teal-50 text-teal-700";
    case "REJECTED":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getSettlementStatusClassName(status: SettlementStatus) {
  switch (status) {
    case "ACCRUED":
      return "bg-teal-50 text-teal-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getVerificationStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "VERIFIED":
    case "APPROVED":
      return "인증 완료";
    case "PENDING":
      return "인증 대기";
    case "FAILED":
    case "REJECTED":
      return "인증 실패";
    default:
      return status || "-";
  }
}

function getVerificationStatusClassName(status: string | null | undefined) {
  switch (status) {
    case "VERIFIED":
    case "APPROVED":
      return "bg-teal-50 text-teal-700 ring-teal-100";
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    case "FAILED":
    case "REJECTED":
      return "bg-rose-50 text-rose-700 ring-rose-100";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

export default function MoneyManagePage() {
  const [balance, setBalance] = useState(0);
  const [primaryBankAccount, setPrimaryBankAccount] =
    useState<PrimaryBankAccountResponse | null>(null);
  const [settlementHistories, setSettlementHistories] = useState<
    SettlementHistoryItem[]
  >([]);
  const [withdrawRequests, setWithdrawRequests] = useState<
    WithdrawRequestItem[]
  >([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>("settlements");
  const [settlementPage, setSettlementPage] = useState(1);
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [settlementTotalPages, setSettlementTotalPages] = useState(1);
  const [withdrawTotalPages, setWithdrawTotalPages] = useState(1);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBankAccountLoading, setIsBankAccountLoading] = useState(false);
  const [isSettlementLoading, setIsSettlementLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericWithdrawAmount = useMemo(() => {
    return Number(withdrawAmount.replaceAll(",", ""));
  }, [withdrawAmount]);

  const thisMonthSettlementAmount = useMemo(() => {
    const now = new Date();

    return settlementHistories
      .filter((item) => {
        const date = new Date(item.createdAt);

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0);
  }, [settlementHistories]);

  const thisMonthWithdrawAmount = useMemo(() => {
    const now = new Date();

    return withdrawRequests
      .filter((item) => {
        const date = new Date(item.requestedAt);

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  }, [withdrawRequests]);

  const canSubmitWithdraw =
    Number.isFinite(numericWithdrawAmount) &&
    numericWithdrawAmount >= MIN_WITHDRAW_AMOUNT &&
    numericWithdrawAmount <= MAX_WITHDRAW_AMOUNT &&
    numericWithdrawAmount <= balance &&
    !isSubmitting;

  const fetchPointBalance = useCallback(async () => {
    const response = await api.get<PointBalanceResponse>(
      "/api/v1/settlements/points",
    );

    const data = unwrapResponse<PointBalanceResponse>(response.data);

    setBalance(Number(data?.balance ?? 0));
  }, []);

  const fetchPrimaryBankAccount = useCallback(async () => {
    setIsBankAccountLoading(true);

    try {
      const response = await api.get<PrimaryBankAccountResponse>(
        "/api/v1/bank/accounts/primary",
      );

      const data = unwrapResponse<PrimaryBankAccountResponse>(response.data);

      setPrimaryBankAccount(data ?? null);
    } catch (error) {
      console.error(error);
      setPrimaryBankAccount(null);
    } finally {
      setIsBankAccountLoading(false);
    }
  }, []);

  const fetchSettlementHistory = useCallback(async (page: number) => {
    setIsSettlementLoading(true);

    try {
      const response = await api.get("/api/v1/settlements/history", {
        params: {
          page,
          size: PAGE_SIZE,
        },
      });

      setSettlementHistories(
        unwrapList<SettlementHistoryItem>(response.data).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      setSettlementTotalPages(getTotalPages(response.data));
    } catch (error) {
      console.error(error);
      toast.error("정산 이력을 불러오지 못했습니다.");
    } finally {
      setIsSettlementLoading(false);
    }
  }, []);

  const fetchWithdrawRequests = useCallback(async (page: number) => {
    setIsWithdrawLoading(true);

    try {
      const response = await api.get("/api/v1/settlements/withdraw-requests", {
        params: {
          page,
          size: PAGE_SIZE,
        },
      });

      setWithdrawRequests(
        unwrapList<WithdrawRequestItem>(response.data).sort(
          (a, b) =>
            new Date(b.requestedAt).getTime() -
            new Date(a.requestedAt).getTime(),
        ),
      );
      setWithdrawTotalPages(getTotalPages(response.data));
    } catch (error) {
      console.error(error);
      toast.error("환급 요청 내역을 불러오지 못했습니다.");
    } finally {
      setIsWithdrawLoading(false);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setIsInitialLoading(true);

    try {
      await Promise.all([
        fetchPointBalance(),
        fetchPrimaryBankAccount(),
        fetchSettlementHistory(1),
        fetchWithdrawRequests(1),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("포인트 정보를 불러오지 못했습니다.");
    } finally {
      setIsInitialLoading(false);
    }
  }, [
    fetchPointBalance,
    fetchPrimaryBankAccount,
    fetchSettlementHistory,
    fetchWithdrawRequests,
  ]);

  const handleWithdrawAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const onlyNumber = event.target.value.replace(/\D/g, "");

    if (!onlyNumber) {
      setWithdrawAmount("");
      return;
    }

    setWithdrawAmount(Number(onlyNumber).toLocaleString("ko-KR"));
  };

  const handleSubmitWithdraw = async () => {
    if (!Number.isFinite(numericWithdrawAmount)) {
      toast.error("환급 요청 금액을 입력해주세요.");
      return;
    }

    if (numericWithdrawAmount < MIN_WITHDRAW_AMOUNT) {
      toast.error("환급 요청은 최소 10,000원부터 가능합니다.");
      return;
    }

    if (numericWithdrawAmount > MAX_WITHDRAW_AMOUNT) {
      toast.error("환급 요청은 최대 100,000원까지 가능합니다.");
      return;
    }

    if (numericWithdrawAmount > balance) {
      toast.error("보유 포인트보다 큰 금액은 환급 요청할 수 없습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/api/v1/settlements/withdraw-requests", {
        amount: numericWithdrawAmount,
      });

      toast.success("환급 요청이 접수되었습니다.");
      setWithdrawAmount("");
      setWithdrawPage(1);
      setActiveTab("withdraws");

      await Promise.all([
        fetchPointBalance(),
        fetchSettlementHistory(settlementPage),
        fetchWithdrawRequests(1),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("환급 요청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettlementPageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > settlementTotalPages) return;

    setSettlementPage(nextPage);
    await fetchSettlementHistory(nextPage);
  };

  const handleWithdrawPageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > withdrawTotalPages) return;

    setWithdrawPage(nextPage);
    await fetchWithdrawRequests(nextPage);
  };

  useEffect(() => {
    void fetchInitialData();
  }, [fetchInitialData]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="space-y-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 ring-1 ring-blue-100">
                <Icon icon="solar:wallet-money-bold" className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-blue-900">정산 포인트</p>
                <p className="mt-1 text-sm text-slate-500">환급 가능 포인트</p>
              </div>
            </div>

            <div className="mt-4 flex min-w-0 items-baseline gap-1.5 md:mt-3">
              <p className="min-w-0 truncate text-3xl font-bold text-slate-950 md:text-[34px]">
                {isInitialLoading ? "..." : balance.toLocaleString("ko-KR")}
              </p>
              <p className="shrink-0 text-base font-bold text-slate-500">원</p>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              정산 완료 금액을 대표 계좌로 환급 요청할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SimpleStatCard
              label="이번 달 적립"
              value={formatCurrency(thisMonthSettlementAmount)}
              icon="solar:round-arrow-down-bold"
              tone="teal"
            />
            <SimpleStatCard
              label="이번 달 환급 요청"
              value={formatCurrency(thisMonthWithdrawAmount)}
              icon="solar:round-arrow-up-bold"
              tone="blue"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-blue-900">환급</p>
            <h2 className="mt-1 text-base font-bold text-slate-950">
              환급 요청
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              포인트를 계좌로 환급받습니다.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-blue-900">
            <Icon icon="solar:card-send-bold" className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-900 ring-1 ring-slate-200">
                  <Icon icon="solar:banknote-bold" className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">
                    대표 정산계좌
                  </p>
                  {isBankAccountLoading ? (
                    <p className="mt-1 text-sm text-slate-500">
                      정산계좌를 조회하는 중입니다.
                    </p>
                  ) : primaryBankAccount ? (
                    <>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {primaryBankAccount.bankName || "은행 정보 없음"} ·{" "}
                        {primaryBankAccount.accountNumMasked ||
                          "계좌 정보 없음"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {primaryBankAccount.accountAlias || "대표 계좌"} ·{" "}
                        {primaryBankAccount.accountType || "정산 계좌"}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">
                      등록된 대표 정산계좌가 없습니다.
                    </p>
                  )}
                </div>
              </div>

              {primaryBankAccount ? (
                <span
                  className={[
                    "inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1",
                    getVerificationStatusClassName(
                      primaryBankAccount.verificationStatus,
                    ),
                  ].join(" ")}
                >
                  {getVerificationStatusLabel(
                    primaryBankAccount.verificationStatus,
                  )}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
          <div className="min-w-0">
            <label
              htmlFor="withdrawAmount"
              className="text-sm font-bold text-slate-800"
            >
              요청 금액
            </label>

            <div className="mt-3 flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-900 focus-within:bg-white">
              <input
                id="withdrawAmount"
                value={withdrawAmount}
                onChange={handleWithdrawAmountChange}
                inputMode="numeric"
                placeholder="0"
                className="w-full min-w-0 flex-1 bg-transparent text-xl font-bold text-slate-950 outline-none placeholder:text-slate-300"
              />
              <span className="ml-2 text-base font-bold text-slate-500">
                원
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmitWithdraw}
            disabled={!canSubmitWithdraw}
            className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-2xl bg-blue-900 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Icon
              icon={
                isSubmitting
                  ? "solar:refresh-circle-bold"
                  : "solar:card-send-bold"
              }
              className={`h-5 w-5 ${isSubmitting ? "animate-spin" : ""}`}
            />
            {isSubmitting ? "요청 중..." : "환급 요청하기"}
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <NoticeRow label="최소 요청" value="10,000원" tone="blue" />
          <NoticeRow label="최대 요청" value="100,000원" tone="slate" />
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold text-blue-900">내역</p>
              <h2 className="mt-1 text-base font-bold text-slate-950">
                정산 및 환급
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                정산 적립과 환급 요청 상태를 확인합니다.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1 md:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("settlements")}
                className={[
                  "h-9 rounded-xl px-4 text-sm font-bold transition md:min-w-20",
                  activeTab === "settlements"
                    ? "bg-white text-blue-900 shadow-sm shadow-slate-200"
                    : "text-slate-500",
                ].join(" ")}
              >
                정산
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("withdraws")}
                className={[
                  "h-9 rounded-xl px-4 text-sm font-bold transition md:min-w-20",
                  activeTab === "withdraws"
                    ? "bg-white text-blue-900 shadow-sm shadow-slate-200"
                    : "text-slate-500",
                ].join(" ")}
              >
                환급
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {activeTab === "settlements" ? (
            <SettlementHistoryList
              items={settlementHistories}
              isLoading={isSettlementLoading}
              currentPage={settlementPage}
              totalPages={settlementTotalPages}
              onPageChange={handleSettlementPageChange}
            />
          ) : (
            <WithdrawRequestList
              items={withdrawRequests}
              isLoading={isWithdrawLoading}
              currentPage={withdrawPage}
              totalPages={withdrawTotalPages}
              onPageChange={handleWithdrawPageChange}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function SimpleStatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "blue" | "teal";
}) {
  const isTeal = tone === "teal";

  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.04)] sm:p-5">
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1",
          isTeal
            ? "bg-teal-50 text-teal-700 ring-teal-100"
            : "bg-blue-50 text-blue-900 ring-blue-100",
        ].join(" ")}
      >
        <Icon icon={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-1 truncate text-lg font-bold text-slate-950 sm:text-xl">
          {value}
        </p>
      </div>
    </div>
  );
}

function NoticeRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "slate";
}) {
  const isBlue = tone === "blue";

  return (
    <div
      className={[
        "min-w-0 rounded-2xl border px-4 py-3",
        isBlue
          ? "border-blue-100 bg-blue-50/70"
          : "border-slate-200 bg-slate-50",
      ].join(" ")}
    >
      <div className="min-w-0">
        <p
          className={[
            "text-xs font-semibold",
            isBlue ? "text-blue-900" : "text-slate-500",
          ].join(" ")}
        >
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function SettlementHistoryList({
  items,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: {
  items: SettlementHistoryItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (isLoading) {
    return <ListSkeleton />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="정산 이력이 없습니다"
        description="정산이 적립되면 이곳에 표시됩니다."
      />
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3.5 transition hover:border-slate-200 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <Icon icon="solar:wallet-money-bold" className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-slate-950">
                    파티 정산 적립
                  </p>
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      getSettlementStatusClassName(item.status),
                    ].join(" ")}
                  >
                    {getSettlementStatusLabel(item.status)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {formatDateTime(item.createdAt)}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span>파티 #{item.partyId}</span>
                  <span>{item.memberCount}명</span>
                  <span>수수료 {formatCurrency(item.feeDeducted)}</span>
                </div>
              </div>
            </div>

            <div className="pl-13 text-left sm:pl-0 sm:text-right">
              <p className="text-base font-bold text-teal-700">
                +{formatCurrency(item.totalAmount)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                1인 {formatCurrency(item.unitAmount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

function WithdrawRequestList({
  items,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: {
  items: WithdrawRequestItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (isLoading) {
    return <ListSkeleton />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="환급 요청 내역이 없습니다"
        description="환급을 요청하면 이곳에 표시됩니다."
      />
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-100 bg-white px-3.5 py-3.5 transition hover:border-slate-200 hover:bg-slate-50"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900 ring-1 ring-blue-100">
                  <Icon icon="solar:card-send-bold" className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-950">
                      포인트 환급 요청
                    </p>
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                        getWithdrawStatusClassName(item.status),
                      ].join(" ")}
                    >
                      {getWithdrawStatusLabel(item.status)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDateTime(item.requestedAt)}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span>{item.bankNameSnapshot || "은행 정보 없음"}</span>
                    <span>
                      {item.accountMaskedSnapshot || "계좌 정보 없음"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pl-13 text-left sm:pl-0 sm:text-right">
                <p className="text-base font-bold text-slate-950">
                  -{formatCurrency(item.amount)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  처리 {formatDate(item.processedAt)}
                </p>
              </div>
            </div>

            {item.status === "REJECTED" && item.rejectReason && (
              <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:ml-13">
                {item.rejectReason}
              </div>
            )}

            {item.internalPayoutRef && (
              <p className="mt-3 truncate text-xs text-slate-400 sm:ml-13">
                내부 추적 번호 {item.internalPayoutRef}
              </p>
            )}
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-4 py-5">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
      </button>

      <span className="text-sm font-bold text-slate-700">
        {currentPage} / {Math.max(totalPages, 1)}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        <Icon icon="solar:alt-arrow-right-linear" className="h-5 w-5" />
      </button>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        <Icon icon="solar:document-text-bold" className="h-6 w-6" />
      </div>

      <p className="mt-4 font-bold text-slate-950">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex animate-pulse gap-3 px-4 py-4">
          <div className="h-10 w-10 rounded-2xl bg-slate-100" />

          <div className="flex-1 space-y-3">
            <div className="h-4 w-36 rounded-full bg-slate-100" />
            <div className="h-3 w-48 rounded-full bg-slate-100" />
            <div className="h-3 w-28 rounded-full bg-slate-100" />
          </div>

          <div className="hidden w-24 space-y-3 sm:block">
            <div className="h-4 rounded-full bg-slate-100" />
            <div className="h-3 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
