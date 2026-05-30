// src/pages/party/PartyCreatePage.tsx

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/axios";
import { getOttServicePlans, type OttServicePlan } from "@/api/concurrent";
import type { OttSlug } from "@/types/ott";
import type { ProductCategory } from "@/types/product";

type ProductDetailResponse = {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  operationType: string;
  category: ProductCategory;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function resolveServiceSlug(serviceName: string): OttSlug | null {
  const normalized = serviceName.trim().toLowerCase();

  if (normalized.includes("youtube") || normalized.includes("유튜브")) {
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

function resolveOttSlugByCategory(
  category?: ProductCategory | null,
): OttSlug | null {
  const normalizedCategory = String(category ?? "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");

  if (normalizedCategory === "NETFLIX") return "netflix";
  if (normalizedCategory === "TVING") return "tving";
  if (normalizedCategory === "WATCHA") return "watcha";
  if (
    normalizedCategory === "DISNEY_PLUS" ||
    normalizedCategory === "DISNEYPLUS"
  ) {
    return "disney-plus";
  }
  if (normalizedCategory === "APPLE_TV" || normalizedCategory === "APPLETV") {
    return "apple-tv";
  }
  if (normalizedCategory === "WAVVE" || normalizedCategory === "WAVE") {
    return "wavve";
  }
  if (normalizedCategory === "LAFTEL") return "laftel";

  return null;
}

function shouldUseNestedCircle(slug: OttSlug | null) {
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

function getImageClassName(slug: OttSlug | null) {
  if (slug === "disney-plus") {
    return "h-5 w-8 object-contain";
  }

  return "h-6 w-6 object-contain";
}

function getLogoFillClassName(slug: OttSlug) {
  if (slug === "watcha") {
    return "h-full w-full scale-105 object-cover";
  }

  if (slug === "apple-tv") {
    return "h-full w-full scale-125 object-cover";
  }

  if (slug === "netflix") {
    return "h-full w-full scale-125 object-cover";
  }

  if (slug === "wavve") {
    return "h-full w-full object-cover";
  }

  return "h-full w-full object-cover";
}

function ProductLogo({
  image,
  category,
  serviceName,
}: {
  image: string;
  category?: ProductCategory | null;
  serviceName: string;
}) {
  const slug =
    resolveOttSlugByCategory(category) ?? resolveServiceSlug(serviceName);

  if (shouldUseNestedCircle(slug) && slug) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100 sm:h-20 sm:w-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 sm:h-16 sm:w-16">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            <img
              src={image}
              alt={serviceName}
              className={getLogoFillClassName(slug)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100 sm:h-20 sm:w-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white sm:h-14 sm:w-14">
        <img
          src={image}
          alt={serviceName}
          className={getImageClassName(slug)}
        />
      </div>
    </div>
  );
}

function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function getSummaryText(product: ProductDetailResponse) {
  if (product.description?.trim()) {
    return product.description;
  }

  return `${product.maxMemberCount}인 파티`;
}

function getOperationTypeLabel(operationType: string | null | undefined) {
  const normalized = operationType?.trim().toUpperCase() ?? "";

  if (normalized === "INVITE_CODE") return "초대코드형";
  if (normalized === "ACCOUNT_SHARE") return "계정공유형";

  return operationType?.trim() || "-";
}

export default function PartyCreatePage() {
  const { productId = "" } = useParams();

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [ottPlans, setOttPlans] = useState<OttServicePlan[]>([]);
  const [selectedPlanKey, setSelectedPlanKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const handleNext = () => {
    if (!productId) return;
    navigate(`/party/create/${productId}/role`);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!productId) {
        if (isMounted) {
          setProduct(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);

        const response = await api.get<
          ProductDetailResponse | ProductDetailResponse[]
        >(`/api/v1/products/${productId}`);

        if (!isMounted) return;

        const data = response.data;
        const resolvedProduct = Array.isArray(data) ? (data[0] ?? null) : data;

        setProduct(resolvedProduct ?? null);
      } catch (error) {
        if (!isMounted) return;
        console.error("상품 단건 조회 실패", error);
        setProduct(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setOttPlans(await getOttServicePlans());
      } catch (error) {
        console.error("OTT 플랜 조회 실패", error);
        setOttPlans([]);
      }
    };

    fetchPlans();
  }, []);

  const originalPrice = useMemo(() => {
    if (!product) return "0원";
    return formatPrice(product.basePrice);
  }, [product]);

  const finalPrice = useMemo(() => {
    if (!product) return "0원";
    return formatPrice(product.pricePerMember);
  }, [product]);

  const splitPrice = useMemo(() => {
    if (!product) return "0원";
    return formatPrice(product.pricePerMember);
  }, [product]);

  const feeText = useMemo(() => {
    if (!product) return "-";
    return `${product.maxMemberCount}인 기준`;
  }, [product]);

  const relatedPlans = useMemo(() => {
    if (!product) return [];
    const productService = product.serviceName.toLowerCase();

    return ottPlans.filter((plan) => {
      const serviceName = (plan.serviceName || plan.ottProviderType || "")
        .toLowerCase()
        .replace(/_/g, "");
      return (
        productService.includes(serviceName) ||
        serviceName.includes(
          (resolveServiceSlug(product.serviceName) ?? "").replace("-", ""),
        )
      );
    });
  }, [ottPlans, product]);

  const selectedPlan = useMemo(() => {
    return (
      relatedPlans.find(
        (plan) =>
          `${plan.serviceName || plan.ottProviderType}-${plan.planName}` ===
          selectedPlanKey,
      ) ??
      relatedPlans[0] ??
      null
    );
  }, [relatedPlans, selectedPlanKey]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Icon
                icon="solar:refresh-bold"
                className="h-7 w-7 animate-spin text-brand-main"
              />
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
              상품 정보를 불러오는 중입니다
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Icon
                icon="solar:danger-circle-bold"
                className="h-7 w-7 text-brand-main"
              />
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
              페이지를 찾을 수 없습니다
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              아직 준비되지 않은 상품이거나 잘못된 경로입니다.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-brand-main px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
            <div className="bg-white p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                  <ProductLogo
                    image={product.thumbnailUrl}
                    category={product.category}
                    serviceName={product.serviceName}
                  />

                  <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                      {product.serviceName}
                    </h1>

                    <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                      {getSummaryText(product)}
                    </p>
                  </div>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-main px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-900/20">
                  <Icon icon="solar:shield-check-bold" className="h-4 w-4" />
                  안전한 파티 시작
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="rounded-[28px] bg-slate-50 p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      월 결제 금액
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                        {finalPrice}
                      </span>
                      <span className="pb-1.5 text-sm font-bold text-slate-400">
                        / 월
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-400 line-through">
                      {originalPrice}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-bold text-[#00875A] ring-1 ring-[#A9E6C9]">
                      {product.maxMemberCount}인 분담
                    </span>
                    <span className="font-semibold text-slate-500">
                      {feeText}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <article className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-900/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-brand-main">
                    <Icon icon="solar:wallet-money-linear" className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-500">정가</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {originalPrice}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-900/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#00875A]">
                    <Icon
                      icon="solar:users-group-rounded-linear"
                      className="h-5 w-5"
                    />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-500">
                    1인 분담금
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {splitPrice}
                  </p>
                </article>

                <article className="rounded-[24px] border border-blue-100 bg-blue-50 p-5 shadow-sm shadow-blue-900/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-main">
                    <Icon icon="solar:ticket-linear" className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-500">
                    최종 금액
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-brand-main">
                    {finalPrice}
                  </p>
                </article>
              </div>
            </div>
          </section>

          <aside className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-900/6 ring-1 ring-slate-100 lg:sticky lg:top-8">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
              핵심 정보
            </h2>

            <div className="mt-5 divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <p className="text-sm font-bold text-slate-500">이용 상품</p>
                <p className="min-w-0 truncate text-right text-base font-extrabold text-slate-950">
                  {product.serviceName}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 py-4">
                <p className="text-sm font-bold text-slate-500">파티 인원</p>
                <p className="text-right text-base font-extrabold text-slate-950">
                  {product.maxMemberCount}인 파티
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 py-4">
                <p className="text-sm font-bold text-slate-500">결제 방식</p>
                <p className="text-right text-base font-extrabold text-slate-950">
                  월 이용권 결제
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 py-4">
                <p className="text-sm font-bold text-slate-500">운영 방식</p>
                <p className="text-right text-base font-extrabold text-slate-950">
                  {getOperationTypeLabel(product.operationType)}
                </p>
              </div>
            </div>

            {relatedPlans.length > 0 && (
              <div className="mt-5 rounded-[24px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    서비스 플랜
                  </span>
                  <select
                    value={
                      selectedPlan
                        ? `${selectedPlan.serviceName || selectedPlan.ottProviderType}-${selectedPlan.planName}`
                        : ""
                    }
                    onChange={(event) => setSelectedPlanKey(event.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl bg-white px-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-100"
                  >
                    {relatedPlans.map((plan) => {
                      const key = `${plan.serviceName || plan.ottProviderType}-${plan.planName}`;
                      return (
                        <option key={key} value={key}>
                          {plan.planName}
                        </option>
                      );
                    })}
                  </select>
                </label>

                {selectedPlan && (
                  <div className="mt-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                    <p className="text-xs font-bold text-slate-400">
                      동시접속 한도
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-brand-main">
                      동시 {selectedPlan.concurrentLimit}대
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-main px-6 text-base font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
              onClick={handleNext}
            >
              다음
              <Icon icon="solar:arrow-right-linear" className="h-5 w-5" />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
