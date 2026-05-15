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
  const inactiveCount = useMemo(
    () => products.filter((product) => product.status === "INACTIVE").length,
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
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 px-5 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
              <Icon icon="solar:box-bold-duotone" className="h-4 w-4" />
              Product Management
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              상품 관리
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              등록된 구독 상품의 운영 상태와 가격 정보를 확인합니다.
            </p>
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800 sm:w-auto"
          >
            <Icon icon="solar:add-circle-bold-duotone" className="h-4 w-4" />
            상품 등록
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 lg:px-6">
          <ProductSummaryCard label="전체 상품" value={totalCount} />
          <ProductSummaryCard label="운영 중" value={activeCount} />
          <ProductSummaryCard label="비활성" value={inactiveCount} />
        </div>
      </section>

      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-slate-950">상품 목록</p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            총 {totalCount}개의 상품이 등록되어 있고, {activeCount}개가 운영
            중입니다.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200">
        {isLoading ? (
          <div className="flex h-[280px] flex-col items-center justify-center text-sm text-slate-500">
            <Icon
              icon="solar:refresh-circle-bold-duotone"
              className="mb-3 h-9 w-9 animate-spin text-blue-700"
            />
            상품 목록을 불러오는 중입니다
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
          <div className="no-scrollbar overflow-x-auto">
            <div className="min-w-[1040px]">
              <div className="grid grid-cols-[2.4fr_1fr_1fr_1fr_0.8fr_1fr_1fr_0.7fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-400">
                <span>서비스명</span>
                <span>카테고리</span>
                <span>운영 방식</span>
                <span>1인 금액</span>
                <span>최대 인원</span>
                <span>상태</span>
                <span>수정일</span>
                <span>상세</span>
              </div>

              {products.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[2.4fr_1fr_1fr_1fr_0.8fr_1fr_1fr_0.7fr] gap-4 border-b border-slate-100 px-5 py-4 text-sm transition last:border-b-0 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
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
                    {formatDateTime(product.updatedAt)}
                  </div>

                  <div>
                    <Link
                      to={`/admin/products/${product.id}`}
                      className="inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
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

function ProductSummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-950">
        {value}
      </p>
    </div>
  );
}
