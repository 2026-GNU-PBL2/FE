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

const homeBanners = [
  {
    id: "1",
    image: "/images/banners/banner.png",
    mobileImage: "/images/banners/banner_mobile.png",
    alt: "Submate 배너 1",
    to: "/",
  },
  {
    id: "2",
    image: "/images/banners/banner2.png",
    mobileImage: "/images/banners/banner2_mobile.png",
    alt: "Submate 배너 2",
    to: "/",
  },
  {
    id: "3",
    image: "/images/banners/banner3.png",
    mobileImage: "/images/banners/banner3_mobile.png",
    alt: "Submate 배너 3",
    to: "/",
  },
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

function shouldUseNestedCircle(slug: OttSlug) {
  return (
    slug === "netflix" ||
    slug === "tving" ||
    slug === "disney-plus" ||
    slug === "watcha" ||
    slug === "apple-tv" ||
    slug === "wavve" ||
    slug === "laftel"
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

  if (
    normalized.includes("watcha") ||
    normalized.includes("왓챠") ||
    normalized.includes("와챠")
  ) {
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

  if (
    normalized.includes("netflix") ||
    normalized.includes("neflix") ||
    normalized.includes("넷플릭스")
  ) {
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
    host:
      role === "HOST"
        ? "파티장 모집 중"
        : item.hostNickname
          ? `파티장 ${item.hostNickname}`
          : "파티장 정보 없음",
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

function getProductLogoFillClassName(slug: OttSlug) {
  if (slug === "watcha") {
    return "h-full w-full scale-105 object-cover";
  }

  if (slug === "apple-tv") {
    return "h-[82%] w-[82%] object-contain";
  }

  if (slug === "netflix" || slug === "wavve") {
    return "h-full w-full scale-125 object-cover";
  }

  return "h-full w-full object-cover";
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
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
          <img
            src={image}
            alt={alt}
            className={getProductLogoFillClassName(slug)}
          />
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
        "group overflow-hidden rounded-[28px] border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-xl sm:p-5",
        isMint
          ? "border-[#A7F3D0] shadow-emerald-900/5 hover:border-[#10B981] hover:shadow-emerald-900/10"
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
                    ? "bg-[#ECFDF5] text-[#047857] ring-[#6EE7B7]"
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
            to={`/parties/${party.recruitRole === "HOST" ? "hosts" : "members"}/${party.id}`}
            className={[
              "inline-flex h-11 shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold text-white shadow-md transition group-hover:scale-[1.02]",
              isMint
                ? "bg-[#10B981] shadow-emerald-900/20 hover:bg-[#059669]"
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
            <p className="text-[11px] font-semibold text-slate-400">정산일</p>
            <p className="mt-1 text-sm font-extrabold text-slate-950">
              {party.settlementDate}
            </p>
          </div>

          <div className="px-2 py-2">
            <p className="text-[11px] font-semibold text-slate-400">금액</p>
            <p className="mt-1 text-sm font-extrabold text-slate-950">
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
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",
              isMint
                ? "bg-[#ECFDF5] text-[#047857]"
                : "bg-blue-50 text-brand-main",
            ].join(" ")}
          >
            <Icon icon="solar:users-group-rounded-bold" className="h-4 w-4" />
            {badge}
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            {description}
          </p>
        </div>

        <Link
          to={viewAllPath}
          className={[
            "inline-flex h-11 items-center justify-center gap-2 rounded-full border bg-white px-5 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-md",
            isMint
              ? "border-[#6EE7B7] text-[#047857] hover:bg-[#ECFDF5]"
              : "border-slate-200 text-slate-700 hover:border-sky-200 hover:bg-slate-50",
          ].join(" ")}
        >
          전체보기
          <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
        <div className="mt-7 rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50">
            <Icon
              icon="solar:document-text-search-bold"
              className={[
                "h-7 w-7",
                isMint ? "text-[#047857]" : "text-brand-main",
              ].join(" ")}
            />
          </div>

          <h3 className="mt-4 text-base font-bold text-slate-950">
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
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [failedBannerImages, setFailedBannerImages] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);

        const response = await api.get<ProductListItem[]>("/api/v1/products");

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
    if (homeBanners.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveBannerIndex((current) => (current + 1) % homeBanners.length);
    }, 4500);

    return () => window.clearInterval(timer);
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
      <section className="bg-brand-bg px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-7 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="group relative overflow-hidden rounded-[24px] bg-blue-50 shadow-xl shadow-blue-900/8 ring-1 ring-blue-100 sm:rounded-[32px]">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${activeBannerIndex * 100}%)`,
              }}
            >
              {homeBanners.map((banner) => (
                <Link
                  key={banner.id}
                  to={banner.to}
                  className="block min-w-0 basis-full flex-none"
                  aria-label={banner.alt}
                >
                  {banner.image && !failedBannerImages[banner.id] ? (
                    <picture>
                      <source
                        media="(max-width: 639px)"
                        srcSet={banner.mobileImage}
                      />
                      <img
                        src={banner.image}
                        alt={banner.alt}
                        onError={() =>
                          setFailedBannerImages((current) => ({
                            ...current,
                            [banner.id]: true,
                          }))
                        }
                        className="aspect-square w-full object-cover object-left sm:aspect-[2.9/1] lg:aspect-[3.35/1]"
                      />
                    </picture>
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-base font-extrabold text-slate-400 sm:aspect-[2.9/1] sm:text-xl lg:aspect-[3.35/1]">
                      AD banner
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {homeBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveBannerIndex((current) =>
                      current === 0 ? homeBanners.length - 1 : current - 1,
                    )
                  }
                  className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white sm:left-4 sm:h-10 sm:w-10 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                  aria-label="이전 배너"
                >
                  <Icon
                    icon="solar:alt-arrow-left-linear"
                    className="h-5 w-5"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveBannerIndex(
                      (current) => (current + 1) % homeBanners.length,
                    )
                  }
                  className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white sm:right-4 sm:h-10 sm:w-10 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                  aria-label="다음 배너"
                >
                  <Icon
                    icon="solar:alt-arrow-right-linear"
                    className="h-5 w-5"
                  />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/80 px-2 py-1 shadow-sm backdrop-blur">
              {homeBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActiveBannerIndex(index)}
                  className={[
                    "h-1.5 rounded-full transition",
                    activeBannerIndex === index
                      ? "w-5 bg-brand-main"
                      : "w-1.5 bg-slate-300",
                  ].join(" ")}
                  aria-label={`${index + 1}번째 배너 보기`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              구독할 서비스를 선택하세요
            </h2>
            <p className="mt-2 text-base leading-7 text-slate-500">
              원하는 OTT를 고르면 파티 만들기와 참여를 바로 시작할 수 있어요.
            </p>
          </div>

          {selectedProduct && (
            <Link
              to={getProductCreatePath(selectedProduct)}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-main px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              {selectedProduct.serviceName} 시작하기
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="no-scrollbar -mx-4 -my-2 mt-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex min-w-max gap-3">
            {products.map((product) => {
              const isSelected = selectedProduct?.id === product.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProductId(product.id)}
                  className={[
                    "h-44 w-44 shrink-0 rounded-[28px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-xl",
                    isSelected
                      ? "border-brand-main bg-white shadow-xl shadow-blue-900/10"
                      : "border-slate-200 bg-white shadow-sm shadow-slate-900/5 hover:border-sky-200",
                  ].join(" ")}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      {renderProductLogo({
                        image: product.thumbnailUrl,
                        alt: product.serviceName,
                        serviceName: product.serviceName,
                        outerClassName: [
                          "h-12 w-12 shrink-0",
                          isSelected ? "bg-blue-50" : "bg-slate-50",
                        ].join(" "),
                      })}

                      {isSelected && (
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-main">
                          <Icon
                            icon="solar:check-circle-bold"
                            className="h-4 w-4 text-white"
                          />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-base font-extrabold text-slate-950">
                        {product.serviceName}
                      </p>

                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                        {getProductSubtitle(product)}
                      </p>

                      <p className="mt-3 text-sm font-extrabold text-[#047857]">
                        {formatPrice(product.pricePerMember)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {!isLoadingProducts && products.length === 0 && (
              <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-[28px] border border-slate-200 bg-white p-4 text-center shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    상품이 없습니다
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    등록된 상품을 불러오지 못했습니다.
                  </p>
                </div>
              </div>
            )}

            {isLoadingProducts && products.length === 0 && (
              <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-[28px] border border-slate-200 bg-white p-4 text-center shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    상품 불러오는 중
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    잠시만 기다려주세요.
                  </p>
                </div>
              </div>
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

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[32px] bg-white px-5 py-6 shadow-xl shadow-slate-900/5 sm:px-7 sm:py-8 lg:px-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-main">
            <Icon icon="solar:calendar-bold" className="h-4 w-4" />월 이용권
            기반 운영 방식
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Submate는 이렇게 운영됩니다
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-base font-extrabold text-slate-950">
                결제일 기준 1개월 이용
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                오늘 결제하면 다음 결제일 전날까지 이용할 수 있는 월 이용권
                방식입니다.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-base font-extrabold text-slate-950">
                해지해도 남은 기간 사용
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                다음 달에는 이용하지 않더라도 이미 결제한 기간은 끝까지 사용할
                수 있습니다.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-base font-extrabold text-slate-950">
                빈자리는 새 인원으로 모집
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                파티장 또는 파티원이 빠지면 빈자리를 새로운 모집으로 채워 파티를
                계속 운영합니다.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/about"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              서비스 소개 자세히 보기
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
