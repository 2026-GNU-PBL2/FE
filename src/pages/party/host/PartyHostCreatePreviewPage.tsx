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
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto flex min-h-screen w-full max-w-[520px] items-center justify-center px-5">
          <div className="w-full rounded-[32px] bg-white px-7 py-8 text-center shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] ring-1 ring-slate-200">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-10 w-10 animate-spin text-[#1E3A8A]"
            />
            <p className="mt-4 text-[16px] font-semibold text-slate-950">
              파티 생성 정보를 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto flex min-h-screen w-full max-w-[520px] items-center justify-center px-5">
          <div className="w-full rounded-[32px] bg-white px-7 py-8 text-center shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] ring-1 ring-slate-200">
            <p className="text-[16px] font-semibold text-slate-950">
              파티 생성 정보를 확인할 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-[36px] bg-white p-5 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.38)] ring-1 ring-slate-200 sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-slate-100 ring-1 ring-slate-200">
              {preview.thumbnailUrl ? (
                <img
                  src={preview.thumbnailUrl}
                  alt={preview.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon icon="solar:play-circle-bold" className="h-8 w-8" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#1E3A8A]">
                {formatOperationType(preview.operationType)}
              </p>
              <h1 className="mt-1 truncate text-[26px] font-bold tracking-tight text-slate-950 sm:text-[32px]">
                {preview.productName}
              </h1>
            </div>
          </div>

          <div className="mt-7 rounded-[28px] bg-[#F8FAFC] p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[14px] font-semibold text-slate-500">
                  예상 정산 금액
                </p>
                <p className="mt-2 text-[36px] font-bold tracking-tight text-[#1E3A8A]">
                  {formatPrice(preview.expectedSettlementAmount)}
                </p>
              </div>

              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-[#2DD4BF] shadow-sm ring-1 ring-slate-200">
                <Icon icon="solar:wallet-money-bold" className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#2DD4BF]"
                style={{ width: `${settlementRate}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[13px] font-semibold text-slate-500">
              <span>플랫폼 수수료 {formatPrice(preview.platformFee)}</span>
              <span>{settlementRate}% 정산</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
              <p className="text-[13px] font-semibold text-slate-400">
                전체 인원
              </p>
              <p className="mt-2 text-[24px] font-bold text-slate-950">
                {preview.totalCapacity}명
              </p>
            </div>

            <div className="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
              <p className="text-[13px] font-semibold text-slate-400">
                모집 인원
              </p>
              <p className="mt-2 text-[24px] font-bold text-slate-950">
                {preview.recruitMemberCount}명
              </p>
            </div>

            <div className="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
              <p className="text-[13px] font-semibold text-slate-400">
                최대 인원
              </p>
              <p className="mt-2 text-[24px] font-bold text-slate-950">
                {preview.maxMemberCount}명
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] bg-white p-5 ring-1 ring-slate-200">
            <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
              금액 상세
            </h2>

            <div className="mt-5 divide-y divide-slate-100">
              <div className="flex items-center justify-between py-3">
                <span className="text-[15px] font-medium text-slate-500">
                  OTT 원가
                </span>
                <strong className="text-[15px] font-bold text-slate-950">
                  {formatPrice(preview.ottBasePrice)}
                </strong>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-[15px] font-medium text-slate-500">
                  파티장 결제 금액
                </span>
                <strong className="text-[15px] font-bold text-slate-950">
                  {formatPrice(preview.hostPayAmount)}
                </strong>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-[15px] font-medium text-slate-500">
                  파티장 할인 금액
                </span>
                <strong className="text-[15px] font-bold text-[#0F766E]">
                  -{formatPrice(preview.hostDiscountAmount)}
                </strong>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-[15px] font-medium text-slate-500">
                  파티원 1인 결제 금액
                </span>
                <strong className="text-[15px] font-bold text-slate-950">
                  {formatPrice(preview.memberPayAmount)}
                </strong>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-[15px] font-medium text-slate-500">
                  파티원 총 결제 금액
                </span>
                <strong className="text-[15px] font-bold text-slate-950">
                  {formatPrice(preview.memberTotalAmount)}
                </strong>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-[15px] font-medium text-slate-500">
                  플랫폼 수수료
                </span>
                <strong className="text-[15px] font-bold text-slate-950">
                  {formatPrice(preview.platformFee)}
                </strong>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-[16px] font-bold text-slate-950">
                  최종 예상 정산금
                </span>
                <strong className="text-[20px] font-bold text-[#1E3A8A]">
                  {formatPrice(preview.expectedSettlementAmount)}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[24px] bg-[#ECFEFF] px-5 py-4 ring-1 ring-[#CCFBF1]">
              <div className="flex gap-3">
                <Icon
                  icon="solar:calendar-mark-bold"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#0F766E]"
                />
                <p className="text-[14px] leading-6 text-slate-700">
                  {preview.settlementDateGuide}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#FFF7ED] px-5 py-4 ring-1 ring-[#FED7AA]">
              <div className="flex gap-3">
                <Icon
                  icon="solar:shield-warning-bold"
                  className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                />
                <p className="text-[14px] leading-6 text-slate-700">
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
              "mt-7 inline-flex h-16 w-full items-center justify-center gap-2 rounded-[24px] text-[18px] font-bold transition",
              isCreating
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-[#1E3A8A] text-white shadow-[0_22px_50px_-28px_rgba(30,58,138,0.8)] hover:bg-[#1D4ED8]",
            ].join(" ")}
          >
            {isCreating ? "파티 생성 중..." : "파티 생성"}
            <Icon icon="solar:arrow-right-linear" className="h-5 w-5" />
          </button>
        </section>
      </div>
    </div>
  );
}
