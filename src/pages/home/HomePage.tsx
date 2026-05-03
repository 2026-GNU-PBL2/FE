import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/axios";
import {
  hostPreviewParties,
  memberPreviewParties,
  getOttMeta,
  getPartyRecruitListPath,
} from "@/mocks/ott";
import type { OttSlug, WaitingParty } from "@/types/ott";
import type { ProductListItem } from "@/types/product";
import { useAuthStore } from "@/stores/authStore";

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

function shouldUseNestedCircle(slug: OttSlug) {
  return (
    slug === "netflix" ||
    slug === "tving" ||
    slug === "disney-plus" ||
    slug === "watcha"
  );
}

function resolveOttSlugByServiceName(serviceName: string): OttSlug | null {
  const normalized = serviceName.trim().toLowerCase();

  if (
    normalized.includes("youtube") ||
    normalized.includes("유튜브") ||
    normalized.includes("youtube premium")
  ) {
    return "youtube";
  }

  if (normalized.includes("watcha") || normalized.includes("왓챠")) {
    return "watcha";
  }

  if (
    normalized.includes("apple") ||
    normalized.includes("애플") ||
    normalized.includes("apple tv") ||
    normalized.includes("apple-tv") ||
    normalized.includes("애플티비")
  ) {
    return "apple-tv";
  }

  if (normalized.includes("netflix") || normalized.includes("넷플릭스")) {
    return "netflix";
  }

  if (normalized.includes("tving") || normalized.includes("티빙")) {
    return "tving";
  }

  if (
    normalized.includes("disney") ||
    normalized.includes("디즈니") ||
    normalized.includes("disney plus") ||
    normalized.includes("disney-plus") ||
    normalized.includes("디즈니플러스")
  ) {
    return "disney-plus";
  }

  if (normalized.includes("wavve") || normalized.includes("웨이브")) {
    return "wavve";
  }

  if (normalized.includes("laftel") || normalized.includes("라프텔")) {
    return "laftel";
  }

  return null;
}

function resolveOttNameByServiceName(serviceName: string): WaitingParty["ott"] {
  const slug = resolveOttSlugByServiceName(serviceName);

  if (slug === "youtube") return "유튜브";
  if (slug === "watcha") return "왓챠";
  if (slug === "apple-tv") return "애플티비";
  if (slug === "netflix") return "넷플릭스";
  if (slug === "tving") return "티빙";
  if (slug === "disney-plus") return "디즈니플러스";
  if (slug === "wavve") return "웨이브";
  if (slug === "laftel") return "라프텔";

  return "유튜브";
}

function formatPrice(price: number) {
  return `월 ${price.toLocaleString("ko-KR")}원`;
}

function formatVacancyPaymentAmount(value: number) {
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

function getVacancyStatus(role: "HOST" | "MEMBER", remainingSeatCount: number) {
  const seatCount = Math.max(remainingSeatCount, 0);

  if (role === "HOST") {
    return `파티장 ${seatCount || 1}자리`;
  }

  return `파티원 ${seatCount || 1}자리`;
}

function mapVacancyToWaitingParty(
  item: PartyVacancyItem,
  role: "HOST" | "MEMBER",
): WaitingParty {
  return {
    id: item.partyId,
    ott: resolveOttNameByServiceName(item.productName),
    title:
      role === "HOST"
        ? `${item.productName} 파티장 모집`
        : `${item.productName} 파티원 모집`,
    host: role === "HOST" ? "운영 예정 파티" : item.hostNickname || "파티장",
    currentMembers: item.currentMemberCount,
    maxMembers: item.totalCapacity,
    price: formatVacancyPaymentAmount(item.monthlyPaymentAmount),
    settlementDate: formatSettlementDate(item.nextPaymentDate),
    status: getVacancyStatus(role, item.remainingSeatCount),
    recruitRole: role,
  };
}

function getProductSubtitle(product: ProductListItem) {
  const description = product.description?.trim();

  if (description) {
    return description;
  }

  return `${product.maxMemberCount}인 이용 가능`;
}

function getProductImageClassName(serviceName: string) {
  const slug = resolveOttSlugByServiceName(serviceName);

  if (slug === "disney-plus") {
    return "h-5 w-8 object-contain";
  }

  return "h-6 w-6 object-contain";
}

function renderOttLogo({
  image,
  alt,
  slug,
  defaultImageClassName,
  outerClassName,
}: {
  image: string;
  alt: string;
  slug: OttSlug;
  defaultImageClassName: string;
  outerClassName: string;
}) {
  if (shouldUseNestedCircle(slug)) {
    return (
      <div
        className={[
          outerClassName,
          "inline-flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200",
        ].join(" ")}
      >
        <div className="flex h-4/5 w-4/5 items-center justify-center overflow-hidden rounded-full">
          <img src={image} alt={alt} className="h-full w-full object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        outerClassName,
        "inline-flex items-center justify-center rounded-2xl bg-white",
      ].join(" ")}
    >
      <img src={image} alt={alt} className={defaultImageClassName} />
    </div>
  );
}

function renderProductLogo({
  image,
  alt,
  serviceName,
  outerClassName,
}: {
  image: string;
  alt: string;
  serviceName: string;
  outerClassName: string;
}) {
  const slug = resolveOttSlugByServiceName(serviceName);
  const imageClassName = getProductImageClassName(serviceName);

  if (slug) {
    return renderOttLogo({
      image,
      alt,
      slug,
      defaultImageClassName: imageClassName,
      outerClassName,
    });
  }

  return (
    <div
      className={[
        outerClassName,
        "inline-flex items-center justify-center rounded-2xl bg-white",
      ].join(" ")}
    >
      <img src={image} alt={alt} className={imageClassName} />
    </div>
  );
}

function getProductCreatePath(product: ProductListItem) {
  return `/party/create/${product.id}`;
}

function RecruitPartyCard({
  party,
  actionLabel,
  tone = "blue",
}: {
  party: WaitingParty;
  actionLabel: string;
  tone?: "blue" | "mint";
}) {
  const ottMeta = getOttMeta(party.ott);
  const isMint = tone === "mint";

  return (
    <article
      className={[
        "overflow-hidden rounded-3xl border bg-white transition hover:shadow-md",
        isMint
          ? "border-[#C9F7EA] hover:border-[#14B8A6] hover:shadow-teal-900/10"
          : "border-slate-200 hover:border-sky-200 hover:shadow-blue-900/10",
      ].join(" ")}
    >
      <div
        className={[
          "h-1",
          isMint
            ? "bg-linear-to-r from-[#14B8A6] via-[#2DD4BF] to-[#99F6E4]"
            : "bg-linear-to-r from-brand-main via-brand-sub to-brand-accent",
        ].join(" ")}
      />

      <div className="p-4">
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
                        ottMeta.imageClassName ?? "h-3.5 w-3.5 object-contain"
                      }
                    />
                  </span>
                )}
                {party.ott}
              </span>

              <span
                className={[
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
                  isMint
                    ? "bg-[#ECFEF8] text-[#0F766E] ring-[#C9F7EA]"
                    : "bg-blue-50 text-brand-main ring-blue-100",
                ].join(" ")}
              >
                {party.status}
              </span>
            </div>

            <h3 className="mt-3 text-base font-bold text-slate-900 sm:text-lg">
              {party.title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">{party.host}</p>
          </div>

          <button
            type="button"
            className={[
              "inline-flex h-10 shrink-0 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white shadow-md transition",
              isMint
                ? "bg-[#14B8A6] shadow-teal-900/20 hover:bg-[#0D9488]"
                : "bg-brand-main shadow-blue-900/20 hover:bg-blue-800",
            ].join(" ")}
          >
            {actionLabel}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-400">현재 인원</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {party.currentMembers}/{party.maxMembers}명
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-400">정산일</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {party.settlementDate}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-400">금액</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {party.price}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function RecruitSection({
  badge,
  title,
  description,
  viewAllPath,
  parties,
  actionLabel,
  tone = "blue",
}: {
  badge: string;
  title: string;
  description: string;
  viewAllPath: string;
  parties: WaitingParty[];
  actionLabel: string;
  tone?: "blue" | "mint";
}) {
  const isMint = tone === "mint";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-lg shadow-slate-900/5 sm:px-7 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
              isMint
                ? "bg-[#ECFEF8] text-[#0F766E]"
                : "bg-blue-50 text-brand-main",
            ].join(" ")}
          >
            <Icon icon="solar:users-group-rounded-bold" className="h-4 w-4" />
            {badge}
          </div>

          <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <Link
          to={viewAllPath}
          className={[
            "inline-flex h-10 items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-sm font-semibold transition",
            isMint
              ? "border-[#C9F7EA] text-[#0F766E] hover:bg-[#F7FFFD]"
              : "border-slate-200 text-slate-700 hover:border-sky-200 hover:bg-slate-50",
          ].join(" ")}
        >
          전체보기
          <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {parties.map((party) => (
          <RecruitPartyCard
            key={party.id}
            party={party}
            actionLabel={actionLabel}
            tone={tone}
          />
        ))}
      </div>

      {parties.length === 0 && (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
            <Icon
              icon="solar:document-text-search-bold"
              className={[
                "h-7 w-7",
                isMint ? "text-[#0F766E]" : "text-brand-main",
              ].join(" ")}
            />
          </div>

          <h3 className="mt-4 text-base font-bold text-slate-900">
            현재 모집 중인 파티가 없습니다
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            잠시 후 다시 확인해주세요.
          </p>
        </div>
      )}
    </section>
  );
}

console.log(useAuthStore.getState());

export default function HomePage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [hostVacancyParties, setHostVacancyParties] = useState<WaitingParty[]>(
    [],
  );
  const [memberVacancyParties, setMemberVacancyParties] = useState<
    WaitingParty[]
  >([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);

        const response = await api.get<ProductListItem[]>("/api/v1/products");
        console.log(response);

        const nextProducts = Array.isArray(response.data) ? response.data : [];

        if (!isMounted) {
          return;
        }

        setProducts(nextProducts);

        if (nextProducts.length > 0) {
          setSelectedProductId((prev) => prev || nextProducts[0].id);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProducts([]);
        console.error("상품 목록 조회 실패", error);
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchVacancyParties = async () => {
      try {
        const [hostResponse, memberResponse] = await Promise.all([
          api.get<PartyVacancyItem[]>("/api/v1/party-vacancy/hosts"),
          api.get<PartyVacancyItem[]>("/api/v1/party-vacancy/members"),
        ]);

        if (!isMounted) return;

        const hostData = unwrapResponse<PartyVacancyItem[]>(hostResponse.data);
        const memberData = unwrapResponse<PartyVacancyItem[]>(
          memberResponse.data,
        );

        const nextHostParties = Array.isArray(hostData)
          ? hostData
              .slice(0, 2)
              .map((item) => mapVacancyToWaitingParty(item, "HOST"))
          : [];

        const nextMemberParties = Array.isArray(memberData)
          ? memberData
              .slice(0, 2)
              .map((item) => mapVacancyToWaitingParty(item, "MEMBER"))
          : [];

        setHostVacancyParties(nextHostParties);
        setMemberVacancyParties(nextMemberParties);
      } catch (error) {
        if (!isMounted) return;

        console.error("결원 파티 목록 조회 실패", error);
        setHostVacancyParties([]);
        setMemberVacancyParties([]);
      }
    };

    void fetchVacancyParties();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProduct = useMemo(() => {
    return (
      products.find((product) => product.id === selectedProductId) ??
      products[0] ??
      null
    );
  }, [products, selectedProductId]);

  const hostParties =
    hostVacancyParties.length > 0 ? hostVacancyParties : hostPreviewParties;
  const memberParties =
    memberVacancyParties.length > 0
      ? memberVacancyParties
      : memberPreviewParties;

  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5">
          <div className="bg-linear-to-br from-blue-50 via-sky-50 to-teal-50 px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-xs font-semibold text-brand-main">
                  <span className="h-2 w-2 rounded-full bg-brand-accent" />
                  원하는 OTT를 먼저 선택해보세요
                </div>

                <div>
                  <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                    이용할 OTT를 고르고
                    <br />
                    빠르게 시작해보세요
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    파티 생성이나 참여를 빠르게 시작할 수 있어요.
                  </p>
                </div>
              </div>

              <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:-mx-7 sm:px-7 lg:-mx-8 lg:px-8">
                <div className="flex min-w-max gap-3">
                  {products.map((product) => {
                    const isSelected = selectedProduct?.id === product.id;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setSelectedProductId(product.id)}
                        className={[
                          "h-36 w-40 shrink-0 rounded-3xl border p-3 text-left transition",
                          isSelected
                            ? "border-brand-main bg-linear-to-br from-blue-50 to-teal-50 shadow-md shadow-blue-900/10"
                            : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between gap-2">
                            {renderProductLogo({
                              image: product.thumbnailUrl,
                              alt: product.serviceName,
                              serviceName: product.serviceName,
                              outerClassName: [
                                "h-10 w-10 shrink-0",
                                isSelected ? "bg-white" : "bg-slate-50",
                              ].join(" "),
                            })}

                            {isSelected && (
                              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-main">
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="h-3.5 w-3.5 text-white"
                                />
                              </span>
                            )}
                          </div>

                          <div className="mt-2 min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {product.serviceName}
                            </p>

                            <p className="mt-1.5 truncate text-xs leading-4 text-slate-500">
                              {getProductSubtitle(product)}
                            </p>

                            <p className="mt-2.5 text-xs font-semibold text-teal-700">
                              {formatPrice(product.pricePerMember)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {!isLoadingProducts && products.length === 0 && (
                    <div className="flex h-36 w-40 shrink-0 items-center justify-center rounded-3xl border border-slate-200 bg-white p-3 text-center">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          상품이 없습니다
                        </p>
                        <p className="mt-1 text-xs leading-4 text-slate-500">
                          등록된 상품을 불러오지 못했습니다.
                        </p>
                      </div>
                    </div>
                  )}

                  {isLoadingProducts && products.length === 0 && (
                    <div className="flex h-36 w-40 shrink-0 items-center justify-center rounded-3xl border border-slate-200 bg-white p-3 text-center">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          상품 불러오는 중
                        </p>
                        <p className="mt-1 text-xs leading-4 text-slate-500">
                          잠시만 기다려주세요.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedProduct && (
                <Link
                  to={getProductCreatePath(selectedProduct)}
                  className="group rounded-3xl border border-white/70 bg-white/80 px-4 py-3 backdrop-blur-sm transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {renderProductLogo({
                        image: selectedProduct.thumbnailUrl,
                        alt: selectedProduct.serviceName,
                        serviceName: selectedProduct.serviceName,
                        outerClassName: "h-10 w-10 shrink-0",
                      })}

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500">
                          현재 선택한 OTT
                        </p>
                        <p className="truncate text-sm font-bold text-slate-900">
                          {selectedProduct.serviceName}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-main">
                      <span>서비스 시작하기</span>
                      <Icon
                        icon="solar:alt-arrow-right-linear"
                        className="h-5 w-5 transition group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>

        <RecruitSection
          badge="파티장 모집중"
          title="파티장을 찾고 있는 파티"
          description="기존 운영 공백으로 비어 있는 파티장 모집 현황만 모아봤어요."
          viewAllPath={getPartyRecruitListPath("HOST")}
          parties={hostParties}
          actionLabel="파티장 참여"
          tone="blue"
        />

        <RecruitSection
          badge="파티원 모집중"
          title="지금 참여 가능한 파티"
          description="현재 바로 참여할 수 있는 파티원 모집 현황만 모아봤어요."
          viewAllPath={getPartyRecruitListPath("MEMBER")}
          parties={memberParties}
          actionLabel="파티원 참여"
          tone="mint"
        />

        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-lg shadow-slate-900/5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <Icon icon="solar:calendar-bold" className="h-4 w-4" />월 이용권
              기반 운영 방식
            </div>

            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Submate는 이렇게 운영됩니다
            </h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  결제일 기준 1개월 이용
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  오늘 결제하면 다음 결제일 전날까지 이용할 수 있는 월 이용권
                  방식입니다.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  해지해도 남은 기간 사용
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  다음 달에는 이용하지 않더라도 이미 결제한 기간은 끝까지 사용할
                  수 있습니다.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  빈자리는 새 인원으로 모집
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  파티장 또는 파티원이 빠지면 빈자리를 새로운 모집으로 채워
                  파티를 계속 운영합니다.
                </p>
              </div>
            </div>

            <div className="mt-1">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-800"
              >
                서비스 소개 자세히 보기
                <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
