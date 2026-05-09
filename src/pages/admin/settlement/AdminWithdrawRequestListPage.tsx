import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type WithdrawRequestStatus = "REQUESTED" | "COMPLETED" | "REJECTED";

type WithdrawRequest = {
  id: number;
  amount: number;
  status: WithdrawRequestStatus;
  bankNameSnapshot: string;
  accountMaskedSnapshot: string;
  requestedAt: string;
  processedAt: string | null;
  rejectReason: string | null;
  externalTxId: string | null;
  internalPayoutRef: string;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

type ActionModalState =
  | {
      type: "complete";
      request: WithdrawRequest;
    }
  | {
      type: "reject";
      request: WithdrawRequest;
    }
  | null;

const PAGE_SIZE = 20;

const statusTabs: Array<{ label: string; value: WithdrawRequestStatus }> = [
  { label: "처리 대기", value: "REQUESTED" },
  { label: "환급 완료", value: "COMPLETED" },
  { label: "환급 거절", value: "REJECTED" },
];

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: WithdrawRequestStatus) {
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

function getStatusClassName(status: WithdrawRequestStatus) {
  switch (status) {
    case "REQUESTED":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    case "COMPLETED":
      return "bg-teal-50 text-teal-700 ring-teal-100";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 ring-rose-100";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function getErrorMessage(statusCode?: number) {
  switch (statusCode) {
    case 404:
      return "환급 요청을 찾을 수 없습니다.";
    case 409:
      return "이미 처리된 환급 요청입니다.";
    case 401:
      return "관리자 인증이 필요합니다.";
    case 403:
      return "관리자 권한이 없습니다.";
    default:
      return "환급 요청 처리에 실패했습니다.";
  }
}

export default function AdminWithdrawRequestListPage() {
  const [status, setStatus] = useState<WithdrawRequestStatus>("REQUESTED");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalState, setModalState] = useState<ActionModalState>(null);
  const [externalTxId, setExternalTxId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const requestedAmount = useMemo(
    () => requests.reduce((sum, request) => sum + request.amount, 0),
    [requests],
  );

  const fetchRequests = useCallback(async () => {
    const shouldReplace = page === 1;

    try {
      setIsLoading(true);

      const response = await api.get<
        WithdrawRequest[] | ApiEnvelope<WithdrawRequest[]>
      >("/api/v1/admin/settlements/withdraw-requests", {
        params: {
          status,
          page,
          size: PAGE_SIZE,
        },
      });

      const data = unwrapResponse<WithdrawRequest[]>(response.data);
      const nextRequests = Array.isArray(data) ? data : [];

      setRequests((currentRequests) =>
        shouldReplace ? nextRequests : [...currentRequests, ...nextRequests],
      );
      setHasMore(nextRequests.length === PAGE_SIZE);
    } catch (error) {
      console.error(error);
      toast.error("환급 요청 목록을 불러오지 못했습니다.");
      setHasMore(false);

      if (shouldReplace) {
        setRequests([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, reloadKey]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || isLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((currentPage) => currentPage + 1);
        }
      },
      { rootMargin: "160px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, requests.length]);

  const handleStatusChange = (nextStatus: WithdrawRequestStatus) => {
    if (nextStatus === status) return;

    setStatus(nextStatus);
    setPage(1);
    setRequests([]);
    setHasMore(true);
  };

  const openCompleteModal = (request: WithdrawRequest) => {
    setExternalTxId(request.externalTxId ?? "");
    setModalState({ type: "complete", request });
  };

  const openRejectModal = (request: WithdrawRequest) => {
    setRejectReason("");
    setModalState({ type: "reject", request });
  };

  const closeModal = () => {
    if (isProcessing) return;

    setModalState(null);
    setExternalTxId("");
    setRejectReason("");
  };

  const submitComplete = async () => {
    if (!modalState || modalState.type !== "complete") return;

    try {
      setIsProcessing(true);

      await api.post(
        `/api/v1/admin/settlements/withdraw-requests/${modalState.request.id}/complete`,
        {
          externalTxId: externalTxId.trim() || null,
        },
      );

      toast.success("환급 완료 처리했습니다.");
      closeModal();
      setPage(1);
      setRequests([]);
      setHasMore(true);
      setReloadKey((currentKey) => currentKey + 1);
    } catch (error) {
      console.error(error);
      const statusCode = (error as { response?: { status?: number } }).response
        ?.status;
      toast.error(getErrorMessage(statusCode));
    } finally {
      setIsProcessing(false);
    }
  };

  const submitReject = async () => {
    if (!modalState || modalState.type !== "reject") return;

    const reason = rejectReason.trim();

    if (!reason) {
      toast.error("거절 사유를 입력해 주세요.");
      return;
    }

    try {
      setIsProcessing(true);

      await api.post(
        `/api/v1/admin/settlements/withdraw-requests/${modalState.request.id}/reject`,
        {
          reason,
        },
      );

      toast.success("환급 요청을 거절했습니다.");
      closeModal();
      setPage(1);
      setRequests([]);
      setHasMore(true);
      setReloadKey((currentKey) => currentKey + 1);
    } catch (error) {
      console.error(error);
      const statusCode = (error as { response?: { status?: number } }).response
        ?.status;
      toast.error(getErrorMessage(statusCode));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
          <p className="text-xs font-semibold text-slate-500">현재 상태</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {getStatusLabel(status)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
          <p className="text-xs font-semibold text-slate-500">조회 건수</p>
          <p className="mt-1 text-xl font-bold text-blue-900">
            {requests.length.toLocaleString()}건
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
          <p className="text-xs font-semibold text-slate-500">조회 금액</p>
          <p className="mt-1 text-xl font-bold text-teal-700">
            {formatCurrency(requestedAmount)}원
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">환급 요청 관리</h2>
            <p className="mt-1 text-sm text-slate-500">
              상태별 환급 요청을 확인하고 대기 건을 완료 또는 거절 처리합니다.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusChange(tab.value)}
                className={[
                  "h-9 rounded-lg px-3 text-xs font-semibold transition",
                  status === tab.value
                    ? "bg-white text-blue-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && requests.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Icon icon="line-md:loading-twotone-loop" className="h-5 w-5" />
              환급 요청을 불러오는 중입니다.
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Icon
                icon="solar:wallet-money-bold-duotone"
                className="h-7 w-7 text-slate-400"
              />
            </div>
            <p className="mt-4 font-semibold text-slate-900">
              조회된 환급 요청이 없습니다.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              선택한 상태의 요청이 생기면 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="no-scrollbar overflow-x-auto">
            <div className="min-w-[1220px]">
              <div className="grid grid-cols-[0.7fr_1fr_1.2fr_1.1fr_1.3fr_1.3fr_1.2fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                <span>ID</span>
                <span>금액</span>
                <span>계좌</span>
                <span>상태</span>
                <span>요청일</span>
                <span>처리일</span>
                <span>추적 ID</span>
                <span>처리</span>
              </div>

              {requests.map((request) => (
                <div
                  key={request.id}
                  className="grid grid-cols-[0.7fr_1fr_1.2fr_1.1fr_1.3fr_1.3fr_1.2fr_1fr] gap-4 border-b border-slate-100 px-5 py-4 text-sm transition last:border-b-0 hover:bg-slate-50/80"
                >
                  <div className="flex items-center font-semibold text-slate-900">
                    #{request.id}
                  </div>

                  <div className="flex items-center font-semibold text-slate-900">
                    {formatCurrency(request.amount)}원
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-700">
                      {request.bankNameSnapshot || "-"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {request.accountMaskedSnapshot || "-"}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                        getStatusClassName(request.status),
                      ].join(" ")}
                    >
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  <div className="flex items-center text-slate-600">
                    {formatDateTime(request.requestedAt)}
                  </div>

                  <div className="min-w-0 text-slate-600">
                    <p>{formatDateTime(request.processedAt)}</p>
                    {request.status === "REJECTED" && request.rejectReason ? (
                      <p className="mt-1 truncate text-xs text-rose-600">
                        {request.rejectReason}
                      </p>
                    ) : request.externalTxId ? (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {request.externalTxId}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex min-w-0 items-center">
                    <span className="truncate text-xs text-slate-500">
                      {request.internalPayoutRef || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {request.status === "REQUESTED" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openCompleteModal(request)}
                          className="inline-flex h-9 items-center rounded-lg bg-blue-900 px-3 text-xs font-semibold text-white transition hover:bg-blue-800"
                        >
                          완료
                        </button>
                        <button
                          type="button"
                          onClick={() => openRejectModal(request)}
                          className="inline-flex h-9 items-center rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          거절
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        처리 완료
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={sentinelRef} className="border-t border-slate-100 px-5 py-3">
          {isLoading && requests.length > 0 ? (
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
              <Icon icon="line-md:loading-twotone-loop" className="h-4 w-4" />
              더 불러오는 중입니다.
            </div>
          ) : null}
        </div>
      </section>

      {modalState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {modalState.type === "complete"
                    ? "환급 완료 처리"
                    : "환급 거절 처리"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  #{modalState.request.id} ·{" "}
                  {formatCurrency(modalState.request.amount)}원
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="h-5 w-5" />
              </button>
            </div>

            {modalState.type === "complete" ? (
              <label className="mt-5 block">
                <span className="text-sm font-semibold text-slate-700">
                  외부 이체 ID
                </span>
                <input
                  value={externalTxId}
                  onChange={(event) => setExternalTxId(event.target.value)}
                  placeholder="미입력 가능"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ) : (
              <label className="mt-5 block">
                <span className="text-sm font-semibold text-slate-700">
                  거절 사유
                </span>
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  rows={4}
                  placeholder="거절 사유를 입력해 주세요."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </label>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isProcessing}
                className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={
                  modalState.type === "complete" ? submitComplete : submitReject
                }
                disabled={isProcessing}
                className={[
                  "inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50",
                  modalState.type === "complete"
                    ? "bg-blue-900 hover:bg-blue-800"
                    : "bg-rose-600 hover:bg-rose-500",
                ].join(" ")}
              >
                {isProcessing ? "처리 중" : "확인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
