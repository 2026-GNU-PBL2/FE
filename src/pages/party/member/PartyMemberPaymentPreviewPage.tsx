import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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

type BillingMethodResponse = {
  hasBillingKey: boolean;
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

function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export default function PartyMemberPaymentPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId = "" } = useParams();

  const preview = location.state as PartyJoinPreviewResponse | null;
  const [hasBillingMethod, setHasBillingMethod] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchBillingMethod() {
      try {
        setIsBillingLoading(true);

        const response = await api.get<
          BillingMethodResponse | ApiEnvelope<BillingMethodResponse>
        >("/api/v1/payments/billing/me");
        const data = unwrapResponse<BillingMethodResponse>(response.data);

        if (!mounted) return;

        setHasBillingMethod(Boolean(data?.hasBillingKey));
      } catch (error) {
        console.error(error);

        if (mounted) {
          setHasBillingMethod(false);
        }
      } finally {
        if (mounted) {
          setIsBillingLoading(false);
        }
      }
    }

    void fetchBillingMethod();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGoNext = () => {
    if (hasBillingMethod) {
      navigate(`/party/create/${productId}/member/create-preview`);
      return;
    }

    navigate(`/party/create/${productId}/member/agreement`);
  };

  if (!preview) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl items-center justify-center">
          <section className="w-full rounded-[28px] bg-white px-6 py-10 text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-[#0F766E]">
              <Icon icon="solar:info-circle-bold" className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-[24px] font-extrabold tracking-tight text-slate-950">
              결제 정보를 불러올 수 없습니다
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
    {
      label: "상품 금액",
      value: preview.productPricePerMember,
    },
    {
      label: "플랫폼 수수료",
      value: preview.platformFee,
    },
    {
      label: "보증금",
      value: preview.depositAmount,
    },
    {
      label: "다음 정산일부터 결제",
      value: preview.recurringPaymentAmount,
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <main className="mx-auto w-full max-w-3xl">
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
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-[#0F766E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6]" />
                    파티원 결제 확인
                  </div>
                  <h1 className="mt-2 truncate text-[22px] font-extrabold tracking-tight text-slate-950 sm:text-[26px]">
                    {preview.productName}
                  </h1>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-400 sm:text-right">
                결제 전 최종 확인
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
                  <p className="mt-1.5 text-[30px] font-extrabold tracking-tight text-slate-950 sm:text-[38px]">
                    {formatPrice(preview.firstPaymentAmount)}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0F766E] shadow-sm ring-1 ring-teal-100">
                  <Icon icon="solar:card-bold" className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-100 sm:p-6">
              <h2 className="text-[17px] font-extrabold tracking-tight text-slate-950">
                결제 상세
              </h2>

              <div className="mt-4 divide-y divide-slate-100">
                {paymentRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <p className="text-[14px] font-semibold text-slate-500">
                      {row.label}
                    </p>
                    <p className="text-right text-[14px] font-extrabold text-slate-950">
                      {formatPrice(row.value)}
                    </p>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-4 pt-4">
                  <p className="text-[16px] font-extrabold text-slate-950">
                    최초 결제 예정 금액
                  </p>
                  <p className="text-right text-[22px] font-extrabold text-[#0F766E]">
                    {formatPrice(preview.firstPaymentAmount)}
                  </p>
                </div>
              </div>
            </div>

            {preview.paymentNotice ? (
              <section className="mt-4 rounded-2xl bg-teal-50/80 px-4 py-3 ring-1 ring-teal-100">
                <div className="flex gap-3">
                  <Icon
                    icon="solar:info-circle-bold"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E]"
                  />

                  <div>
                    <p className="text-[13px] font-extrabold text-slate-950">
                      결제 안내
                    </p>
                    <p className="mt-1 text-[13px] font-semibold leading-6 text-slate-600">
                      {preview.paymentNotice}
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            {!isBillingLoading && hasBillingMethod ? (
              <section className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <div className="flex gap-3">
                  <Icon
                    icon="solar:card-bold"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E]"
                  />

                  <div>
                    <p className="text-[13px] font-extrabold text-slate-950">
                      등록된 결제수단을 사용합니다
                    </p>
                    <p className="mt-1 text-[13px] font-semibold leading-6 text-slate-600">
                      이미 등록된 카드가 있어 약관 동의와 카드 등록 단계를
                      건너뛰고 파티 신청으로 이동합니다.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            <button
              type="button"
              onClick={handleGoNext}
              disabled={isBillingLoading}
              className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#14B8A6] px-5 text-[15px] font-bold text-white shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:bg-[#0D9488] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {isBillingLoading ? (
                <>
                  <Icon
                    icon="solar:refresh-bold"
                    className="h-5 w-5 animate-spin"
                  />
                  결제수단 확인 중
                </>
              ) : hasBillingMethod ? (
                "파티 신청으로 이동"
              ) : (
                "약관 동의로 이동"
              )}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
