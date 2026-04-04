import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import {
  formatCurrency,
  formatDateTime,
  getAdminProducts,
  getOperationTypeClassName,
  getOperationTypeLabel,
  getStatusClassName,
  getStatusLabel,
} from "@/pages/admin/mock/adminMock";

export default function AdminProductListPage() {
  const products = getAdminProducts();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <Link
          to="/admin/products/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-900 to-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:translate-y-[-1px]"
        >
          <Icon icon="solar:add-circle-bold-duotone" className="h-5 w-5" />
          상품 등록
        </Link>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="overflow-x-auto">
          <div className="min-w-[1280px]">
            <div className="grid grid-cols-[2.8fr_1.1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span>서비스명</span>
              <span>운영 방식</span>
              <span>기본 요금</span>
              <span>1인당 금액</span>
              <span>최대 인원</span>
              <span>상태</span>
              <span>수정일</span>
              <span>상세</span>
            </div>

            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[2.8fr_1.1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-100 px-6 py-5 text-sm last:border-b-0"
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
                        {product.id}
                      </p>
                    </div>
                  </div>
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

                <div className="text-slate-600">{product.maxMemberCount}명</div>

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
      </section>
    </div>
  );
}
