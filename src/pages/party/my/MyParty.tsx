import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { useAuthStore } from "@/stores/authStore";
import { getAdultCheckKey } from "./provision/shared/provisionStorage";

type PartyRole = "HOST" | "MEMBER" | string;
type PartyHistoryStatus = "USING" | "SCHEDULED" | "ENDED" | string;

type PartyHistoryItem = {
  partyId: number;
  displayPartyId: string;
  productId: string;
  productName: string;
  role: PartyRole;
  status: PartyHistoryStatus;
  startAt: string | null;
  endAt: string | null;
};

type PartyJoinStatus = "WAITING" | "ACTIVE" | "CANCELED" | string;

type PartyJoinRequestItem = {
  joinRequestId: number;
  partyId?: number | null;
  productId: string;
  productName: string;
  thumbnailUrl: string;
  joinStatus: PartyJoinStatus;
  requestedAt: string | null;
  partyStartAt: string | null;
  commitmentPeriodText: string;
  expectedPaymentAmount: number;
  statusLabel: string;
  statusMessage: string;
};

type PartyJoinCancelResponse = {
  joinRequestId: number;
  canceledAt: string;
  message: string;
};

type PartyMemberProvisionResponse = {
  memberStatus?: string | null;
};

type PartyUsagePeriodResponse = {
  partyId: number;
  currentStartDate: string | null;
  currentEndDate: string | null;
  nextBillingDate: string | null;
  endingSoon: boolean;
  daysRemaining: number;
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

function getRoleLabel(role: PartyRole) {
  if (role === "HOST") return "파티장";
  if (role === "MEMBER") return "파티원";
  return role;
}

function getStatusLabel(status: PartyHistoryStatus) {
  if (status === "USING") return "이용 중";
  if (status === "SCHEDULED") return "이용 예정";
  if (status === "ENDED") return "종료";
  return status;
}

function getStatusStyle(status: PartyHistoryStatus) {
  if (status === "USING") {
    return "bg-teal-50 text-[#0F766E] ring-teal-100";
  }

  if (status === "ENDED") {
    return "bg-slate-100 text-slate-500 ring-slate-200";
  }

  if (status === "SCHEDULED") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-[#38BDF8]/10 text-[#0369A1] ring-[#38BDF8]/20";
}

function getRoleStyle(role: PartyRole) {
  if (role === "HOST") {
    return {
      iconBg: "bg-blue-50 text-brand-main ring-blue-100",
      badge: "bg-blue-50 text-brand-main ring-blue-100",
      accent: "bg-brand-main",
    };
  }

  if (role === "MEMBER") {
    return {
      iconBg: "bg-teal-50 text-[#0F766E] ring-teal-100",
      badge: "bg-teal-50 text-[#0F766E] ring-teal-100",
      accent: "bg-[#14B8A6]",
    };
  }

  return {
    iconBg: "bg-slate-50 text-slate-600 ring-slate-100",
    badge: "bg-slate-50 text-slate-500 ring-slate-100",
    accent: "bg-slate-400",
  };
}

function getJoinStatusStyle(status: PartyJoinStatus) {
  const normalizedStatus = normalizeJoinStatus(status);

  if (normalizedStatus === "WAITING") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  if (normalizedStatus === "ACTIVE" || normalizedStatus === "MATCHED") {
    return "bg-[#2DD4BF]/10 text-[#0F766E] ring-[#2DD4BF]/20";
  }

  if (normalizedStatus === "CANCELED") {
    return "bg-slate-100 text-slate-500 ring-slate-200";
  }

  return "bg-[#38BDF8]/10 text-[#0369A1] ring-[#38BDF8]/20";
}

function normalizeJoinStatus(status: PartyJoinStatus) {
  return String(status).trim().toUpperCase();
}

function canShowCancelJoinRequest(status: PartyJoinStatus) {
  const normalizedStatus = normalizeJoinStatus(status);
  return normalizedStatus === "WAITING";
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatUsageDayCount(startDate?: string | null) {
  if (!startDate) return "-";

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "-";

  const now = new Date();
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor(
    (today.getTime() - startDay.getTime()) / 86_400_000,
  );

  return `${Math.max(1, diffDays + 1)}일째 이용 중`;
}

function formatScheduledStartText(startDate?: string | null) {
  const formattedDate = formatDate(startDate ?? null);
  if (formattedDate === "-") return "다음 결제일부터 이용 예정";
  return `${formattedDate}부터 이용 예정`;
}

function formatPrice(value?: number | null) {
  if (typeof value !== "number") return "-";
  return `${value.toLocaleString("ko-KR")}원`;
}

function getProductIcon(productName: string) {
  const name = productName.toLowerCase();

  if (name.includes("spotify") || name.includes("스포티파이"))
    return "mdi:spotify";
  if (name.includes("netflix") || name.includes("넷플릭스"))
    return "mdi:netflix";
  if (name.includes("youtube") || name.includes("유튜브")) return "mdi:youtube";
  if (name.includes("chatgpt") || name.includes("gpt"))
    return "simple-icons:openai";
  if (name.includes("watcha") || name.includes("왓챠"))
    return "simple-icons:watcha";
  if (name.includes("disney") || name.includes("디즈니"))
    return "simple-icons:disneyplus";

  return "solar:star-circle-bold";
}

export default function MyParty() {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id);

  const [parties, setParties] = useState<PartyHistoryItem[]>([]);
  const [usagePeriods, setUsagePeriods] = useState<
    Record<number, PartyUsagePeriodResponse>
  >({});
  const [joinRequests, setJoinRequests] = useState<PartyJoinRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<PartyJoinRequestItem | null>(
    null,
  );
  const [isCanceling, setIsCanceling] = useState(false);

  const usingParties = useMemo(() => {
    return parties.filter((party) => party.status === "USING");
  }, [parties]);

  const scheduledParties = useMemo(() => {
    return parties.filter((party) => party.status === "SCHEDULED");
  }, [parties]);

  const endedParties = useMemo(() => {
    return parties.filter((party) => party.status === "ENDED");
  }, [parties]);

  const visibleJoinRequests = useMemo(() => {
    const historyPartyIds = new Set(
      parties.map((party) => String(party.partyId)),
    );

    return joinRequests.filter((request) => {
      if (!request.partyId) return true;
      return !historyPartyIds.has(String(request.partyId));
    });
  }, [joinRequests, parties]);

  useEffect(() => {
    const fetchPartyHistory = async () => {
      try {
        setIsLoading(true);

        const response = await api.get("/api/v1/me/party-history");
        const data = unwrapResponse<PartyHistoryItem[]>(response.data) ?? [];

        setParties(data);

        const activeParties = data.filter((party) => party.status === "USING");
        const usagePeriodResults = await Promise.allSettled(
          activeParties.map(async (party) => {
            const usageResponse = await api.get(
              `/api/v1/parties/${party.partyId}/usage-period`,
            );
            return unwrapResponse<PartyUsagePeriodResponse>(usageResponse.data);
          }),
        );

        const nextUsagePeriods: Record<number, PartyUsagePeriodResponse> = {};
        usagePeriodResults.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            nextUsagePeriods[result.value.partyId] = result.value;
          }
        });
        setUsagePeriods(nextUsagePeriods);
      } catch (error) {
        console.error(error);
        toast.error("내 파티 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartyHistory();
  }, []);

  const fetchJoinRequests = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/party-join/me");
      const data =
        unwrapResponse<PartyJoinRequestItem[] | PartyJoinRequestItem>(
          response.data,
        ) ?? [];
      const nextJoinRequests = Array.isArray(data) ? data : [data];

      setJoinRequests(nextJoinRequests);
    } catch (error) {
      console.error(error);
      setJoinRequests([]);
    }
  }, []);

  useEffect(() => {
    fetchJoinRequests();
  }, [fetchJoinRequests]);

  const handleGoDetail = async (party: PartyHistoryItem) => {
    const detailState = {
      productId: party.productId,
      productName: party.productName,
      role: party.role,
      status: party.status,
      startAt: party.startAt,
      endAt: party.endAt,
    };

    if (party.status === "SCHEDULED") {
      navigate(`/myparty/${party.partyId}`, { state: detailState });
      return;
    }

    if (party.role !== "HOST") {
      try {
        const response = await api.get(
          `/api/v1/parties/${party.partyId}/provision/me`,
        );
        const provisionMe = unwrapResponse<PartyMemberProvisionResponse>(
          response.data,
        );

        if (provisionMe?.memberStatus === "ACTIVE") {
          navigate(`/myparty/${party.partyId}/provision/member-dashboard`);
          return;
        }
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response
          ?.status;

        if (status !== 403 && status !== 404) {
          console.error(error);
        }
      }

      navigate(`/myparty/${party.partyId}`, { state: detailState });
      return;
    }

    try {
      const response = await api.get(
        `/api/v1/parties/${party.partyId}/provision`,
      );
      const provision = unwrapResponse<{ provisionType?: string }>(
        response.data,
      );
      const hasProvision = Boolean(provision);

      if (!hasProvision) {
        navigate(`/myparty/${party.partyId}`, { state: detailState });
        return;
      }

      if (
        provision?.provisionType === "INVITE_CODE" ||
        provision?.provisionType === "INVITE_LINK"
      ) {
        navigate(`/myparty/${party.partyId}/provision/dashboard`);
        return;
      }

      const adultCheckDone =
        userId != null
          ? window.localStorage.getItem(
              getAdultCheckKey(party.partyId, userId),
            ) === "done"
          : false;

      if (adultCheckDone) {
        navigate(`/myparty/${party.partyId}/provision/dashboard`);
        return;
      }

      navigate(
        `/myparty/${party.partyId}/provision/adult-check/${party.productId}`,
        {
          state: {
            productName: party.productName,
          },
        },
      );
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;

      if (status !== 404) {
        console.error(error);
      }

      navigate(`/myparty/${party.partyId}`, { state: detailState });
    }
  };

  const handleGoJoinRequestParty = (request: PartyJoinRequestItem) => {
    if (!request.partyId) {
      toast.info("아직 이동할 수 있는 파티 정보가 없습니다.");
      return;
    }

    navigate(`/myparty/${request.partyId}`, {
      state: {
        productId: request.productId,
        productName: request.productName,
        role: "MEMBER",
      },
    });
  };

  const handleCancelJoinRequest = async () => {
    if (!cancelTarget) return;

    try {
      setIsCanceling(true);

      const response = await api.post(
        `/api/v1/party-join/${cancelTarget.joinRequestId}/cancel`,
      );
      const cancelResult = unwrapResponse<PartyJoinCancelResponse>(
        response.data,
      );

      setJoinRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.joinRequestId === cancelTarget.joinRequestId
            ? {
                ...request,
                joinStatus: "CANCELED",
                statusLabel: "취소됨",
                statusMessage:
                  cancelResult?.message || "자동 매칭 신청이 취소되었습니다.",
              }
            : request,
        ),
      );
      toast.success(cancelResult?.message || "자동 매칭 신청을 취소했습니다.");
      setCancelTarget(null);
    } catch (error) {
      console.error(error);
      toast.error("자동 매칭 신청을 취소하지 못했습니다.");
      await fetchJoinRequests();
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                  <Icon
                    icon="solar:users-group-rounded-bold"
                    className="h-7 w-7"
                  />
                </div>

                <div>
                  <p className="text-[13px] font-extrabold text-slate-400">
                    MY PARTY
                  </p>

                  <h1 className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[34px]">
                    내 파티
                  </h1>

                  <p className="mt-3 max-w-[560px] text-[15px] leading-6 text-slate-500">
                    참여 중인 구독, 시작 예정인 파티, 자동 매칭 신청 현황을
                    한곳에서 확인하세요.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-[24px] bg-slate-50 p-2 ring-1 ring-slate-100 sm:min-w-[360px]">
                <SummaryCount
                  label="이용 중"
                  count={usingParties.length}
                  className="text-[#0F766E]"
                />
                <SummaryCount
                  label="예정"
                  count={scheduledParties.length}
                  className="text-amber-600"
                />
                <SummaryCount
                  label="종료"
                  count={endedParties.length}
                  className="text-slate-700"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div>
            <p className="text-[13px] font-extrabold text-[#0F766E]">이용 중</p>
            <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-slate-950">
              현재 이용 중인 구독
            </h2>
          </div>

          <div className="mt-4 overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
            {isLoading ? (
              <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                <Icon
                  icon="solar:refresh-circle-bold"
                  className="h-10 w-10 animate-spin text-[#0F766E]"
                />
                <p className="mt-4 text-sm font-semibold text-slate-600">
                  파티 목록을 불러오는 중입니다
                </p>
              </div>
            ) : usingParties.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {usingParties.map((party) => (
                  <PartyListItem
                    key={party.partyId}
                    party={party}
                    usagePeriod={usagePeriods[party.partyId]}
                    onClick={() => handleGoDetail(party)}
                  />
                ))}

                <button
                  onClick={() => navigate("/")}
                  className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                    <Icon icon="solar:add-circle-bold" className="h-7 w-7" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-extrabold text-slate-800">
                      파티 추가
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-400">
                      새로운 구독 파티를 이용해보세요
                    </p>
                  </div>

                  <Icon
                    icon="solar:alt-arrow-right-linear"
                    className="h-6 w-6 text-slate-300"
                  />
                </button>
              </div>
            ) : (
              <div className="px-5 py-5">
                <button
                  onClick={() => navigate("/")}
                  className="flex w-full items-center gap-4 rounded-[24px] bg-slate-50 px-4 py-5 text-left ring-1 ring-slate-100 transition hover:bg-white"
                >
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0F766E] ring-1 ring-slate-100">
                    <Icon icon="solar:add-circle-bold" className="h-7 w-7" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-extrabold text-slate-800">
                      아직 이용중인 파티가 없습니다
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-400">
                      새로운 구독 파티를 시작해보세요
                    </p>
                  </div>

                  <Icon
                    icon="solar:alt-arrow-right-linear"
                    className="h-6 w-6 text-slate-300"
                  />
                </button>
              </div>
            )}
          </div>
        </section>

        {!isLoading && scheduledParties.length > 0 && (
          <section className="mt-8">
            <div>
              <p className="text-[13px] font-extrabold text-amber-600">
                이용 예정
              </p>
              <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-slate-950">
                다음 결제일부터 참여할 파티
              </h2>
            </div>

            <div className="mt-4 overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-amber-100">
              <div className="divide-y divide-slate-100">
                {scheduledParties.map((party) => (
                  <PartyListItem
                    key={party.partyId}
                    party={party}
                    usagePeriod={usagePeriods[party.partyId]}
                    onClick={() => handleGoDetail(party)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {!isLoading && endedParties.length > 0 && (
          <section className="mt-8">
            <div>
              <p className="text-[13px] font-extrabold text-slate-400">
                종료된 파티
              </p>
              <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-slate-950">
                지난 이용 내역
              </h2>
            </div>

            <div className="mt-4 overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
              <div className="divide-y divide-slate-100">
                {endedParties.map((party) => (
                  <PartyListItem
                    key={party.partyId}
                    party={party}
                    usagePeriod={usagePeriods[party.partyId]}
                    onClick={() => handleGoDetail(party)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {visibleJoinRequests.length > 0 && (
          <section className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[13px] font-extrabold text-[#0F766E]">
                  자동 매칭
                </p>
                <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-slate-950">
                  신청 현황
                </h2>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                <Icon icon="solar:clock-circle-bold" className="h-4 w-4" />
                {visibleJoinRequests.length}건
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
              {visibleJoinRequests.map((request) => (
                <article
                  key={request.joinRequestId}
                  className="border-b border-slate-100 px-5 py-5 last:border-b-0"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 text-[#0F766E] ring-1 ring-slate-100">
                        {request.thumbnailUrl ? (
                          <img
                            src={request.thumbnailUrl}
                            alt={request.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Icon
                            icon={getProductIcon(request.productName)}
                            className="h-7 w-7"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getJoinStatusStyle(
                              request.joinStatus,
                            )}`}
                          >
                            {request.statusLabel || request.joinStatus}
                          </span>
                        </div>

                        <h3 className="mt-2 truncate text-lg font-extrabold text-slate-900">
                          {request.productName || "상품명 없음"}
                        </h3>

                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                          {request.statusMessage ||
                            "자동 매칭 상태를 확인 중입니다."}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-100">
                            <Icon
                              icon="solar:calendar-linear"
                              className="h-5 w-5"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-400">
                              신청일
                            </p>
                            <p className="mt-1 text-sm font-extrabold text-slate-800">
                              {formatDate(request.requestedAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-teal-50 px-3 py-3 ring-1 ring-teal-100">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0F766E] ring-1 ring-[#D9FBEF]">
                            <Icon
                              icon="solar:wallet-money-bold"
                              className="h-5 w-5"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-[#0F766E]">
                              예상 결제
                            </p>
                            <p className="mt-1 text-sm font-extrabold text-[#0F766E]">
                              {formatPrice(request.expectedPaymentAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(request.partyId &&
                      normalizeJoinStatus(request.joinStatus) === "MATCHED") ||
                    canShowCancelJoinRequest(request.joinStatus) ? (
                      <div
                        className={`grid gap-2 ${
                          request.partyId &&
                          normalizeJoinStatus(request.joinStatus) ===
                            "MATCHED" &&
                          canShowCancelJoinRequest(request.joinStatus)
                            ? "grid-cols-2"
                            : "grid-cols-1"
                        }`}
                      >
                        {request.partyId &&
                          normalizeJoinStatus(request.joinStatus) ===
                            "MATCHED" && (
                            <button
                              type="button"
                              onClick={() => handleGoJoinRequestParty(request)}
                              className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#14B8A6] px-3 text-sm font-bold text-white shadow-sm shadow-teal-900/15 transition hover:bg-[#0D9488]"
                            >
                              상세 보기
                              <Icon
                                icon="solar:alt-arrow-right-linear"
                                className="h-5 w-5"
                              />
                            </button>
                          )}

                        {canShowCancelJoinRequest(request.joinStatus) && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(request)}
                            className="flex h-11 items-center justify-center gap-2 rounded-full bg-white px-3 text-sm font-bold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-50"
                          >
                            <Icon
                              icon="solar:close-circle-bold"
                              className="h-5 w-5"
                            />
                            매칭 취소
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {cancelTarget && (
        <CancelJoinRequestModal
          productName={cancelTarget.productName}
          isSubmitting={isCanceling}
          onClose={() => {
            if (!isCanceling) {
              setCancelTarget(null);
            }
          }}
          onConfirm={handleCancelJoinRequest}
        />
      )}
    </div>
  );
}

function CancelJoinRequestModal({
  productName,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  productName: string;
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
        aria-labelledby="cancel-join-request-title"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <Icon icon="solar:close-circle-bold" className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="cancel-join-request-title"
              className="text-lg font-semibold text-slate-950"
            >
              자동 매칭 신청을 취소할까요?
            </h2>
            <p className="mt-2 text-sm font-normal leading-6 text-slate-500">
              {productName || "선택한 상품"} 자동 매칭 대기 신청이 취소되며,
              취소 후에는 대기열로 복구할 수 없습니다.
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
            닫기
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
                  : "solar:close-circle-bold"
              }
              className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`}
            />
            {isSubmitting ? "취소 중..." : "신청 취소"}
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryCount({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <div className="rounded-[18px] bg-white px-3 py-3 text-center ring-1 ring-slate-100">
      <p className="text-[11px] font-extrabold text-slate-400">{label}</p>
      <p className={`mt-1 text-[24px] font-extrabold ${className}`}>
        {count}
        <span className="ml-0.5 text-[12px] font-bold text-slate-400">개</span>
      </p>
    </div>
  );
}

function PartyListItem({
  party,
  usagePeriod,
  onClick,
}: {
  party: PartyHistoryItem;
  usagePeriod?: PartyUsagePeriodResponse;
  onClick: () => void;
}) {
  const roleStyle = getRoleStyle(party.role);

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
    >
      <div
        className={[
          "relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ring-1",
          roleStyle.iconBg,
        ].join(" ")}
      >
        <Icon icon={getProductIcon(party.productName)} className="h-7 w-7" />

        {party.role === "HOST" && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-main text-white ring-2 ring-white">
            <Icon icon="solar:crown-bold" className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="truncate text-base font-extrabold text-slate-800">
            {party.productName}
          </p>

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${getStatusStyle(party.status)}`}
          >
            {getStatusLabel(party.status)}
          </span>
        </div>

        <p
          className={[
            "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1",
            roleStyle.badge,
          ].join(" ")}
        >
          {getRoleLabel(party.role)}
        </p>

        {party.status === "USING" && usagePeriod && (
          <p className="mt-2 text-xs font-bold text-[#0F766E]">
            {formatUsageDayCount(usagePeriod.currentStartDate)}
          </p>
        )}

        {party.status === "SCHEDULED" && (
          <p className="mt-2 text-xs font-bold text-amber-600">
            {formatScheduledStartText(party.startAt)}
          </p>
        )}
      </div>

      <Icon
        icon="solar:alt-arrow-right-linear"
        className="h-6 w-6 text-slate-300"
      />
    </button>
  );
}
