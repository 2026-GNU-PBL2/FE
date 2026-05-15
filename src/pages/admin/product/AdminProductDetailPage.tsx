import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { api } from "@/api/axios";

type ProductOperationType = "INVITE_CODE" | "ACCOUNT_SHARE" | string;
type ProductCategory =
  | "NETFLIX"
  | "TVING"
  | "WAVVE"
  | "WATCHA"
  | "DISNEY"
  | string;
type ProductStatus = "ACTIVE" | "INACTIVE" | "ENDED" | string;

type AdminProduct = {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string | null;
  operationType: ProductOperationType;
  category: ProductCategory;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDateTime(value: string) {
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

function getStatusLabel(status: ProductStatus) {
  const labels: Record<string, string> = {
    ACTIVE: "운영 중",
    INACTIVE: "비활성",
    ENDED: "종료",
  };

  return labels[status] ?? status;
}

function getStatusClassName(status: ProductStatus) {
  if (status === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "INACTIVE") {
    return "bg-slate-50 text-slate-600 ring-slate-200";
  }

  if (status === "ENDED") {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }

  return "bg-slate-50 text-slate-600 ring-slate-200";
}

function getOperationTypeLabel(operationType: ProductOperationType) {
  const labels: Record<string, string> = {
    INVITE_CODE: "초대 코드",
    ACCOUNT_SHARE: "계정 공유",
  };

  return labels[operationType] ?? operationType;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
      <p className="shrink-0 text-sm font-bold text-slate-400">{label}</p>
      <p className="min-w-0 break-all text-right text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white px-4 py-5 ring-1 ring-slate-200 sm:rounded-[26px] sm:px-5">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-2 truncate text-xl font-extrabold text-slate-950 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

export default function AdminProductDetailPage() {
  const { id, productId } = useParams();

  const selectedProductId = id ?? productId ?? "";

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(
          `/api/v1/admin/products/${selectedProductId}`,
        );

        setProduct(unwrapResponse<AdminProduct>(res.data));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [selectedProductId]);

  if (isLoading || !product) {
    return (
      <div className="flex min-h-[360px] items-center justify-center px-4">
        <div className="rounded-3xl bg-white px-8 py-7 text-center ring-1 ring-slate-200">
          <Icon
            icon="solar:refresh-circle-bold-duotone"
            className="mx-auto h-10 w-10 animate-spin text-blue-700"
          />
          <p className="mt-4 text-sm font-bold text-slate-600">
            상품 정보를 불러오는 중입니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 sm:space-y-6 sm:px-0">
      <section className="rounded-[28px] bg-white p-5 ring-1 ring-slate-200 sm:rounded-[36px] sm:p-7">
        <div className="flex flex-row items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-[24px] bg-slate-100 ring-1 ring-slate-200 sm:h-22 sm:w-22 sm:rounded-[28px]">
            {product.thumbnailUrl ? (
              <img
                src={product.thumbnailUrl}
                alt={product.serviceName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1E3A8A] text-sm font-bold text-white">
                {product.serviceName.slice(0, 2)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${getStatusClassName(
                  product.status,
                )}`}
              >
                {getStatusLabel(product.status)}
              </span>

              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                {getOperationTypeLabel(product.operationType)}
              </span>
            </div>

            <h2 className="mt-3 truncate text-xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              {product.serviceName}
            </h2>

            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 sm:max-w-3xl">
              {product.description || "등록된 상품 설명이 없습니다."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <SummaryCard
          label="기본 요금"
          value={`${formatCurrency(product.basePrice)}원`}
        />
        <SummaryCard
          label="1인당"
          value={`${formatCurrency(product.pricePerMember)}원`}
        />
        <SummaryCard label="최대 인원" value={`${product.maxMemberCount}명`} />
        <SummaryCard label="카테고리" value={product.category} />
      </section>

      <section className="rounded-[28px] bg-white p-5 ring-1 ring-slate-200 sm:rounded-[32px] sm:p-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">상세 정보</h2>
          <p className="mt-1 text-sm text-slate-500">
            상품 운영에 필요한 기본 설정입니다.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <InfoRow label="상품 ID" value={product.id} />
          <InfoRow
            label="운영 방식"
            value={getOperationTypeLabel(product.operationType)}
          />
          <InfoRow label="생성일" value={formatDateTime(product.createdAt)} />
          <InfoRow label="수정일" value={formatDateTime(product.updatedAt)} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Link
          to="/admin/products"
          className="inline-flex h-14 items-center justify-center rounded-[22px] bg-white text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          목록으로
        </Link>

        <Link
          to={`/admin/products/${product.id}/edit`}
          className="inline-flex h-14 items-center justify-center rounded-[22px] bg-[#1E3A8A] text-sm font-bold text-white transition hover:bg-blue-900"
        >
          상품 수정
        </Link>
      </div>
    </div>
  );
}
