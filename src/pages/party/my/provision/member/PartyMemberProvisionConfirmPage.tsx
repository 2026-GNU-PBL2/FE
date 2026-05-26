import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type ProvisionType =
  | "INVITE_CODE"
  | "INVITE_LINK"
  | "ACCOUNT_SHARE"
  | "SHARED_ACCOUNT"
  | string;

type ConfirmLocationState = {
  productId?: string;
  productName?: string;
  provisionType?: ProvisionType | null;
  operationType?: ProvisionType | null;
};

type PartyHistoryItem = {
  partyId: number;
  productId: string;
  productName: string;
};

type PartyJoinRequestItem = {
  partyId?: number | null;
  productId: string;
  productName: string;
};

type ProductResponse = {
  id: string;
  productName?: string | null;
  name?: string | null;
  operationType?: ProvisionType | null;
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

function isInviteProvisionType(type?: ProvisionType | null) {
  return type === "INVITE_CODE" || type === "INVITE_LINK";
}

function getErrorStatus(error: unknown) {
  return (error as { response?: { status?: number } }).response?.status;
}

export default function PartyMemberProvisionConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { partyId } = useParams<{ partyId: string }>();
  const locationState = location.state as ConfirmLocationState | null;

  const [fallbackMeta, setFallbackMeta] = useState<ConfirmLocationState | null>(
    locationState,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const provisionType =
    fallbackMeta?.provisionType ??
    fallbackMeta?.operationType;
  const isInviteProvision = isInviteProvisionType(provisionType);
  const productName =
    fallbackMeta?.productName ??
    locationState?.productName ??
    "파티 이용 안내";

  const guideContent = useMemo(() => {
    if (isInviteProvision) {
      return {
        label: productName,
        title: "초대 코드 이용 안내",
        description:
          "파티장이 이용 정보를 등록하면 마이페이지 메일함에서 초대 코드를 확인할 수 있습니다. 초대 코드를 받은 뒤 OTT 계정을 활성화해주세요.",
        cardTitle: "확인 전 체크사항",
        toneClassName: "text-sky-600",
        icon: "solar:mailbox-bold",
        checks: [
          "마이페이지 메일함에 초대 코드가 도착했는지 확인해주세요.",
          "초대 코드를 받은 뒤 OTT 계정을 활성화해주세요.",
          "초대 코드 확인과 계정 활성화를 완료했다면 확인 버튼을 눌러주세요.",
        ],
      };
    }

    return {
      label: productName,
      title: "공유계정 이용 안내",
      description:
        "확인 버튼을 누르면 대시보드에서 공유 계정 정보를 확인할 수 있습니다.",
      cardTitle: "확인 전 체크사항",
      toneClassName: "text-[#00875A]",
      icon: "solar:checklist-bold",
      checks: [
        "확인 후 열리는 대시보드에서 계정 정보를 확인해주세요.",
        "OTT 접속 후 사용할 개인 프로필은 직접 설정해주세요.",
        "로그인이나 이용 제한 문제가 있으면 고객센터 1:1 문의로 접수해주세요.",
      ],
    };
  }, [isInviteProvision, productName]);

  useEffect(() => {
    if (!partyId || isLoading || !isInviteProvision) return;

    navigate(`/myparty/${partyId}/provision/invite-activation`, {
      replace: true,
    });
  }, [isInviteProvision, isLoading, navigate, partyId]);

  useEffect(() => {
    const fetchConfirmMeta = async () => {
      if (!partyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        let nextMeta = locationState ?? null;

        let productId = nextMeta?.productId;

        if (!productId) {
          try {
            const joinResponse = await api.get("/api/v1/party-join/me");
            const joinData =
              unwrapResponse<PartyJoinRequestItem[] | PartyJoinRequestItem>(
                joinResponse.data,
              ) ?? [];
            const joinRequests = Array.isArray(joinData)
              ? joinData
              : [joinData];
            const currentJoinRequest = joinRequests.find(
              (request) => String(request.partyId) === partyId,
            );

            if (currentJoinRequest) {
              nextMeta = {
                ...nextMeta,
                productId: currentJoinRequest.productId,
                productName:
                  nextMeta?.productName ?? currentJoinRequest.productName,
              };
              productId = currentJoinRequest.productId;
            }
          } catch (error) {
            const status = getErrorStatus(error);

            if (status !== 403 && status !== 404) {
              console.error(error);
            }
          }
        }

        if (!productId) {
          try {
            const historyResponse = await api.get("/api/v1/me/party-history");
            const historyData =
              unwrapResponse<PartyHistoryItem[]>(historyResponse.data) ?? [];
            const currentParty = historyData.find(
              (party) => String(party.partyId) === partyId,
            );

            if (currentParty) {
              nextMeta = {
                ...nextMeta,
                productId: currentParty.productId,
                productName: nextMeta?.productName ?? currentParty.productName,
              };
              productId = currentParty.productId;
            }
          } catch (error) {
            const status = getErrorStatus(error);

            if (status !== 403 && status !== 404) {
              console.error(error);
            }
          }
        }

        if (productId) {
          try {
            const productResponse = await api.get<
              ProductResponse | ApiEnvelope<ProductResponse>
            >(`/api/v1/products/${productId}`);
            const productData = unwrapResponse<ProductResponse>(
              productResponse.data,
            );

            if (productData) {
              nextMeta = {
                ...nextMeta,
                productId,
                productName:
                  nextMeta?.productName ??
                  productData.productName ??
                  productData.name ??
                  undefined,
                operationType: productData.operationType,
              };
            }
          } catch (error) {
            const status = getErrorStatus(error);

            if (status !== 403 && status !== 404) {
              console.error(error);
            }
          }
        }

        setFallbackMeta(nextMeta);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfirmMeta();
  }, [locationState, partyId]);

  const handleConfirm = async () => {
    if (!partyId || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await api.post(`/api/v1/parties/${partyId}/provision/confirm`);

      toast.success("이용 확인이 완료되었습니다.");
      navigate(`/myparty/${partyId}/provision/member-dashboard`, {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("파티장 이용 정보 등록을 기다려주세요.");
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-3xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-brand-main"
            />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              이용 확인 정보를 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-3xl items-center">
        <section className="w-full overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="px-5 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                  <Icon
                    icon="solar:verified-check-bold"
                    className="h-4 w-4 shrink-0 text-[#00875A]"
                  />
                  <span className="truncate">{guideContent.label}</span>
                </div>

                <h1 className="mt-4 text-[28px] font-extrabold tracking-tight text-slate-950 sm:text-[34px]">
                  {guideContent.title}
                </h1>
                <p className="mt-3 max-w-xl text-[15px] font-semibold leading-7 text-slate-500">
                  {guideContent.description}
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-slate-50 text-[#00875A] ring-1 ring-slate-100">
                <Icon icon={guideContent.icon} className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-8 sm:py-7">
            <div className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-slate-100 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-extrabold text-[#00875A]">
                    READY CHECK
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
                    {guideContent.cardTitle}
                  </h2>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#00875A] ring-1 ring-[#A9E6C9]">
                  <Icon icon="solar:checklist-minimalistic-bold" className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {guideContent.checks.map((check) => (
                  <div
                    key={check}
                    className="flex items-start gap-3 rounded-[20px] bg-white px-4 py-4 ring-1 ring-slate-100"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00A86B] text-white">
                      <Icon icon="meteor-icons:check" className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm font-semibold leading-6 text-slate-600">
                      {check}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-emerald-50/80 px-4 py-4 ring-1 ring-[#A9E6C9] sm:px-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#00875A] ring-1 ring-[#A9E6C9]">
                  <Icon icon="solar:info-circle-bold" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    확인 후 대시보드로 이동합니다
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    대시보드에서 실제 이용 정보와 현재 파티 상태를 확인할 수
                    있습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_1.5fr]">
              <button
                type="button"
                onClick={() => navigate("/myparty")}
                disabled={isSubmitting}
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:text-slate-300"
              >
                <Icon icon="solar:list-bold" className="h-5 w-5" />
                나의 파티
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={isSubmitting}
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#00A86B] px-6 text-base font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-[#00875A] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
              >
                확인했어요
                <Icon icon="solar:alt-arrow-right-linear" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-[30px] bg-white px-5 py-5 shadow-[0_28px_90px_-34px_rgba(15,23,42,0.7)] ring-1 ring-slate-100 sm:px-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <Icon icon="solar:shield-warning-bold" className="h-7 w-7" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
                  이용 준비를 완료했나요?
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  {isInviteProvision
                    ? "OTT 계정 활성화와 계정 설정을 모두 완료한 뒤 확인해주세요."
                    : "확인 후 대시보드에서 공유 계정 정보를 확인하고 이용을 시작할 수 있습니다."}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="flex h-12 items-center justify-center rounded-full bg-slate-50 text-sm font-bold text-slate-700 ring-1 ring-slate-100 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                다시 확인
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#00A86B] text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#00875A] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Icon
                      icon="solar:refresh-circle-bold"
                      className="h-4 w-4 animate-spin"
                    />
                    처리 중
                  </>
                ) : (
                  "완료했어요"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
