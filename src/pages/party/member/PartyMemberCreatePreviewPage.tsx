import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type PartyJoinPreviewResponse = {
  productId: string;
  productName: string;
  thumbnailUrl: string;
  productPricePerMember: number;
  platformFee: number;
  depositAmount: number;
  firstPaymentAmount: number;
  recurringPaymentAmount: number;
  paymentNotice: string;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

type PartyJoinApplyRequest = {
  productId: string;
};

type PartyJoinApplyResponse = {
  joined: boolean;
  waiting: boolean;
  partyId: number;
  joinRequestId: number;
  message: string;
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

export default function PartyMemberCreatePreviewPage() {
  const navigate = useNavigate();
  const { productId = "" } = useParams();

  const [preview, setPreview] = useState<PartyJoinPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchPreview() {
      if (!productId) {
        toast.error("상품 정보가 올바르지 않습니다.");
        navigate("/parties", { replace: true });
        return;
      }

      try {
        setIsLoading(true);

        const response = await api.post<
          PartyJoinPreviewResponse | ApiEnvelope<PartyJoinPreviewResponse>
        >("/api/v1/party-join/preview", { productId });

        const resolved = unwrapResponse<PartyJoinPreviewResponse>(
          response.data,
        );

        if (!mounted) return;

        if (!resolved) {
          toast.error("파티 참여 정보를 불러오지 못했습니다.");
          return;
        }

        setPreview(resolved);
      } catch (error) {
        console.error(error);
        toast.error("파티 참여 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void fetchPreview();

    return () => {
      mounted = false;
    };
  }, [navigate, productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[520px] items-center justify-center">
          <section className="w-full rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)]">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-10 w-10 animate-spin text-[#0F766E]"
            />
            <p className="mt-4 text-[16px] font-semibold text-slate-950">
              파티 참여 정보를 불러오는 중입니다
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[520px] items-center justify-center">
          <section className="w-full rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFEF8] text-[#0F766E]">
              <Icon icon="solar:info-circle-bold" className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-[24px] font-semibold tracking-tight text-slate-950">
              파티 참여 정보를 확인할 수 없습니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              상품을 다시 선택한 뒤 진행해 주세요.
            </p>
          </section>
        </div>
      </div>
    );
  }

  const paymentRows = [
    { label: "상품 금액", value: preview.productPricePerMember },
    { label: "플랫폼 수수료", value: preview.platformFee },
    { label: "보증금", value: preview.depositAmount },
    { label: "다음 정산일부터 결제", value: preview.recurringPaymentAmount },
  ];

  const handleApplyPartyJoin = async () => {
    if (!productId || isApplying) return;

    try {
      setIsApplying(true);

      const response = await api.post<
        PartyJoinApplyResponse | ApiEnvelope<PartyJoinApplyResponse>
      >("/api/v1/party-join/apply", {
        productId,
      } satisfies PartyJoinApplyRequest);

      const resolved = unwrapResponse<PartyJoinApplyResponse>(response.data);

      if (!resolved) {
        throw new Error("파티 참여 신청 응답이 올바르지 않습니다.");
      }

      toast.success(resolved.message || "파티 참여 신청이 완료되었습니다.");
      navigate(`/party/create/${productId}/member/complete`, {
        replace: true,
        state: resolved,
      });
    } catch (error) {
      console.error(error);
      toast.error("파티 참여 신청 중 문제가 발생했습니다.");
    } finally {
      setIsApplying(false);
    }
  };

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
                <Icon
                  icon="solar:play-circle-bold"
                  className="h-8 w-8 text-[#0F766E]"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#0F766E]">
                MEMBER PREVIEW
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
                  최초 결제 예정 금액
                </p>
                <p className="mt-2 text-[36px] font-bold tracking-tight text-[#0F766E]">
                  {formatPrice(preview.firstPaymentAmount)}
                </p>
              </div>

              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-[#2DD4BF] shadow-sm ring-1 ring-slate-200">
                <Icon icon="solar:card-bold" className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-full rounded-full bg-[#2DD4BF]" />
            </div>

            <div className="mt-2 flex items-center justify-between text-[13px] font-semibold text-slate-500">
              <span>카드 등록 완료</span>
              <span>참여 준비 완료</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
              <p className="text-[13px] font-semibold text-slate-400">
                상품 금액
              </p>
              <p className="mt-2 text-[24px] font-bold text-slate-950">
                {formatPrice(preview.productPricePerMember)}
              </p>
            </div>

            <div className="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
              <p className="text-[13px] font-semibold text-slate-400">
                보증금
              </p>
              <p className="mt-2 text-[24px] font-bold text-slate-950">
                {formatPrice(preview.depositAmount)}
              </p>
            </div>

            <div className="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
              <p className="text-[13px] font-semibold text-slate-400">
                정기 결제
              </p>
              <p className="mt-2 text-[24px] font-bold text-slate-950">
                {formatPrice(preview.recurringPaymentAmount)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] bg-white p-5 ring-1 ring-slate-200">
            <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
              금액 상세
            </h2>

            <div className="mt-5 divide-y divide-slate-100">
              {paymentRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-[15px] font-medium text-slate-500">
                    {row.label}
                  </span>
                  <strong className="text-[15px] font-bold text-slate-950">
                    {formatPrice(row.value)}
                  </strong>
                </div>
              ))}

              <div className="flex items-center justify-between gap-4 pt-4">
                <span className="text-[16px] font-bold text-slate-950">
                  최초 결제 예정 금액
                </span>
                <strong className="text-[20px] font-bold text-[#0F766E]">
                  {formatPrice(preview.firstPaymentAmount)}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[24px] bg-[#ECFEFF] px-5 py-4 ring-1 ring-[#CCFBF1]">
              <div className="flex gap-3">
                <Icon
                  icon="solar:shield-check-bold"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#0F766E]"
                />
                <p className="text-[14px] leading-6 text-slate-700">
                  등록된 카드로 파티 참여 결제가 진행됩니다.
                </p>
              </div>
            </div>

            {preview.paymentNotice ? (
              <div className="rounded-[24px] bg-[#FFF7ED] px-5 py-4 ring-1 ring-[#FED7AA]">
                <div className="flex gap-3">
                  <Icon
                    icon="solar:shield-warning-bold"
                    className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                  />
                  <p className="text-[14px] leading-6 text-slate-700">
                    {preview.paymentNotice}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] bg-[#FFF7ED] px-5 py-4 ring-1 ring-[#FED7AA]">
                <div className="flex gap-3">
                  <Icon
                    icon="solar:shield-warning-bold"
                    className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                  />
                  <p className="text-[14px] leading-6 text-slate-700">
                    결제 금액과 참여 조건을 확인한 뒤 다음 단계로 진행해 주세요.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleApplyPartyJoin}
            disabled={isApplying}
            className={[
              "mt-7 inline-flex h-16 w-full items-center justify-center gap-2 rounded-[24px] text-[18px] font-bold transition",
              isApplying
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-[#14B8A6] text-white shadow-[0_22px_50px_-28px_rgba(20,184,166,0.8)] hover:bg-[#0D9488]",
            ].join(" ")}
          >
            {isApplying ? "파티 참여 신청 중..." : "파티 참여 신청"}
            <Icon icon="solar:arrow-right-linear" className="h-5 w-5" />
          </button>
        </section>
      </div>
    </div>
  );
}
