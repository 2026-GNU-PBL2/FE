import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

function getOperationTypeLabel(operationType: ProductOperationType) {
  const labels: Record<string, string> = {
    INVITE_CODE: "초대 코드",
    ACCOUNT_SHARE: "계정 공유",
  };

  return labels[operationType] ?? operationType;
}

function getOperationTypeClassName(operationType: ProductOperationType) {
  if (operationType === "INVITE_CODE") {
    return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100";
  }

  if (operationType === "ACCOUNT_SHARE") {
    return "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100";
  }

  return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
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
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100";
  }

  if (status === "INACTIVE") {
    return "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200";
  }

  if (status === "ENDED") {
    return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100";
  }

  return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
}

export default function AdminProductListPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const totalCount = products.length;

  const activeCount = useMemo(
    () => products.filter((product) => product.status === "ACTIVE").length,
    [products],
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await api.get("/api/v1/admin/products");
        const productList = unwrapResponse<AdminProduct[]>(response.data);

        setProducts(Array.isArray(productList) ? productList : []);
      } catch (error) {
        console.error(error);
        setErrorMessage("상품 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            총 {totalCount}개의 상품이 등록되어 있고, {activeCount}개가 운영
            중입니다.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-800 sm:w-auto"
        >
          <Icon icon="solar:add-circle-bold-duotone" className="h-5 w-5" />
          상품 등록
        </Link>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        {isLoading ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
            상품 목록을 불러오는 중입니다.
          </div>
        ) : errorMessage ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-3 text-center">
            <Icon
              icon="solar:danger-circle-bold-duotone"
              className="h-10 w-10 text-rose-500"
            />
            <p className="text-sm font-medium text-slate-700">{errorMessage}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-3 text-center">
            <Icon
              icon="solar:box-minimalistic-bold-duotone"
              className="h-10 w-10 text-slate-400"
            />
            <p className="text-sm font-medium text-slate-700">
              등록된 상품이 없습니다.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1440px]">
              <div className="grid grid-cols-[2.6fr_1.1fr_1fr_1fr_1fr_1fr_1fr_1.2fr_1.2fr_0.8fr] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                <span>서비스명</span>
                <span>카테고리</span>
                <span>운영 방식</span>
                <span>기본 요금</span>
                <span>1인 금액</span>
                <span>최대 인원</span>
                <span>상태</span>
                <span>생성일</span>
                <span>수정일</span>
                <span>상세</span>
              </div>

              {products.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[2.6fr_1.1fr_1fr_1fr_1fr_1fr_1fr_1.2fr_1.2fr_0.8fr] gap-4 border-b border-slate-100 px-6 py-5 text-sm last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        {product.thumbnailUrl ? (
                          <img
                            src={product.thumbnailUrl}
                            alt={product.serviceName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-900 via-blue-700 to-cyan-400 text-sm font-semibold text-white">
                            {product.serviceName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {product.serviceName}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {product.description || product.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="font-medium text-slate-700">
                    {product.category}
                  </div>

                  <div>
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        getOperationTypeClassName(product.operationType),
                      ].join(" ")}
                    >
                      {getOperationTypeLabel(product.operationType)}
                    </span>
                  </div>

                  <div className="font-medium text-slate-700">
                    {formatCurrency(product.basePrice)}원
                  </div>

                  <div className="font-medium text-slate-700">
                    {formatCurrency(product.pricePerMember)}원
                  </div>

                  <div className="text-slate-600">
                    {product.maxMemberCount}명
                  </div>

                  <div>
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        getStatusClassName(product.status),
                      ].join(" ")}
                    >
                      {getStatusLabel(product.status)}
                    </span>
                  </div>

                  <div className="text-slate-600">
                    {formatDateTime(product.createdAt)}
                  </div>

                  <div className="text-slate-600">
                    {formatDateTime(product.updatedAt)}
                  </div>

                  <div>
                    <Link
                      to={`/admin/products/${product.id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      보기
                      <Icon
                        icon="solar:alt-arrow-right-linear"
                        className="h-4 w-4"
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
