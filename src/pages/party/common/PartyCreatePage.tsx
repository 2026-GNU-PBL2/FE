// src/pages/party/PartyCreatePage.tsx

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/axios";

type ProductDetailResponse = {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  operationType: string;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function resolveServiceSlug(serviceName: string) {
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

  return "";
}

function shouldUseRoundedLogo(serviceName: string) {
  const slug = resolveServiceSlug(serviceName);

  return (
    slug === "netflix" ||
    slug === "tving" ||
    slug === "disney-plus" ||
    slug === "watcha"
  );
}

function getImageClassName(serviceName: string) {
  const slug = resolveServiceSlug(serviceName);

  if (slug === "disney-plus") {
    return "h-5 w-8 object-contain";
  }

  return "h-10 w-10 object-contain";
}

function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function getBadgeText(product: ProductDetailResponse) {
  const operationType = product.operationType?.trim();

  if (operationType) {
    return operationType;
  }

  return product.serviceName.toUpperCase();
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

  const isRounded = useMemo(() => {
    if (!product) return false;
    return shouldUseRoundedLogo(product.serviceName);
  }, [product]);

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
            <div className="bg-linear-to-br from-blue-50 via-white to-sky-50 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100 sm:h-20 sm:w-20">
                    {isRounded ? (
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white sm:h-16 sm:w-16">
                        <img
                          src={product.thumbnailUrl}
                          alt={product.serviceName}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.serviceName}
                        className={getImageClassName(product.serviceName)}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-main shadow-sm ring-1 ring-blue-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                      {getBadgeText(product)}
                    </div>

                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
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
                    <span className="rounded-full bg-teal-50 px-3 py-1.5 font-bold text-[#0F766E] ring-1 ring-teal-100">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#0F766E]">
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
