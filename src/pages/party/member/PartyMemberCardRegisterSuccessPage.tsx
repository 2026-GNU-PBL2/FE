import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type BillingAuthorizeRequest = {
  authKey: string;
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
  message?: string;
};

type AuthorizationStatus = "loading" | "authorized" | "duplicate" | "failed";

const authorizationRequests = new Map<
  string,
  Promise<BillingAuthorizeResponse | null>
>();

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

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; error?: string; code?: string }
      | undefined;

    return (
      responseData?.message ||
      responseData?.error ||
      "카드 등록 승인 처리에 실패했습니다."
    );
  }

  if (error instanceof Error) return error.message;
  return "카드 등록 승인 처리에 실패했습니다.";
}

function isDuplicateCardError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 400;
}

function requestBillingAuthorization(authKey: string) {
  const dedupeKey = `billing-auth:${authKey}`;

  if (sessionStorage.getItem(dedupeKey) === "done") {
    return Promise.resolve(null);
  }

  const existingRequest = authorizationRequests.get(authKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = api
    .post("/api/v1/payments/billing/authorize", {
      authKey,
    } satisfies BillingAuthorizeRequest)
    .then((response) => {
      const resolved = unwrapResponse<BillingAuthorizeResponse>(response.data);
      sessionStorage.setItem(dedupeKey, "done");
      return resolved;
    })
    .catch((error) => {
      sessionStorage.removeItem(dedupeKey);
      throw error;
    })
    .finally(() => {
      authorizationRequests.delete(authKey);
    });

  authorizationRequests.set(authKey, request);
  return request;
}

function getMemberCreatePreviewPath(productId: string) {
  return `/party/create/${productId}/member/create-preview`;
}

export default function PartyMemberCardRegisterSuccessPage() {
  const { productId = "" } = useParams();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState<AuthorizationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  const loading = status === "loading";
  const authorized = status === "authorized";
  const duplicated = status === "duplicate";
  const memberCreatePreviewPath = productId
    ? getMemberCreatePreviewPath(productId)
    : "/party";

  const rawAuthKey = useMemo(
    () => searchParams.get("authKey") ?? "",
    [searchParams],
  );
  const authKey = useMemo(() => rawAuthKey.replace(/ /g, "+"), [rawAuthKey]); // '+' 오염 보정

  useEffect(() => {
    let cancelled = false;

    async function authorizeBilling() {
      try {
        if (!authKey) {
          throw new Error("승인에 필요한 authKey가 없습니다.");
        }

        const resolved = await requestBillingAuthorization(authKey);

        if (!cancelled) {
          setStatus("authorized");
          setRedirectUrl(resolved?.redirectUrl ?? "");
          toast.success(resolved?.message || "카드 등록이 완료되었습니다.");
        }
      } catch (error) {
        const duplicateCard = isDuplicateCardError(error);
        const message = duplicateCard
          ? "이미 등록된 카드입니다."
          : getErrorMessage(error);

        if (!cancelled) {
          setStatus(duplicateCard ? "duplicate" : "failed");
          setErrorMessage(message);
          if (duplicateCard) {
            toast.info(message);
          } else {
            toast.error(message);
          }
        }
      }
    }

    void authorizeBilling();

    return () => {
      cancelled = true;
    };
  }, [authKey]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-120 items-center justify-center">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white px-5 py-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.22)] sm:px-8 sm:py-8">
          <div
            className={[
              "mx-auto flex h-18 w-18 items-center justify-center rounded-full",
              loading
                ? "bg-[#EEF4FF] text-[#1E3A8A]"
                : authorized
                  ? "bg-[#EAFBF5] text-[#2DD4BF]"
                  : duplicated
                    ? "bg-amber-50 text-amber-500"
                    : "bg-rose-50 text-rose-500",
            ].join(" ")}
          >
            <Icon
              icon={
                loading
                  ? "solar:refresh-bold"
                  : authorized
                    ? "solar:check-circle-bold"
                    : duplicated
                      ? "solar:card-bold"
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
                  : duplicated
                    ? "이미 등록된 카드입니다"
                    : "카드 등록 완료에 실패했습니다"}
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              {loading &&
                "토스 인증 결과를 확인한 뒤 서버에서 빌링키 발급을 진행하고 있습니다."}
              {!loading &&
                authorized &&
                "이제 자동결제에 사용할 카드가 정상적으로 연결되었습니다."}
              {!loading &&
                duplicated &&
                "같은 카드가 이미 자동결제 수단으로 등록되어 있습니다."}
              {!loading &&
                !authorized &&
                !duplicated &&
                (errorMessage || "승인 처리 중 문제가 발생했습니다.")}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {authorized && redirectUrl ? (
              <Link
                to={memberCreatePreviewPath}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#1E3A8A] text-base font-semibold tracking-tight text-white"
              >
                다음 단계로 이동
              </Link>
            ) : null}

            {authorized && !redirectUrl ? (
              <Link
                to={memberCreatePreviewPath}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#1E3A8A] text-base font-semibold tracking-tight text-white"
              >
                다음 단계로 이동
              </Link>
            ) : null}

            {duplicated ? (
              <Link
                to={memberCreatePreviewPath}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#1E3A8A] text-base font-semibold tracking-tight text-white"
              >
                다음 단계로 이동
              </Link>
            ) : null}

            {!loading && !authorized && !duplicated ? (
              <Link
                to="/party"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold tracking-tight text-slate-700"
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
