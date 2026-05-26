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
  return role === "HOST"
    ? `파티장 ${seatCount}자리`
    : `파티원 ${seatCount}자리`;
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
    host:
      role === "HOST"
        ? "파티장 모집 중"
        : item.hostNickname
          ? `파티장 ${item.hostNickname}`
          : "파티장 정보 없음",
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
    recruitRole === "HOST" ? "파티장 자리 모집" : "파티원 자리 모집";

  const pageDescription =
    recruitRole === "HOST"
      ? "파티장 자리가 비어 있는 모집을 서비스별로 확인할 수 있습니다."
      : "파티원 자리가 비어 있는 모집을 서비스별로 확인할 수 있습니다.";

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
      slug === "watcha" ||
      slug === "apple-tv" ||
      slug === "wavve" ||
      slug === "laftel"
    );
  };

  const getFilterPath = (category: PartyCategory) => {
    const basePath =
      recruitRole === "HOST" ? "/parties/hosts" : "/parties/members";

    return category === "ALL"
      ? basePath
      : `${basePath}?category=${encodeURIComponent(category)}`;
  };

  const pageTitle =
    selectedCategory === "ALL"
      ? recruitRole === "HOST"
        ? "파티장을 찾고 있는 파티"
        : "지금 참여 가능한 파티"
      : recruitRole === "HOST"
        ? `${categoryLabels[selectedCategory]} 파티장 자리`
        : `${categoryLabels[selectedCategory]} 파티원 자리`;

  const totalSeatCount = filteredParties.reduce((total, party) => {
    return total + Math.max(party.maxMembers - party.currentMembers, 0);
  }, 0);

  const roleSwitchPath = isMember ? "/parties/hosts" : "/parties/members";
  const roleSwitchLabel = isMember ? "파티장 자리 보기" : "파티원 자리 보기";

  return (
    <div className="min-h-full bg-[#F8FAFC]">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-8">
          <div
            className={[
              "overflow-hidden rounded-[32px] border bg-white px-5 py-6 shadow-xl sm:px-7 sm:py-8 lg:px-10",
              isMember
                ? "border-[#A9E6C9] shadow-emerald-900/5"
                : "border-blue-100 shadow-blue-900/5",
            ].join(" ")}
          >
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",
                    isMember
                      ? "bg-[#EAF8F1] text-[#00875A]"
                      : "bg-blue-50 text-brand-main",
                  ].join(" ")}
                >
                  <Icon
                    icon="solar:users-group-rounded-bold"
                    className="h-4 w-4"
                  />
                  {pageBadge}
                </div>

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                  {pageTitle}
                </h1>

                <p className="mt-3 text-base leading-7 text-slate-500">
                  {pageDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:min-w-[260px] lg:border-t-0 lg:pt-0">
                <div>
                  <p className="text-[11px] font-bold text-slate-400">
                    모집 파티
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {filteredParties.length}
                    <span className="text-sm font-bold text-slate-400">개</span>
                  </p>
                </div>

                <div className="border-l border-slate-100 pl-4">
                  <p className="text-[11px] font-bold text-slate-400">
                    남은 자리
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {totalSeatCount}
                    <span className="text-sm font-bold text-slate-400">석</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="no-scrollbar -mx-1 -my-1.5 overflow-x-auto px-1 py-1.5">
                <div className="flex min-w-max gap-2">
                  {categoryFilterList.map((category) => {
                    const isSelected = selectedCategory === category;

                    return (
                      <Link
                        key={category}
                        to={getFilterPath(category)}
                        className={[
                          "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-bold transition",
                          isSelected
                            ? isMember
                              ? "bg-[#00A86B] text-white shadow-lg shadow-emerald-900/15"
                              : "bg-brand-main text-white shadow-lg shadow-blue-900/15"
                            : isMember
                              ? "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-white hover:text-[#00875A]"
                              : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-white hover:text-brand-main",
                        ].join(" ")}
                      >
                        {categoryLabels[category]}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link
                to={roleSwitchPath}
                className={[
                  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border bg-white px-5 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-md",
                  isMember
                    ? "border-blue-100 text-brand-main hover:bg-blue-50"
                    : "border-[#A9E6C9] text-[#00875A] hover:bg-[#EAF8F1]",
                ].join(" ")}
              >
                {roleSwitchLabel}
                <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredParties.map((party) => {
              const ottMeta = getOttMeta(party.ott);

              return (
                <article
                  key={party.id}
                  className={[
                    "group overflow-hidden rounded-[28px] border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl sm:p-5",
                    isMember
                      ? "border-[#A9E6C9] shadow-emerald-900/5 hover:border-[#00A86B] hover:shadow-emerald-900/10"
                      : "border-blue-100 shadow-blue-900/5 hover:border-brand-sub hover:shadow-blue-900/10",
                  ].join(" ")}
                >
                  <div className="flex h-full flex-col">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                              ottMeta.chipClassName ??
                              "bg-slate-50 text-slate-700 ring-slate-200"
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
                                  className={
                                    ottMeta.imageClassName ??
                                    "h-3.5 w-3.5 object-contain"
                                  }
                                />
                              </span>
                            )}
                            {party.ott}
                          </span>

                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
                              isMember
                                ? "bg-[#EAF8F1] text-[#00875A] ring-[#A9E6C9]"
                                : "bg-blue-50 text-brand-main ring-blue-100",
                            ].join(" ")}
                          >
                            {party.status}
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-bold leading-snug text-slate-950 sm:text-xl">
                          {party.title}
                        </h3>

                        <p className="mt-1.5 text-sm font-medium text-slate-500">
                          {party.host}
                        </p>
                      </div>

                      <Link
                        to={`/parties/${
                          party.recruitRole === "HOST" ? "hosts" : "members"
                        }/${party.id}`}
                        className={[
                          "inline-flex h-11 shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold text-white shadow-md transition group-hover:scale-[1.02]",
                          isMember
                            ? "bg-[#00A86B] shadow-emerald-900/20 hover:bg-[#00875A]"
                            : "bg-brand-main shadow-blue-900/20 hover:bg-blue-800",
                        ].join(" ")}
                      >
                        {actionLabel}
                      </Link>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 rounded-3xl bg-slate-50 p-2">
                      <div className="px-2 py-2">
                        <p className="text-[11px] font-semibold text-slate-400">
                          현재 인원
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-slate-950">
                          {party.currentMembers}/{party.maxMembers}명
                        </p>
                      </div>

                      <div className="border-x border-white px-2 py-2">
                        <p className="text-[11px] font-semibold text-slate-400">
                          정산일
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-slate-950">
                          {party.settlementDate}
                        </p>
                      </div>

                      <div className="px-2 py-2">
                        <p className="text-[11px] font-semibold text-slate-400">
                          금액
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-slate-950">
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
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
              <div
                className={[
                  "mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl",
                  isMember
                    ? "bg-[#EAF8F1] text-[#00875A]"
                    : "bg-slate-50 text-brand-main",
                ].join(" ")}
              >
                <Icon
                  icon="solar:document-text-search-bold"
                  className="h-7 w-7"
                />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-950">
                현재 모집 중인 파티가 없습니다
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                다른 OTT를 선택해서 다시 확인해보세요.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
