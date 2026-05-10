import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type PartyVacancyDetail = {
  partyId: number;
  productId: string;
  productName: string;
  thumbnailUrl: string;
  hostUserId: number;
  totalCapacity: number;
  currentMemberCount: number;
  remainingSeatCount: number;
  monthlyPaymentAmount: number;
  nextPaymentDate: string | null;
  operationType: string;
  recruitStatus: string;
  operationStatus: string;
  vacancyType: string;
  joinAvailable: boolean;
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

function formatPrice(value?: number | null) {
  if (typeof value !== "number") return "-";
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatOperationType(value?: string) {
  if (value === "ACCOUNT_SHARE") return "계정 공유";
  if (value === "INVITE_CODE") return "초대 코드";
  return value || "-";
}

function formatRecruitStatus(value?: string) {
  if (value === "RECRUITING") return "모집중";
  if (value === "CLOSED") return "모집 종료";
  return value || "-";
}

function formatOperationStatus(value?: string) {
  if (value === "WAITING_START") return "시작 대기";
  if (value === "ACTIVE") return "운영중";
  if (value === "ENDED") return "종료";
  return value || "-";
}

function formatVacancyType(value?: string) {
  if (value === "NONE") return "결원 없음";
  if (value === "SCHEDULED") return "결원 예정";
  if (value === "VACANT") return "결원";
  if (value === "HOST") return "파티장 결원";
  if (value === "MEMBER") return "파티원 결원";
  return value || "-";
}

export default function PartyVacancyDetailPage() {
  const navigate = useNavigate();
  const { type, partyId } = useParams<{
    type: "hosts" | "members";
    partyId: string;
  }>();
  const [detail, setDetail] = useState<PartyVacancyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isHostRecruit = type === "hosts";
  const isMemberRecruit = type === "members";

  const pageTone = isHostRecruit
    ? {
        text: "text-[#1E3A8A]",
        bg: "bg-[#1E3A8A]",
        lightBg: "bg-blue-50",
        panelBg: "bg-[#F8FAFF]",
        ring: "ring-blue-100",
        panelRing: "ring-blue-100",
        buttonHover: "hover:bg-blue-800",
        action: "파티장 참여하기",
        caption: "HOST VACANCY",
        headline: "파티장 참여 정보를 확인해 주세요",
        description:
          "파티장 참여 전 상품 정보, 다음 회차 기준 인원 현황, 월 결제 금액을 확인합니다.",
        noticeTitle: "파티장 참여 안내",
      }
    : {
        text: "text-[#0F766E]",
        bg: "bg-[#14B8A6]",
        lightBg: "bg-[#ECFEF8]",
        panelBg: "bg-[#F7FFFD]",
        ring: "ring-[#C9F7EA]",
        panelRing: "ring-[#D9FBEF]",
        buttonHover: "hover:bg-[#0D9488]",
        action: "파티원 참여하기",
        caption: "MEMBER VACANCY",
        headline: "파티원 참여 정보를 확인해 주세요",
        description:
          "파티원 참여 전 상품 정보, 다음 회차 기준 인원 현황, 월 결제 금액을 확인합니다.",
        noticeTitle: "파티원 참여 안내",
      };

  useEffect(() => {
    let mounted = true;

    const fetchDetail = async () => {
      if (!isHostRecruit && !isMemberRecruit) {
        navigate("/parties", { replace: true });
        return;
      }

      if (!partyId) {
        toast.error("파티 정보가 올바르지 않습니다.");
        navigate(`/parties/${type}`, { replace: true });
        return;
      }

      try {
        setIsLoading(true);

        const response = await api.get<
          PartyVacancyDetail | ApiEnvelope<PartyVacancyDetail>
        >(`/api/v1/party-vacancy/${type}/${partyId}`);

        const payload = unwrapResponse<PartyVacancyDetail>(response.data);
        console.log(payload);
        if (!mounted) return;

        if (!payload) {
          toast.error("결원 파티 상세 정보를 불러오지 못했습니다.");
          setDetail(null);
          return;
        }

        setDetail(payload);
      } catch (error) {
        if (!mounted) return;

        console.error("결원 파티 상세 조회 실패", error);
        toast.error("결원 파티 상세 정보를 불러오지 못했습니다.");
        setDetail(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchDetail();

    return () => {
      mounted = false;
    };
  }, [isHostRecruit, isMemberRecruit, navigate, partyId, type]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[520px] items-center justify-center">
          <section className="w-full rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)]">
            <Icon
              icon="solar:refresh-circle-bold"
              className={`mx-auto h-10 w-10 animate-spin ${pageTone.text}`}
            />
            <p className="mt-4 text-[16px] font-semibold text-slate-950">
              결원 파티 정보를 불러오는 중입니다
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[520px] items-center justify-center">
          <section className="w-full rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)]">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${pageTone.lightBg} ${pageTone.text}`}
            >
              <Icon icon="solar:info-circle-bold" className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-[24px] font-semibold tracking-tight text-slate-950">
              파티 정보를 확인할 수 없습니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              잠시 후 다시 시도해 주세요.
            </p>
          </section>
        </div>
      </div>
    );
  }

  const infoRows = [
    {
      label: "현재 인원",
      value: `${detail.currentMemberCount}/${detail.totalCapacity}명`,
    },
    { label: "남은 자리", value: `${detail.remainingSeatCount}명` },
    { label: "다음 결제일", value: formatDate(detail.nextPaymentDate) },
    { label: "운영 방식", value: formatOperationType(detail.operationType) },
    { label: "모집 상태", value: formatRecruitStatus(detail.recruitStatus) },
    {
      label: "운영 상태",
      value: formatOperationStatus(detail.operationStatus),
    },
    { label: "결원 상태", value: formatVacancyType(detail.vacancyType) },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F7] px-4 py-10 sm:px-6">
      <main className="mx-auto w-full max-w-[640px]">
        <div className="mb-8">
          <div
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-semibold ${pageTone.lightBg} ${pageTone.text}`}
          >
            {pageTone.caption}
          </div>

          <h1 className="mt-4 text-[30px] font-semibold leading-tight tracking-tight text-slate-950 sm:text-[36px]">
            {pageTone.headline}
          </h1>

          <p className="mt-4 text-[15px] leading-7 text-slate-500">
            {pageTone.description}
          </p>
        </div>

        <section className="rounded-[32px] bg-white px-5 py-6 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)] sm:px-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${pageTone.lightBg}`}
            >
              {detail.thumbnailUrl ? (
                <img
                  src={detail.thumbnailUrl}
                  alt={detail.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon
                  icon="solar:play-circle-bold"
                  className={`h-7 w-7 ${pageTone.text}`}
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">선택한 파티</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-slate-950">
                {detail.productName}
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-400">
                {detail.joinAvailable ? "참여 가능" : "참여 불가"}
              </p>
            </div>
          </div>

          <div
            className={`mt-7 rounded-[28px] px-5 py-5 ring-1 ring-inset ${pageTone.panelBg} ${pageTone.panelRing}`}
          >
            <p className={`text-sm font-medium ${pageTone.text}`}>
              월 결제 금액
            </p>

            <p className="mt-2 text-[34px] font-bold tracking-tight text-slate-950">
              {formatPrice(detail.monthlyPaymentAmount)}
            </p>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            {infoRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 py-4"
              >
                <p className="text-[15px] text-slate-500">{row.label}</p>
                <p className="text-right text-[15px] font-semibold text-slate-950">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`mt-4 rounded-[28px] px-5 py-5 ring-1 ring-inset ${
            detail.joinAvailable
              ? `${pageTone.panelBg} ${pageTone.panelRing}`
              : "bg-white ring-slate-200"
          }`}
        >
          <div className="flex gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                detail.joinAvailable
                  ? `bg-white ${pageTone.text}`
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Icon
                icon={
                  detail.joinAvailable
                    ? "solar:info-circle-bold"
                    : "solar:shield-warning-bold"
                }
                className="h-5 w-5"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-950">
                {detail.joinAvailable ? pageTone.noticeTitle : "참여 제한"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {detail.joinAvailable
                  ? "상품 정보와 금액을 확인한 뒤 참여를 진행해 주세요."
                  : "현재 상태에서는 이 결원 파티에 참여할 수 없습니다."}
              </p>
            </div>
          </div>
        </section>

        <button
          type="button"
          disabled={!detail.joinAvailable}
          className={[
            "mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-semibold text-white shadow-[0_20px_46px_-24px_rgba(20,184,166,0.42)] transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none",
            detail.joinAvailable
              ? `${pageTone.bg} ${pageTone.buttonHover}`
              : "",
          ].join(" ")}
        >
          {pageTone.action}
          <Icon icon="solar:arrow-right-linear" className="h-5 w-5" />
        </button>
      </main>
    </div>
  );
}
