import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type BillingAuthorizeRequest = {
  authKey: string;
  partyId: string | number;
};

type BillingAuthorizeResponse = {
  success?: boolean;
  message?: string;
  redirectUrl?: string;
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

export default function PartyMemberCardRegisterSuccessPage() {
  const [searchParams] = useSearchParams();
  const calledRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  const authKey = searchParams.get("authKey") ?? "";
  const partyId = searchParams.get("partyId") ?? "";
  const customerKey = searchParams.get("customerKey") ?? "";

  useEffect(() => {
    if (calledRef.current) {
      return;
    }

    calledRef.current = true;

    async function authorizeBilling() {
      try {
        if (!authKey || !partyId) {
          throw new Error("승인에 필요한 authKey 또는 partyId가 없습니다.");
        }

        const payload: BillingAuthorizeRequest = {
          authKey,
          partyId,
        };

        const response = await api.post(
          "/api/v1/payments/billing/authorize",
          payload,
        );

        const resolved = unwrapResponse<BillingAuthorizeResponse>(
          response.data,
        );

        setAuthorized(true);
        setRedirectUrl(resolved?.redirectUrl ?? "");
        toast.success("카드 등록이 완료되었습니다.");
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "카드 등록 승인 처리에 실패했습니다.";

        setAuthorized(false);
        setErrorMessage(message);
        toast.error("카드 등록 승인 처리에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    authorizeBilling();
  }, [authKey, partyId]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-120 items-center justify-center">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white px-5 py-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.22)] sm:px-8 sm:py-8">
          <div
            className={[
              "mx-auto flex h-18 w-18 items-center justify-center rounded-full",
              loading
                ? "bg-[#EEF4FF] text-[#1E3A8A]"
                : authorized
                  ? "bg-[#EAFBF5] text-emerald-600"
                  : "bg-rose-50 text-rose-500",
            ].join(" ")}
          >
            <Icon
              icon={
                loading
                  ? "solar:refresh-bold"
                  : authorized
                    ? "solar:check-circle-bold"
                    : "solar:close-circle-bold"
              }
              className={["h-9 w-9", loading ? "animate-spin" : ""].join(" ")}
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#1E3A8A]">
              BILLING AUTHORIZATION
            </p>

            <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950 sm:text-[32px]">
              {loading
                ? "카드 등록을 완료하고 있습니다"
                : authorized
                  ? "카드 등록이 완료되었습니다"
                  : "카드 등록 완료에 실패했습니다"}
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              {loading &&
                "토스 인증 결과를 확인한 뒤 서버 승인 처리를 진행하고 있습니다."}
              {!loading &&
                authorized &&
                "이제 자동결제에 사용할 카드가 정상적으로 연결되었습니다."}
              {!loading &&
                !authorized &&
                (errorMessage || "승인 처리 중 문제가 발생했습니다.")}
            </p>
          </div>

          <div className="mt-8 space-y-3 rounded-[28px] bg-slate-50 px-5 py-5">
            <div className="rounded-2xl bg-white px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">
                PARTY ID
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {partyId || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">
                CUSTOMER KEY
              </p>
              <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">
                {customerKey || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">
                AUTH KEY
              </p>
              <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">
                {authKey || "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {authorized && redirectUrl ? (
              <a
                href={redirectUrl}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#1E3A8A] text-base font-semibold tracking-tight text-white shadow-[0_18px_36px_-20px_rgba(30,58,138,0.45)] transition-all duration-300 hover:bg-[#1A347B] hover:shadow-[0_22px_42px_-22px_rgba(30,58,138,0.52)]"
              >
                다음 단계로 이동
              </a>
            ) : null}

            {authorized && !redirectUrl ? (
              <Link
                to="/party"
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#1E3A8A] text-base font-semibold tracking-tight text-white shadow-[0_18px_36px_-20px_rgba(30,58,138,0.45)] transition-all duration-300 hover:bg-[#1A347B] hover:shadow-[0_22px_42px_-22px_rgba(30,58,138,0.52)]"
              >
                파티 목록으로 이동
              </Link>
            ) : null}

            {!loading && !authorized ? (
              <Link
                to="/party"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold tracking-tight text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
              >
                목록으로 돌아가기
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
