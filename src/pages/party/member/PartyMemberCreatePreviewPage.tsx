import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/utils/api-error";

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
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl items-center justify-center">
          <section className="w-full rounded-[28px] bg-white px-6 py-10 text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-[#0F766E]">
              <Icon icon="solar:refresh-bold" className="h-7 w-7 animate-spin" />
            </div>
            <p className="mt-4 text-[18px] font-extrabold text-slate-950">
              파티 참여 정보를 불러오는 중입니다
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl items-center justify-center">
          <section className="w-full rounded-[28px] bg-white px-6 py-10 text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-[#0F766E]">
              <Icon icon="solar:info-circle-bold" className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-[24px] font-extrabold tracking-tight text-slate-950">
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
      toast.error(
        getApiErrorMessage(error, "파티 참여 신청 중 문제가 발생했습니다."),
      );
    } finally {
      setIsApplying(false);
    }
  };

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
                      className="h-6 w-6 text-[#0F766E]"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-[#0F766E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6]" />
                    파티원 최종 확인
                  </div>

                  <h1 className="mt-2 truncate text-[22px] font-extrabold tracking-tight text-slate-950 sm:text-[26px]">
                    {preview.productName}
                  </h1>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-400 sm:text-right">
                참여 전 최종 확인
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
            <div className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    최초 결제 예정 금액
                  </p>
                  <p className="mt-1.5 text-[32px] font-extrabold tracking-tight text-slate-950 sm:text-[38px]">
                    {formatPrice(preview.firstPaymentAmount)}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0F766E] shadow-sm ring-1 ring-teal-100">
                  <Icon icon="solar:card-bold" className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full w-full rounded-full bg-[#14B8A6]" />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[12px] font-bold text-slate-400">
                <span>카드 등록 완료</span>
                <span>참여 준비 완료</span>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                <p className="text-[13px] font-bold text-slate-500">상품 금액</p>
                <p className="text-[18px] font-extrabold text-slate-950">
                  {formatPrice(preview.productPricePerMember)}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                <p className="text-[13px] font-bold text-slate-500">보증금</p>
                <p className="text-[18px] font-extrabold text-slate-950">
                  {formatPrice(preview.depositAmount)}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                <p className="text-[13px] font-bold text-slate-500">정기 결제</p>
                <p className="text-[18px] font-extrabold text-slate-950">
                  {formatPrice(preview.recurringPaymentAmount)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-100 sm:p-6">
              <h2 className="text-[17px] font-extrabold tracking-tight text-slate-950">
                금액 상세
              </h2>

              <div className="mt-4 divide-y divide-slate-100">
                {paymentRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <span className="text-[14px] font-semibold text-slate-500">
                      {row.label}
                    </span>
                    <strong className="text-right text-[14px] font-extrabold text-slate-950">
                      {formatPrice(row.value)}
                    </strong>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-4 pt-4">
                  <span className="text-[16px] font-extrabold text-slate-950">
                    최초 결제 예정 금액
                  </span>
                  <strong className="text-right text-[22px] font-extrabold text-[#0F766E]">
                    {formatPrice(preview.firstPaymentAmount)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-teal-50/80 px-4 py-3 ring-1 ring-teal-100">
              <div className="flex gap-3">
                <Icon
                  icon="solar:shield-check-bold"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E]"
                />
                <p className="text-[13px] font-semibold leading-6 text-slate-600">
                  등록된 카드로 파티 참여 결제가 진행됩니다.
                </p>
              </div>
            </div>

            {preview.paymentNotice ? (
              <div className="mt-3 rounded-2xl bg-orange-50 px-4 py-3 ring-1 ring-orange-100">
                <div className="flex gap-3">
                  <Icon
                    icon="solar:shield-warning-bold"
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <p className="text-[13px] font-semibold leading-6 text-slate-600">
                    {preview.paymentNotice}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl bg-orange-50 px-4 py-3 ring-1 ring-orange-100">
                <div className="flex gap-3">
                  <Icon
                    icon="solar:shield-warning-bold"
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <p className="text-[13px] font-semibold leading-6 text-slate-600">
                    결제 금액과 참여 조건을 확인한 뒤 다음 단계로 진행해 주세요.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleApplyPartyJoin}
              disabled={isApplying}
              className={[
                "mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition",
                isApplying
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-[#14B8A6] text-white shadow-lg shadow-teal-900/20 hover:-translate-y-0.5 hover:bg-[#0D9488]",
              ].join(" ")}
            >
              {isApplying ? "파티 참여 신청 중..." : "파티 참여 신청"}
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
