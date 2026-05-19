import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { getRedirectFromSearchParams } from "@/pages/party/vacancy/vacancyFlow";

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
  const redirectPath = getRedirectFromSearchParams(searchParams);
  const memberCreatePreviewPath = productId
    ? redirectPath || getMemberCreatePreviewPath(productId)
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
    <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[520px] items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] bg-white text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-linear-to-br from-teal-50 via-white to-white px-6 py-10">
            <div
              className={[
                "mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-white shadow-sm ring-1",
                loading
                  ? "text-brand-main ring-blue-100"
                  : authorized
                    ? "text-[#14B8A6] ring-teal-100"
                    : duplicated
                      ? "text-amber-500 ring-amber-100"
                      : "text-rose-500 ring-rose-100",
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
                className={["h-10 w-10", loading ? "animate-spin" : ""].join(
                  " ",
                )}
              />
            </div>

            <div className="mt-6">
              <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#0F766E] shadow-sm ring-1 ring-teal-100">
                <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6]" />
                카드 등록
              </div>

              <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-slate-950 sm:text-[30px]">
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
          </div>

          <div className="px-6 py-6">
            {!loading ? (
              <div
                className={[
                  "mx-auto mb-6 h-2 w-16 overflow-hidden rounded-full",
                  authorized
                    ? "bg-teal-50"
                    : duplicated
                      ? "bg-amber-50"
                      : "bg-rose-50",
                ].join(" ")}
              >
                <div
                  className={[
                    "h-full w-full rounded-full",
                    authorized
                      ? "bg-[#14B8A6]"
                      : duplicated
                        ? "bg-amber-400"
                        : "bg-rose-400",
                  ].join(" ")}
                />
              </div>
            ) : null}

            <div className="space-y-3">
              {authorized && redirectUrl ? (
                <Link
                  to={memberCreatePreviewPath}
                  className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#14B8A6] text-base font-bold tracking-tight text-white shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:bg-[#0D9488]"
                >
                  다음 단계로 이동
                </Link>
              ) : null}

              {authorized && !redirectUrl ? (
                <Link
                  to={memberCreatePreviewPath}
                  className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#14B8A6] text-base font-bold tracking-tight text-white shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:bg-[#0D9488]"
                >
                  다음 단계로 이동
                </Link>
              ) : null}

              {duplicated ? (
                <Link
                  to={memberCreatePreviewPath}
                  className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#14B8A6] text-base font-bold tracking-tight text-white shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:bg-[#0D9488]"
                >
                  다음 단계로 이동
                </Link>
              ) : null}

              {!loading && !authorized && !duplicated ? (
                <Link
                  to="/party"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-100 bg-white text-sm font-bold tracking-tight text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                >
                  목록으로 돌아가기
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
