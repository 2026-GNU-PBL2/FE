import { useMemo, useState, type SyntheticEvent } from "react";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createAdminProduct,
  getAdminProductById,
  getOperationTypeLabel,
  getStatusClassName,
  getStatusLabel,
  updateAdminProduct,
  type AdminOperationType,
} from "@/pages/admin/mock/adminMock";

type OperationTypeSelectable = "ACCOUNT_SHARE" | "INVITE";

const operationTypeOptions: Array<{
  label: string;
  description: string;
  value: OperationTypeSelectable;
}> = [
  {
    label: "계정 공유형",
    description: "공유 계정 정보로 파티원이 이용하는 방식입니다.",
    value: "ACCOUNT_SHARE",
  },
  {
    label: "초대형",
    description: "초대 링크 또는 초대 코드로 참여하는 방식입니다.",
    value: "INVITE",
  },
];

export default function AdminProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const isEditMode = Boolean(productId);

  const product = useMemo(() => {
    if (!productId) return null;
    return getAdminProductById(productId);
  }, [productId]);

  const [serviceName, setServiceName] = useState(product?.serviceName ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnailUrl ?? "");
  const [operationType, setOperationType] = useState<OperationTypeSelectable>(
    product?.operationType ?? "ACCOUNT_SHARE",
  );
  const [maxMemberCount, setMaxMemberCount] = useState(
    product?.maxMemberCount ? String(product.maxMemberCount) : "4",
  );
  const [basePrice, setBasePrice] = useState(
    product?.basePrice ? String(product.basePrice) : "",
  );
  const [pricePerMember, setPricePerMember] = useState(
    product?.pricePerMember ? String(product.pricePerMember) : "",
  );

  const previewInitial = (serviceName.trim() || "SM").slice(0, 2).toUpperCase();

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !serviceName.trim() ||
      !description.trim() ||
      !thumbnailUrl.trim() ||
      !maxMemberCount ||
      !basePrice ||
      !pricePerMember
    ) {
      toast.error("모든 필수 항목을 입력해 주세요.");
      return;
    }

    const parsedMaxMemberCount = Number(maxMemberCount);
    const parsedBasePrice = Number(basePrice);
    const parsedPricePerMember = Number(pricePerMember);

    if (
      Number.isNaN(parsedMaxMemberCount) ||
      Number.isNaN(parsedBasePrice) ||
      Number.isNaN(parsedPricePerMember)
    ) {
      toast.error("숫자 항목을 올바르게 입력해 주세요.");
      return;
    }

    if (parsedMaxMemberCount <= 0) {
      toast.error("최대 인원은 1명 이상이어야 합니다.");
      return;
    }

    if (parsedBasePrice <= 0 || parsedPricePerMember <= 0) {
      toast.error("금액은 0보다 커야 합니다.");
      return;
    }

    if (isEditMode && productId) {
      const updated = updateAdminProduct(productId, {
        serviceName: serviceName.trim(),
        description: description.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        maxMemberCount: parsedMaxMemberCount,
        basePrice: parsedBasePrice,
        pricePerMember: parsedPricePerMember,
      });

      if (!updated) {
        toast.error("상품 수정에 실패했습니다.");
        return;
      }

      toast.success("상품 정보가 수정되었습니다.");
      navigate(`/admin/products/${updated.id}`, { replace: true });
      return;
    }

    const created = createAdminProduct({
      serviceName: serviceName.trim(),
      description: description.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      operationType,
      maxMemberCount: parsedMaxMemberCount,
      basePrice: parsedBasePrice,
      pricePerMember: parsedPricePerMember,
    });

    toast.success("새 상품이 등록되었습니다.");
    navigate(`/admin/products/${created.id}`, { replace: true });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-13 w-13 items-center justify-center rounded-3xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100">
            <Icon icon="solar:box-bold-duotone" className="h-6 w-6" />
          </div>

          <div>
            <p className="text-lg font-semibold text-slate-900">
              {isEditMode ? "상품 수정" : "상품 등록"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              스웨거 기준 필드 구조에 맞춰 mock 상품 데이터를 등록하거나 수정할
              수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">
              기본 정보
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  서비스명
                </label>
                <input
                  value={serviceName}
                  onChange={(event) => setServiceName(event.target.value)}
                  placeholder="예: 넷플릭스 프리미엄"
                  className="h-13 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  썸네일 URL
                </label>
                <input
                  value={thumbnailUrl}
                  onChange={(event) => setThumbnailUrl(event.target.value)}
                  placeholder="https://example.com/image.png"
                  className="h-13 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  상품 설명
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  placeholder="상품 운영 목적, 특징, 관리 포인트를 입력하세요."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm leading-6 text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">
                운영 설정
              </h2>

              {isEditMode && product ? (
                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                    getStatusClassName(product.status),
                  ].join(" ")}
                >
                  {getStatusLabel(product.status)}
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              {operationTypeOptions.map((item) => {
                const isSelected = operationType === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      if (isEditMode) return;
                      setOperationType(item.value);
                    }}
                    disabled={isEditMode}
                    className={[
                      "flex w-full items-start justify-between rounded-2xl border px-4 py-4 text-left transition",
                      isSelected
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                      isEditMode ? "cursor-not-allowed opacity-70" : "",
                    ].join(" ")}
                  >
                    <div className="pr-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    {isSelected ? (
                      <Icon
                        icon="solar:check-circle-bold-duotone"
                        className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {isEditMode ? (
              <p className="mt-4 text-xs leading-5 text-slate-500">
                수정 mock은 PUT 기준으로 operationType을 변경하지 않도록
                맞췄습니다.
              </p>
            ) : null}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">
              결제 정보
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  최대 인원
                </label>
                <input
                  type="number"
                  value={maxMemberCount}
                  onChange={(event) => setMaxMemberCount(event.target.value)}
                  placeholder="4"
                  className="h-13 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  기본 요금
                </label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(event) => setBasePrice(event.target.value)}
                  placeholder="17000"
                  className="h-13 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  1인당 금액
                </label>
                <input
                  type="number"
                  value={pricePerMember}
                  onChange={(event) => setPricePerMember(event.target.value)}
                  placeholder="4250"
                  className="h-13 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">미리보기</h2>

            <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <div className="overflow-hidden rounded-[24px] bg-white shadow-sm shadow-slate-900/5">
                <div className="relative aspect-[16/9] w-full bg-slate-100">
                  {thumbnailUrl.trim() ? (
                    <img
                      src={thumbnailUrl}
                      alt={serviceName || "상품 썸네일"}
                      className="h-full w-full object-cover"
                    />
                  ) : null}

                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-900 via-blue-700 to-cyan-400 text-white">
                    <span className="text-2xl font-semibold tracking-tight">
                      {previewInitial}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="wrap-break-word text-base font-semibold text-slate-900">
                        {serviceName || "서비스명이 여기에 표시됩니다."}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {getOperationTypeLabel(
                          operationType as AdminOperationType,
                        )}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      최대 {maxMemberCount || 0}명
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {description || "상품 설명이 여기에 표시됩니다."}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                        기본 요금
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {basePrice || 0}원
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                        1인당 금액
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {pricePerMember || 0}원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                취소
              </button>

              <button
                type="submit"
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {isEditMode ? "수정 완료" : "상품 등록"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
