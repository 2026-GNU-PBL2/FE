import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type ProductResponse = {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  operationType: string;
  category: string;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type CreatePreviewRequest = {
  productId: string;
  capacity: number;
};

type CreatePartyRequest = {
  productId: string;
  capacity: number;
};

type CreatePreviewResponse = {
  productId: string;
  productName: string;
  thumbnailUrl: string;
  operationType: string;
  maxMemberCount: number;
  totalCapacity: number;
  recruitMemberCount: number;
  ottBasePrice: number;
  hostPayAmount: number;
  hostDiscountAmount: number;
  memberPayAmount: number;
  memberTotalAmount: number;
  platformFee: number;
  expectedSettlementAmount: number;
  settlementDateGuide: string;
  warningMessage: string;
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

function formatPrice(value?: number | null) {
  if (typeof value !== "number") return "-";
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatOperationType(value?: string) {
  if (value === "ACCOUNT_SHARE") return "계정 공유";
  if (value === "INVITE_CODE") return "초대 코드";
  return value ?? "-";
}

function getCompletePath(productId: string) {
  return `/party/create/${productId}/host/complete`;
}

export default function PartyHostCreatePreviewPage() {
  const navigate = useNavigate();
  const { productId = "" } = useParams();

  const [preview, setPreview] = useState<CreatePreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const settlementRate = useMemo(() => {
    if (!preview?.memberTotalAmount) return 0;

    return Math.min(
      Math.round(
        (preview.expectedSettlementAmount / preview.memberTotalAmount) * 100,
      ),
      100,
    );
  }, [preview]);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!productId) {
        toast.error("상품 정보가 올바르지 않습니다.");
        navigate("/parties", { replace: true });
        return;
      }

      try {
        setIsLoading(true);

        const productResponse = await api.get<
          ProductResponse | ApiEnvelope<ProductResponse>
        >(`/api/v1/products/${productId}`);

        const productPayload = unwrapResponse<ProductResponse>(
          productResponse.data,
        );

        if (!productPayload?.id || !productPayload.maxMemberCount) {
          toast.error("상품 정보를 불러오지 못했습니다.");
          navigate("/parties", { replace: true });
          return;
        }

        const previewRequest: CreatePreviewRequest = {
          productId: productPayload.id,
          capacity: productPayload.maxMemberCount,
        };

        const previewResponse = await api.post<
          CreatePreviewResponse | ApiEnvelope<CreatePreviewResponse>
        >("/api/v1/parties/create-preview", previewRequest);

        const previewPayload = unwrapResponse<CreatePreviewResponse>(
          previewResponse.data,
        );
        console.log(previewPayload);

        if (!previewPayload) {
          toast.error("파티 생성 요약 정보를 불러오지 못했습니다.");
          return;
        }

        setPreview(previewPayload);
      } catch (error) {
        console.error(error);
        toast.error("파티 생성 요약 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [navigate, productId]);

  const handleCreateParty = async () => {
    if (!preview?.productId) {
      toast.error("상품 정보가 없습니다.");
      return;
    }

    if (!preview.totalCapacity) {
      toast.error("파티 인원 정보를 확인할 수 없습니다.");
      return;
    }

    const requestBody: CreatePartyRequest = {
      productId: preview.productId,
      capacity: preview.totalCapacity,
    };

    try {
      setIsCreating(true);

      await api.post("/api/v1/parties", requestBody);

      toast.success("파티가 생성되었습니다.");
      navigate(getCompletePath(preview.productId));
    } catch (error) {
      console.error(error);
      toast.error("파티 생성 중 문제가 발생했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

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
            <p className="mt-4 text-[18px] font-extrabold text-slate-950">
              파티 생성 정보를 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!preview) {
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
            <p className="mt-4 text-[18px] font-extrabold text-slate-950">
              파티 생성 정보를 확인할 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-white px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                  {preview.thumbnailUrl ? (
                    <img
                      src={preview.thumbnailUrl}
                      alt={preview.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon
                      icon="solar:play-circle-bold"
                      className="h-6 w-6 text-brand-main"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-brand-main">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                    {formatOperationType(preview.operationType)}
                  </div>

                  <h1 className="mt-2 truncate text-[22px] font-extrabold tracking-tight text-slate-950 sm:text-[26px]">
                    {preview.productName}
                  </h1>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-400 sm:text-right">
                생성 전 최종 확인
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
            <div className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    예상 정산 금액
                  </p>
                  <p className="mt-1.5 text-[32px] font-extrabold tracking-tight text-slate-950 sm:text-[38px]">
                    {formatPrice(preview.expectedSettlementAmount)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-main shadow-sm ring-1 ring-blue-100">
                  <Icon
                    icon="solar:wallet-money-bold"
                    className="h-5 w-5"
                  />
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-brand-main"
                  style={{ width: `${settlementRate}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[12px] font-bold text-slate-400">
                <span>플랫폼 수수료 {formatPrice(preview.platformFee)}</span>
                <span>{settlementRate}% 정산</span>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                <p className="text-[13px] font-bold text-slate-500">전체 인원</p>
                <p className="text-[18px] font-extrabold text-slate-950">
                  {preview.totalCapacity}명
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                <p className="text-[13px] font-bold text-slate-500">모집 인원</p>
                <p className="text-[18px] font-extrabold text-slate-950">
                  {preview.recruitMemberCount}명
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                <p className="text-[13px] font-bold text-slate-500">최대 인원</p>
                <p className="text-[18px] font-extrabold text-slate-950">
                  {preview.maxMemberCount}명
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-100 sm:p-6">
              <h2 className="text-[17px] font-extrabold tracking-tight text-slate-950">
                금액 상세
              </h2>

              <div className="mt-4 divide-y divide-slate-100">
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[14px] font-semibold text-slate-500">
                    OTT 원가
                  </span>
                  <strong className="text-right text-[14px] font-extrabold text-slate-950">
                    {formatPrice(preview.ottBasePrice)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[14px] font-semibold text-slate-500">
                    파티장 결제 금액
                  </span>
                  <strong className="text-right text-[14px] font-extrabold text-slate-950">
                    {formatPrice(preview.hostPayAmount)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[14px] font-semibold text-slate-500">
                    파티장 할인 금액
                  </span>
                  <strong className="text-right text-[14px] font-extrabold text-[#065F46]">
                    -{formatPrice(preview.hostDiscountAmount)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[14px] font-semibold text-slate-500">
                    파티원 1인 결제 금액
                  </span>
                  <strong className="text-right text-[14px] font-extrabold text-slate-950">
                    {formatPrice(preview.memberPayAmount)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[14px] font-semibold text-slate-500">
                    파티원 총 결제 금액
                  </span>
                  <strong className="text-right text-[14px] font-extrabold text-slate-950">
                    {formatPrice(preview.memberTotalAmount)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[14px] font-semibold text-slate-500">
                    플랫폼 수수료
                  </span>
                  <strong className="text-right text-[14px] font-extrabold text-slate-950">
                    {formatPrice(preview.platformFee)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4">
                  <span className="text-[16px] font-extrabold text-slate-950">
                    최종 예상 정산금
                  </span>
                  <strong className="text-right text-[22px] font-extrabold text-brand-main">
                    {formatPrice(preview.expectedSettlementAmount)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-blue-50/70 px-4 py-3 ring-1 ring-blue-100">
                <div className="flex gap-3">
                  <Icon
                    icon="solar:calendar-mark-bold"
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-main"
                  />
                  <p className="text-[13px] font-semibold leading-6 text-slate-600">
                    {preview.settlementDateGuide}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-orange-50 px-4 py-3 ring-1 ring-orange-100">
                <div className="flex gap-3">
                  <Icon
                    icon="solar:shield-warning-bold"
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <p className="text-[13px] font-semibold leading-6 text-slate-600">
                    {preview.warningMessage}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateParty}
              disabled={isCreating}
              className={[
                "mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition",
                isCreating
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-brand-main text-white shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 hover:bg-blue-800",
              ].join(" ")}
            >
              {isCreating ? "파티 생성 중..." : "파티 생성"}
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
