import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "@/api/axios";
import { waitingParties } from "@/mocks/ott";
import type { OttSlug, RecruitRole, WaitingParty } from "@/types/ott";
import { getOttMeta } from "@/mocks/ott";

type PartyCategory =
  | "ALL"
  | "NETFLIX"
  | "TVING"
  | "WATCHA"
  | "DISNEY_PLUS"
  | "APPLE_TV"
  | "WAVVE"
  | "LAFTEL";

type PartyVacancyItem = {
  partyId: number;
  productId: string;
  productName: string;
  thumbnailUrl: string;
  totalCapacity: number;
  currentMemberCount: number;
  remainingSeatCount: number;
  monthlyPaymentAmount: number;
  nextPaymentDate: string | null;
  joinButtonLabel: string;
  hostNickname?: string;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

const categoryFilterList: PartyCategory[] = [
  "ALL",
  "NETFLIX",
  "TVING",
  "WATCHA",
  "DISNEY_PLUS",
  "APPLE_TV",
  "WAVVE",
  "LAFTEL",
];

const categoryLabels: Record<PartyCategory, string> = {
  ALL: "전체",
  NETFLIX: "넷플릭스",
  TVING: "티빙",
  WATCHA: "왓챠",
  DISNEY_PLUS: "디즈니플러스",
  APPLE_TV: "애플티비",
  WAVVE: "웨이브",
  LAFTEL: "라프텔",
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

function resolveCategoryByName(value: string): PartyCategory | null {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("netflix") || normalized.includes("넷플릭스")) {
    return "NETFLIX";
  }

  if (normalized.includes("tving") || normalized.includes("티빙")) {
    return "TVING";
  }

  if (normalized.includes("watcha") || normalized.includes("왓챠")) {
    return "WATCHA";
  }

  if (
    normalized.includes("disney") ||
    normalized.includes("디즈니") ||
    normalized.includes("디즈니플러스")
  ) {
    return "DISNEY_PLUS";
  }

  if (
    normalized.includes("apple") ||
    normalized.includes("애플") ||
    normalized.includes("애플티비")
  ) {
    return "APPLE_TV";
  }

  if (normalized.includes("wavve") || normalized.includes("웨이브")) {
    return "WAVVE";
  }

  if (normalized.includes("laftel") || normalized.includes("라프텔")) {
    return "LAFTEL";
  }

  return null;
}

function resolveOttByProductName(productName: string): WaitingParty["ott"] {
  const category = resolveCategoryByName(productName);

  if (category === "NETFLIX") return "넷플릭스";
  if (category === "TVING") return "티빙";
  if (category === "WATCHA") return "왓챠";
  if (category === "DISNEY_PLUS") return "디즈니플러스";
  if (category === "APPLE_TV") return "애플티비";
  if (category === "WAVVE") return "웨이브";
  if (category === "LAFTEL") return "라프텔";

  return "유튜브";
}

function formatPaymentAmount(value: number) {
  return `월 ${value.toLocaleString("ko-KR")}원`;
}

function formatSettlementDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate(),
  ).padStart(2, "0")} 정산`;
}

function getVacancyStatus(role: RecruitRole, remainingSeatCount: number) {
  const seatCount = Math.max(remainingSeatCount, 0) || 1;
  return role === "HOST" ? `파티장 ${seatCount}자리` : `파티원 ${seatCount}자리`;
}

function mapVacancyToWaitingParty(
  item: PartyVacancyItem,
  role: RecruitRole,
): WaitingParty {
  return {
    id: item.partyId,
    ott: resolveOttByProductName(item.productName),
    title:
      role === "HOST"
        ? `${item.productName} 파티장 모집`
        : `${item.productName} 파티원 모집`,
    host: role === "HOST" ? "운영 예정 파티" : item.hostNickname || "파티장",
    currentMembers: item.currentMemberCount,
    maxMembers: item.totalCapacity,
    price: formatPaymentAmount(item.monthlyPaymentAmount),
    settlementDate: formatSettlementDate(item.nextPaymentDate),
    status: getVacancyStatus(role, item.remainingSeatCount),
    recruitRole: role,
  };
}

function getPartyCategory(party: WaitingParty): PartyCategory | null {
  return resolveCategoryByName(`${party.ott} ${party.title}`);
}

export default function PartyListPage() {
  const { type } = useParams<{ type: "hosts" | "members" }>();
  const [searchParams] = useSearchParams();
  const [apiParties, setApiParties] = useState<WaitingParty[]>([]);

  const recruitRole: RecruitRole = type === "hosts" ? "HOST" : "MEMBER";
  const isMember = recruitRole === "MEMBER";

  const pageBadge =
    recruitRole === "HOST" ? "파티장 모집 전체 목록" : "파티원 모집 전체 목록";

  const pageDescription =
    recruitRole === "HOST"
      ? "현재 파티장을 찾고 있는 파티를 서비스별로 확인할 수 있습니다."
      : "현재 파티원을 찾고 있는 파티를 서비스별로 확인할 수 있습니다.";

  const actionLabel = recruitRole === "HOST" ? "파티장 참여" : "파티원 참여";

  const categoryParam = searchParams.get("category") as PartyCategory | null;
  const selectedCategory: PartyCategory =
    categoryParam && categoryFilterList.includes(categoryParam)
      ? categoryParam
      : "ALL";

  useEffect(() => {
    let isMounted = true;

    const fetchVacancyParties = async () => {
      try {
        const endpoint =
          recruitRole === "HOST"
            ? "/api/v1/party-vacancy/hosts"
            : "/api/v1/party-vacancy/members";

        const response = await api.get<PartyVacancyItem[]>(endpoint);
        const data = unwrapResponse<PartyVacancyItem[]>(response.data);

        if (!isMounted) return;

        const nextParties = Array.isArray(data)
          ? data.map((item) => mapVacancyToWaitingParty(item, recruitRole))
          : [];

        setApiParties(nextParties);
      } catch (error) {
        if (!isMounted) return;

        console.error("결원 파티 목록 조회 실패", error);
        setApiParties([]);
      }
    };

    void fetchVacancyParties();

    return () => {
      isMounted = false;
    };
  }, [recruitRole]);

  const baseParties = useMemo(() => {
    if (apiParties.length > 0) return apiParties;

    return waitingParties.filter((party) => party.recruitRole === recruitRole);
  }, [apiParties, recruitRole]);

  const filteredParties =
    selectedCategory === "ALL"
      ? baseParties
      : baseParties.filter(
          (party) => getPartyCategory(party) === selectedCategory,
        );

  const shouldUseNestedCircle = (slug: OttSlug) => {
    return (
      slug === "netflix" ||
      slug === "tving" ||
      slug === "disney-plus" ||
      slug === "watcha"
    );
  };

  const getFilterPath = (category: PartyCategory) => {
    const basePath =
      recruitRole === "HOST" ? "/parties/hosts" : "/parties/members";

    return category === "ALL"
      ? basePath
      : `${basePath}?category=${encodeURIComponent(category)}`;
  };

  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div
          className={[
            "rounded-4xl bg-white px-5 py-5 shadow-[0_20px_60px_rgba(30,58,138,0.06)] sm:px-7",
            isMember ? "border border-[#C9F7EA]" : "border border-sky-100",
          ].join(" ")}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  isMember
                    ? "border-[#C9F7EA] bg-[#ECFEF8] text-[#0F766E]"
                    : "border-sky-100 bg-sky-50 text-brand-main",
                ].join(" ")}
              >
                <Icon icon="solar:list-bold" className="h-4 w-4" />
                {pageBadge}
              </div>

              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                {selectedCategory === "ALL"
                  ? recruitRole === "HOST"
                    ? "파티장을 찾고 있는 파티"
                    : "지금 참여 가능한 파티"
                  : recruitRole === "HOST"
                    ? `${categoryLabels[selectedCategory]} 파티장 모집`
                    : `${categoryLabels[selectedCategory]} 참여 가능 파티`}
              </h1>

              <p className="mt-2 text-sm text-slate-500">{pageDescription}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {categoryFilterList.map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <Link
                  key={category}
                  to={getFilterPath(category)}
                  className={[
                    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    isSelected
                      ? isMember
                        ? "bg-[#14B8A6] text-white"
                        : "bg-brand-main text-white"
                      : isMember
                        ? "border border-[#C9F7EA] bg-white text-[#0F766E] hover:bg-[#F7FFFD]"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {categoryLabels[category]}
                </Link>
              );
            })}
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredParties.map((party) => {
            const ottMeta = getOttMeta(party.ott);

            return (
              <article
                key={party.id}
                className={[
                  "overflow-hidden rounded-3xl border bg-white transition-all duration-200",
                  isMember
                    ? "border-[#C9F7EA] hover:border-[#14B8A6] hover:shadow-[0_16px_40px_rgba(20,184,166,0.1)]"
                    : "border-slate-200 hover:border-sky-200 hover:shadow-[0_16px_40px_rgba(30,58,138,0.08)]",
                ].join(" ")}
              >
                <div
                  className={[
                    "h-1",
                    isMember
                      ? "bg-linear-to-r from-[#14B8A6] via-[#2DD4BF] to-[#99F6E4]"
                      : "bg-linear-to-r from-brand-main via-brand-sub to-brand-accent",
                  ].join(" ")}
                />

                <div className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${
                            ottMeta.chipClassName ??
                            "bg-slate-50 text-slate-700 ring-slate-100"
                          }`}
                        >
                          {shouldUseNestedCircle(ottMeta.slug) ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80">
                              <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                                <img
                                  src={ottMeta.image}
                                  alt={party.ott}
                                  className="h-full w-full object-contain"
                                />
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-xl bg-white/80">
                              <img
                                src={ottMeta.image}
                                alt={party.ott}
                                className={ottMeta.imageClassName}
                              />
                            </span>
                          )}
                          {party.ott}
                        </span>

                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ring-1",
                            isMember
                              ? "bg-[#ECFEF8] text-[#0F766E] ring-[#C9F7EA]"
                              : "bg-blue-50 text-brand-main ring-blue-100",
                          ].join(" ")}
                        >
                          {party.status}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {party.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {party.host}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={[
                        "inline-flex h-10 shrink-0 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition-all",
                        isMember
                          ? "bg-[#14B8A6] shadow-[0_8px_20px_rgba(20,184,166,0.18)] hover:bg-[#0D9488]"
                          : "bg-brand-main shadow-[0_8px_20px_rgba(30,58,138,0.18)] hover:bg-blue-700",
                      ].join(" ")}
                    >
                      {actionLabel}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-medium text-slate-400">
                        현재 인원
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {party.currentMembers}/{party.maxMembers}명
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-medium text-slate-400">
                        정산일
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {party.settlementDate}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-medium text-slate-400">
                        금액
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {party.price}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {filteredParties.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
            <div
              className={[
                "mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl",
                isMember
                  ? "bg-[#ECFEF8] text-[#0F766E]"
                  : "bg-slate-50 text-brand-main",
              ].join(" ")}
            >
              <Icon
                icon="solar:document-text-search-bold"
                className="h-7 w-7"
              />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              현재 모집 중인 파티가 없습니다
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              다른 OTT를 선택해서 다시 확인해보세요.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
