import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { loadTossPaymentsScript } from "@/utils/loadTossPayments";

type BillingCustomerKeyResponse = {
  customerKey: string;
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

function getSuccessPath(productId: string) {
  return `/party/create/${productId}/member/card-register/success`;
}

function getFailPath(productId: string) {
  return `/party/create/${productId}/member/card-register/fail`;
}

export default function PartyMemberCardRegisterPage() {
  const { productId = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [customerKey, setCustomerKey] = useState("");

  const clientKey = import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY as
    | string
    | undefined;

  const isReady = useMemo(() => {
    return Boolean(clientKey && customerKey && productId);
  }, [clientKey, customerKey, productId]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setLoading(true);

        const [, response] = await Promise.all([
          loadTossPaymentsScript(),
          api.get("/api/v1/payments/billing/customer-key"),
        ]);

        const resolved = unwrapResponse<BillingCustomerKeyResponse>(
          response.data,
        );

        if (!mounted) return;

        if (!clientKey) {
          throw new Error(
            "VITE_TOSS_PAYMENTS_CLIENT_KEY 환경변수가 설정되지 않았습니다.",
          );
        }

        if (!resolved?.customerKey) {
          throw new Error("customerKey 응답이 올바르지 않습니다.");
        }

        setCustomerKey(resolved.customerKey);

        console.log("🔥 [BACKEND CUSTOMER KEY]");
        console.log("customerKey from API:", resolved.customerKey);
      } catch (error) {
        console.error(error);
        toast.error("카드 등록 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, [clientKey]);

  const handleRequestBillingAuth = async () => {
    if (!clientKey || !customerKey || !productId || requesting) {
      return;
    }

    try {
      setRequesting(true);

      await loadTossPaymentsScript();

      if (!window.TossPayments) {
        throw new Error("토스페이먼츠 SDK가 준비되지 않았습니다.");
      }

      const tossPayments = window.TossPayments(clientKey);
      const payment = tossPayments.payment({
        customerKey,
      });

      const successUrl = new URL(
        getSuccessPath(productId),
        window.location.origin,
      );

      const failUrl = new URL(getFailPath(productId), window.location.origin);

      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: successUrl.toString(),
        failUrl: failUrl.toString(),
      });
    } catch (error) {
      console.error(error);
      toast.error("카드 등록창을 열지 못했습니다.");
      setRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      <div className="mx-auto w-full max-w-[780px] px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.22)] sm:rounded-[34px]">
          <div className="border-b border-[#D9FBEF] bg-[#F7FFFD] px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0F766E] shadow-[0_8px_22px_-18px_rgba(20,184,166,0.45)]">
                CARD REGISTER
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#14B8A6] shadow-[0_10px_28px_-22px_rgba(20,184,166,0.45)] sm:h-14 sm:w-14">
                <Icon
                  icon="solar:card-bold"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                />
              </div>
            </div>

            <div className="mt-5">
              <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                결제 카드를 등록해 주세요
              </h1>

              <p className="mt-3 text-[14px] leading-7 text-slate-500 sm:max-w-[620px] sm:text-[15px]">
                자동승인 결제에 사용할 카드를 토스페이먼츠 보안 결제창에서
                안전하게 등록합니다.
              </p>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-8 sm:py-8">
            <div className="rounded-[24px] border border-[#D9FBEF] bg-white px-5 py-5 shadow-[0_16px_42px_-34px_rgba(20,184,166,0.22)] sm:rounded-[28px] sm:px-6 sm:py-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ECFEF8] text-[#0F766E] sm:h-12 sm:w-12">
                  <Icon
                    icon="solar:lock-keyhole-bold"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[16px] font-semibold leading-6 tracking-tight text-slate-950 sm:text-[18px]">
                    카드 정보는 Submate에 직접 저장되지 않습니다
                  </p>
                  <p className="mt-2 text-[14px] leading-7 text-slate-500 sm:text-[15px]">
                    카드번호 입력과 본인 확인은 토스페이먼츠에서 처리됩니다.
                    Submate는 자동결제 승인을 위한 인증 결과만 전달받아 등록을
                    완료합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3">
              {[
                {
                  icon: "solar:shield-check-bold",
                  title: "보안 결제창",
                  description: "카드 정보 외부 인증 처리",
                },
                {
                  icon: "solar:refresh-circle-bold",
                  title: "자동승인 준비",
                  description: "이용권 결제 흐름에 사용",
                },
                {
                  icon: "solar:document-text-bold",
                  title: "정산 기록 연동",
                  description: "결제 성공 여부 원장 기록",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-slate-200 bg-[#F8FAFC] px-4 py-4 sm:rounded-[24px]"
                >
                  <div className="flex items-start gap-3 sm:block">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#14B8A6]">
                      <Icon icon={item.icon} className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 sm:mt-4">
                      <p className="text-[14px] font-semibold text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[22px] bg-[#F8FAFC] px-4 py-4 sm:mt-5 sm:rounded-[26px] sm:px-5 sm:py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500">
                  <Icon icon="solar:info-circle-linear" className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[14px] font-semibold text-slate-900">
                    결제 안내
                  </p>
                  <p className="mt-1 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                    카드 등록만으로 즉시 결제되지 않습니다. 실제 결제는 파티
                    참여 및 결제 승인 시점에 진행됩니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-7">
              <button
                type="button"
                onClick={handleRequestBillingAuth}
                disabled={!isReady || loading || requesting}
                className={[
                  "inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold transition sm:h-15 sm:rounded-[22px]",
                  !isReady || loading || requesting
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-[#14B8A6] text-white shadow-[0_20px_46px_-24px_rgba(20,184,166,0.42)] hover:bg-[#0D9488]",
                ].join(" ")}
              >
                <Icon icon="solar:card-send-bold" className="h-5 w-5" />
                {loading
                  ? "등록 정보 확인 중..."
                  : requesting
                    ? "결제창 준비 중..."
                    : "카드 등록하기"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
