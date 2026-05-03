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
      toneClassName: "text-teal-600",
      icon: "solar:checklist-bold",
      checks: [
        "확인 후 열리는 대시보드에서 계정 정보를 확인해주세요.",
        "OTT 접속 후 사용할 개인 프로필은 직접 설정해주세요.",
        "로그인이나 이용 제한 문제가 있으면 고객센터 1:1 문의로 접수해주세요.",
      ],
    };
  }, [isInviteProvision, productName]);

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
  }, [partyId]);

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
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-96 w-full max-w-2xl items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Icon
            icon="solar:refresh-circle-bold"
            className="h-11 w-11 animate-spin text-blue-900"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <p className="text-sm font-bold text-sky-600">
              {guideContent.label}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-950">
              {guideContent.title}
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              {guideContent.description}
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <div className="rounded-3xl bg-slate-50 px-5 py-5 ring-1 ring-slate-200">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 ${guideContent.toneClassName}`}
                >
                  <Icon icon={guideContent.icon} className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    {guideContent.cardTitle}
                  </p>
                  <div className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-600">
                    {guideContent.checks.map((check) => (
                      <p key={check}>{check}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isSubmitting}
              className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-blue-900 text-base font-bold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              확인했어요
            </button>
          </div>
        </section>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white px-5 py-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
              <Icon icon="solar:shield-warning-bold" className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-center text-xl font-extrabold text-slate-950">
              정말 완료하셨나요?
            </h2>
            <p className="mt-3 text-center text-sm font-semibold leading-6 text-slate-500">
              {isInviteProvision
                ? "OTT 계정 활성화와 계정 설정을 모두 완료한 뒤 확인해주세요."
                : "확인 후 대시보드에서 공유 계정 정보를 확인하고 이용을 시작할 수 있습니다."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                다시 확인
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex h-12 items-center justify-center rounded-2xl bg-blue-900 text-sm font-bold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? "처리 중" : "완료했어요"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
