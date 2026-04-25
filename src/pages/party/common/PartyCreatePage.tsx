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

  if (normalized === "INVITE") return "초대형";
  if (normalized === "ACCOUNT_SHARE") return "계정공유형";
  if (normalized === "ACCOUNT_SHARED") return "계정공유형";
  if (normalized === "SHARED_ACCOUNT") return "계정공유형";

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
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Icon
                icon="solar:refresh-bold"
                className="h-7 w-7 text-slate-500"
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
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
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Icon
                icon="solar:danger-circle-bold"
                className="h-7 w-7 text-slate-500"
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              페이지를 찾을 수 없습니다
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              아직 준비되지 않은 상품이거나 잘못된 경로입니다.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-blue-900 px-5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-slate-100">
              {isRounded ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
                    <img
                      src={product.thumbnailUrl}
                      alt={product.serviceName}
                      className="h-full w-full object-contain"
                    />
                  </div>
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
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
                {getBadgeText(product)}
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {product.serviceName}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                {getSummaryText(product)}
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-3xl bg-slate-50 p-5 sm:p-6">
            <p className="text-sm font-semibold text-slate-500">월 결제 금액</p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {finalPrice}
              </span>
              <span className="pb-1 text-sm font-medium text-slate-400">
                / 월
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-400 line-through">
                {originalPrice}
              </span>
              <span className="rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-teal-700">
                {product.maxMemberCount}인 분담
              </span>
              <span className="text-slate-500">{feeText}</span>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Icon icon="solar:wallet-money-linear" className="h-4 w-4" />
              정가
            </div>
            <p className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
              {originalPrice}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Icon
                icon="solar:users-group-rounded-linear"
                className="h-4 w-4"
              />
              1인 분담금
            </div>
            <p className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
              {splitPrice}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Icon icon="solar:ticket-linear" className="h-4 w-4" />
              최종 금액
            </div>
            <p className="mt-3 text-xl font-bold text-blue-900 sm:text-2xl">
              {finalPrice}
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900">핵심 정보</h2>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">이용 상품</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                {product.serviceName}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">파티 인원</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                {product.maxMemberCount}인 파티
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">결제 방식</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                월 이용권 결제
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">운영 방식</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                {getOperationTypeLabel(product.operationType)}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 pb-2">
          <button
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-blue-900 px-6 text-base font-semibold text-white transition hover:bg-blue-800"
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
