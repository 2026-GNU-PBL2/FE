import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { useAuthStore } from "@/stores/authStore";
import { getAdultCheckKey } from "./provision/shared/provisionStorage";

type PartyRole = "HOST" | "MEMBER" | string;
type PartyHistoryStatus = "USING" | "ENDED" | string;

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

type PartyMemberProvisionResponse = {
  memberStatus?: string | null;
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
  if (status === "ENDED") return "종료";
  return status;
}

function getStatusStyle(status: PartyHistoryStatus) {
  if (status === "USING") {
    return "bg-[#2DD4BF]/10 text-[#0F766E] ring-[#2DD4BF]/20";
  }

  if (status === "ENDED") {
    return "bg-slate-100 text-slate-500 ring-slate-200";
  }

  return "bg-[#38BDF8]/10 text-[#0369A1] ring-[#38BDF8]/20";
}

function getJoinStatusStyle(status: PartyJoinStatus) {
  if (status === "WAITING") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  if (status === "ACTIVE" || status === "MATCHED") {
    return "bg-[#2DD4BF]/10 text-[#0F766E] ring-[#2DD4BF]/20";
  }

  if (status === "CANCELED") {
    return "bg-slate-100 text-slate-500 ring-slate-200";
  }

  return "bg-[#38BDF8]/10 text-[#0369A1] ring-[#38BDF8]/20";
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
  const [joinRequests, setJoinRequests] = useState<PartyJoinRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const usingParties = useMemo(() => {
    return parties.filter((party) => party.status === "USING");
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
      } catch (error) {
        console.error(error);
        toast.error("내 파티 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartyHistory();
  }, []);

  useEffect(() => {
    const fetchJoinRequests = async () => {
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
    };

    fetchJoinRequests();
  }, []);

  const handleGoDetail = async (party: PartyHistoryItem) => {
    const detailState = {
      productId: party.productId,
      productName: party.productName,
      role: party.role,
    };

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[760px]">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_-55px_rgba(15,23,42,0.35)]">
          <div className="relative px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute right-6 top-6 hidden h-24 w-24 rounded-[32px] bg-[#38BDF8]/10 sm:block" />
            <div className="absolute right-12 top-12 hidden h-14 w-14 rounded-3xl bg-[#2DD4BF]/15 sm:block" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-[#1E3A8A] text-white shadow-[0_16px_35px_-25px_rgba(30,58,138,0.8)]">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="h-8 w-8"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-[#38BDF8]">
                  Submate Party
                </p>

                <h1 className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
                  나의 파티 관리
                </h1>

                <p className="mt-3 max-w-[520px] text-sm leading-6 text-slate-500">
                  이용 중인 공동구독 파티와 종료된 이용 내역을 확인할 수
                  있습니다.
                </p>
              </div>
            </div>

            <div className="relative mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-[#F8FAFC] px-5 py-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold text-slate-400">이용 중</p>
                <p className="mt-1 text-2xl font-extrabold text-[#1E3A8A]">
                  {usingParties.length}
                  <span className="ml-1 text-sm font-bold text-slate-400">
                    개
                  </span>
                </p>
              </div>

              <div className="rounded-3xl bg-[#F8FAFC] px-5 py-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold text-slate-400">종료</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-700">
                  {endedParties.length}
                  <span className="ml-1 text-sm font-bold text-slate-400">
                    개
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div>
            <p className="text-sm font-bold text-slate-400">이용중인 파티</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950">
              현재 이용 중인 구독
            </h2>
          </div>

          <div className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_70px_-55px_rgba(15,23,42,0.35)]">
            {isLoading ? (
              <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                <Icon
                  icon="solar:refresh-circle-bold"
                  className="h-10 w-10 animate-spin text-[#1E3A8A]"
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
                    onClick={() => handleGoDetail(party)}
                  />
                ))}

                <button
                  onClick={() => navigate("/")}
                  className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-[#F8FAFC]"
                >
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#38BDF8]/10 text-[#38BDF8] ring-1 ring-[#38BDF8]/20">
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
                  className="flex w-full items-center gap-4 rounded-3xl bg-[#F8FAFC] px-4 py-5 text-left ring-1 ring-slate-200 transition hover:bg-white"
                >
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white text-[#38BDF8] ring-1 ring-slate-200">
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

        {!isLoading && endedParties.length > 0 && (
          <section className="mt-8">
            <div>
              <p className="text-sm font-bold text-slate-400">종료된 파티</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                지난 이용 내역
              </h2>
            </div>

            <div className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_70px_-55px_rgba(15,23,42,0.35)]">
              <div className="divide-y divide-slate-100">
                {endedParties.map((party) => (
                  <PartyListItem
                    key={party.partyId}
                    party={party}
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
                <p className="text-sm font-bold text-[#38BDF8]">자동 매칭</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                  신청 현황
                </h2>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                <Icon icon="solar:clock-circle-bold" className="h-4 w-4" />
                {visibleJoinRequests.length}건
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_-55px_rgba(15,23,42,0.35)]">
              {visibleJoinRequests.map((request) => (
                <article
                  key={request.joinRequestId}
                  className="border-b border-slate-100 px-5 py-5 last:border-b-0"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-15 w-15 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[#F8FAFC] text-[#1E3A8A] ring-1 ring-slate-200">
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
                      <div className="rounded-2xl bg-[#F8FAFC] px-3 py-3 ring-1 ring-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#38BDF8] ring-1 ring-slate-200">
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

                      <div className="rounded-2xl bg-[#F7FFFD] px-3 py-3 ring-1 ring-[#D9FBEF]">
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

                    {request.partyId && request.joinStatus === "MATCHED" && (
                      <button
                        onClick={() => handleGoJoinRequestParty(request)}
                        className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] px-4 text-sm font-bold text-white transition hover:bg-blue-950"
                      >
                        파티 상세 보기
                        <Icon
                          icon="solar:alt-arrow-right-linear"
                          className="h-5 w-5"
                        />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PartyListItem({
  party,
  onClick,
}: {
  party: PartyHistoryItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-[#F8FAFC]"
    >
      <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#1E3A8A] ring-1 ring-slate-200">
        <Icon icon={getProductIcon(party.productName)} className="h-7 w-7" />

        {party.role === "HOST" && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2DD4BF] text-white ring-2 ring-white">
            <Icon icon="solar:crown-bold" className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-extrabold text-slate-800">
            {party.productName}
          </p>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getStatusStyle(party.status)}`}
          >
            {getStatusLabel(party.status)}
          </span>
        </div>

        <p className="mt-1 text-sm font-semibold text-slate-400">
          {getRoleLabel(party.role)} · {formatDate(party.startAt)} 시작
        </p>
      </div>

      <Icon
        icon="solar:alt-arrow-right-linear"
        className="h-6 w-6 text-slate-300"
      />
    </button>
  );
}
