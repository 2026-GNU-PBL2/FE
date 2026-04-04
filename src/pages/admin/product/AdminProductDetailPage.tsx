import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteAdminProduct,
  formatCurrency,
  formatDateTime,
  getAdminProductById,
  getOperationTypeClassName,
  getOperationTypeLabel,
  getStatusClassName,
  getStatusLabel,
} from "@/pages/admin/mock/adminMock";

function DeleteConfirmModal({
  isOpen,
  serviceName,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  serviceName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/15">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
          <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-7 w-7" />
        </div>

        <h3 className="mt-5 text-xl font-semibold text-slate-900">
          상품을 삭제하시겠습니까?
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          <span className="font-semibold text-slate-700">{serviceName}</span>{" "}
          상품이 삭제됩니다.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const product = productId ? getAdminProductById(productId) : null;

  if (!product) {
    return <Navigate to="/admin/products" replace />;
  }

  const handleDelete = () => {
    deleteAdminProduct(product.id);
    toast.success("상품이 삭제되었습니다.");
    navigate("/admin/products", { replace: true });
  };

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="bg-linear-to-r from-slate-900 via-blue-900 to-sky-500 px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[24px] border border-white/15 bg-white/10 shadow-lg shadow-black/10">
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.serviceName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-900 via-blue-700 to-cyan-400 text-lg font-semibold text-white">
                      {product.serviceName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-white/70">
                    {product.id}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    {product.serviceName}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/admin/products/${product.id}/edit`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  <Icon icon="solar:pen-bold-duotone" className="h-5 w-5" />
                  상품 수정
                </Link>

                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <Icon
                    icon="solar:trash-bin-trash-bold-duotone"
                    className="h-5 w-5"
                  />
                  삭제
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
              <p className="text-sm font-medium text-slate-500">기본 요금</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {formatCurrency(product.basePrice)}원
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
              <p className="text-sm font-medium text-slate-500">1인당 금액</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {formatCurrency(product.pricePerMember)}원
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
              <p className="text-sm font-medium text-slate-500">최대 인원</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {product.maxMemberCount}명
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
              <p className="text-sm font-medium text-slate-500">운영 방식</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {getOperationTypeLabel(product.operationType)}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <p className="text-base font-semibold text-slate-900">상세 정보</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  상태
                </p>
                <div className="mt-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      getStatusClassName(product.status),
                    ].join(" ")}
                  >
                    {getStatusLabel(product.status)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  운영 방식
                </p>
                <div className="mt-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      getOperationTypeClassName(product.operationType),
                    ].join(" ")}
                  >
                    {getOperationTypeLabel(product.operationType)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  썸네일 URL
                </p>
                <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">
                  {product.thumbnailUrl || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  생성일
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(product.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  최종 수정일
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(product.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        serviceName={product.serviceName}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
