import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { loadTossPaymentsScript } from "@/utils/loadTossPayments";
import { getRedirectFromSearchParams } from "@/pages/party/vacancy/vacancyFlow";

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
  const [searchParams] = useSearchParams();
  const redirectPath = getRedirectFromSearchParams(searchParams);

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

      if (redirectPath) {
        successUrl.searchParams.set("redirect", redirectPath);
        failUrl.searchParams.set("redirect", redirectPath);
      }

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
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-[720px]">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-[#00875A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00A86B]" />
                  카드 등록
                </div>

                <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-slate-950 sm:text-[32px]">
                  결제 카드를 등록해 주세요
                </h1>

                <p className="mt-3 max-w-md text-[14px] font-medium leading-7 text-slate-500 sm:text-[15px]">
                  토스페이먼츠 보안 결제창에서 자동승인 결제에 사용할 카드를
                  안전하게 등록합니다.
                </p>

                <button
                  type="button"
                  onClick={handleRequestBillingAuth}
                  disabled={!isReady || loading || requesting}
                  className={[
                    "mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold transition sm:w-auto sm:min-w-[220px] sm:px-7",
                    !isReady || loading || requesting
                      ? "cursor-not-allowed bg-slate-200 text-slate-400"
                      : "bg-[#00A86B] text-white shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5 hover:bg-[#00875A]",
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

              <div className="relative hidden md:block">
                <div className="rounded-[28px] bg-linear-to-br from-[#00A86B] to-[#00875A] p-5 text-white shadow-xl shadow-emerald-900/20">
                  <div className="flex items-center justify-between">
                    <Icon icon="solar:card-bold" className="h-6 w-6" />
                  </div>

                  <div className="mt-12">
                    <div className="h-2 w-24 rounded-full bg-white/45" />
                    <div className="mt-3 flex gap-2">
                      <div className="h-2 w-10 rounded-full bg-white/30" />
                      <div className="h-2 w-10 rounded-full bg-white/30" />
                      <div className="h-2 w-10 rounded-full bg-white/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
            <div className="rounded-[24px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100 sm:px-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#00875A] shadow-sm ring-1 ring-[#A9E6C9]">
                  <Icon
                    icon="solar:lock-keyhole-bold"
                    className="h-5 w-5"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold tracking-tight text-slate-950">
                    카드 정보는 Submate에 직접 저장되지 않습니다
                  </p>
                  <p className="mt-1.5 text-[13px] leading-6 text-slate-500 sm:text-[14px]">
                    카드번호 입력과 본인 확인은 토스페이먼츠에서 처리됩니다.
                    Submate는 자동결제 승인을 위한 인증 결과만 전달받아 등록을
                    완료합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
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
                  className="rounded-2xl bg-white px-4 py-3 shadow-sm shadow-slate-900/5 ring-1 ring-slate-100"
                >
                  <div className="flex items-start gap-3 sm:block">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#00875A]">
                      <Icon icon={item.icon} className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 sm:mt-3">
                      <p className="text-[13px] font-extrabold text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-emerald-50/80 px-4 py-3 ring-1 ring-[#A9E6C9]">
              <div className="flex items-start gap-3">
                <Icon
                  icon="solar:info-circle-linear"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#00875A]"
                />

                <div>
                  <p className="text-[13px] font-extrabold text-slate-950">
                    결제 안내
                  </p>
                  <p className="mt-1 text-[13px] font-semibold leading-6 text-slate-600">
                    카드 등록만으로 즉시 결제되지 않습니다. 실제 결제는 파티
                    참여 및 결제 승인 시점에 진행됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
