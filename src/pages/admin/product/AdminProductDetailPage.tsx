import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
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
  if (status === "ACTIVE") return "bg-[#2DD4BF]/10 text-[#0F766E]";
  if (status === "INACTIVE") return "bg-slate-100 text-slate-500";
  if (status === "ENDED") return "bg-rose-50 text-rose-600";
  return "bg-slate-100 text-slate-600";
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
    <div className="flex justify-between border-b border-slate-100 py-5 last:border-b-0">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_15px_40px_-30px_rgba(15,23,42,0.4)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

export default function AdminProductDetailPage() {
  const navigate = useNavigate();
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
      <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC]">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {/* 헤더 */}
        <section className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="flex gap-5">
            <div className="h-20 w-20 overflow-hidden rounded-[20px] bg-slate-100">
              {product.thumbnailUrl ? (
                <img
                  src={product.thumbnailUrl}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#1E3A8A] text-white font-bold">
                  {product.serviceName.slice(0, 2)}
                </div>
              )}
            </div>

            <div>
              <div className="flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName(
                    product.status,
                  )}`}
                >
                  {getStatusLabel(product.status)}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold text-slate-900">
                {product.serviceName}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {product.description}
              </p>
            </div>
          </div>
        </section>

        {/* 요약 */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard
            label="기본 요금"
            value={`${formatCurrency(product.basePrice)}원`}
          />
          <SummaryCard
            label="1인당"
            value={`${formatCurrency(product.pricePerMember)}원`}
          />
          <SummaryCard
            label="최대 인원"
            value={`${product.maxMemberCount}명`}
          />
          <SummaryCard label="카테고리" value={product.category} />
        </section>

        {/* 상세 */}
        <section className="rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">상세 정보</h2>

          <div className="mt-4">
            <InfoRow
              label="운영 방식"
              value={getOperationTypeLabel(product.operationType)}
            />
            <InfoRow label="생성일" value={formatDateTime(product.createdAt)} />
            <InfoRow label="수정일" value={formatDateTime(product.updatedAt)} />
          </div>
        </section>

        {/* CTA */}
        <div className="flex gap-3 pt-2">
          <Link
            to="/admin/products"
            className="flex-1 h-14 rounded-2xl bg-white text-center text-sm font-bold text-slate-700 ring-1 ring-slate-200 flex items-center justify-center"
          >
            목록으로
          </Link>

          <Link
            to={`/admin/products/${product.id}/edit`}
            className="flex-1 h-14 rounded-2xl bg-[#1E3A8A] text-center text-sm font-bold text-white flex items-center justify-center"
          >
            상품 수정
          </Link>
        </div>
      </div>
    </div>
  );
}
