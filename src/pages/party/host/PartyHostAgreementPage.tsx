import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type AgreementKey =
  | "settlement"
  | "fee"
  | "financial"
  | "privacy"
  | "operation";

type AgreementItem = {
  key: AgreementKey;
  title: string;
  summary: string;
  detailTitle: string;
  detailContent: string[];
  required: boolean;
};

type AgreementState = Record<AgreementKey, boolean>;

type AuthorizeUrlResponse = {
  authorizeUrl?: string;
  data?: {
    authorizeUrl?: string;
  };
};

type ErrorResponse = {
  message?: string;
};

const agreementItems: AgreementItem[] = [
  {
    key: "settlement",
    title: "정산 지급 정책 동의",
    summary: "파티장에게 정산이 지급되는 방식과 시점을 확인합니다.",
    detailTitle: "정산 지급 정책 동의",
    detailContent: [
      "Submate는 파티원이 플랫폼을 통해 결제한 금액을 기준으로 정산을 처리합니다.",
      "파티장 정산은 서비스 정책 및 지급 기준에 따라 일정 시점에 지급될 수 있으며, 결제 시점과 실제 지급 시점은 다를 수 있습니다.",
      "정산 처리 과정에서 결제 상태, 운영 상태, 검수 또는 시스템 사유에 따라 지급이 일부 지연될 수 있습니다.",
      "정산 관련 내역은 서비스 내 기록을 통해 확인할 수 있으며, 운영 안정성을 위해 필요한 범위에서 보관될 수 있습니다.",
    ],
    required: true,
  },
  {
    key: "fee",
    title: "수수료 및 차감 구조 동의",
    summary: "플랫폼 수수료 차감 후 정산되는 구조를 확인합니다.",
    detailTitle: "수수료 및 차감 구조 동의",
    detailContent: [
      "파티장 정산금은 플랫폼 정책에 따라 일정 수수료가 차감된 후 지급될 수 있습니다.",
      "수수료율, 차감 기준, 적용 방식은 서비스 운영 정책에 따르며, 변경 시 고지된 정책이 우선 적용됩니다.",
      "결제 취소, 정산 보류, 정책 위반, 오류 대응 등의 사유가 있는 경우 일부 금액이 차감 또는 보류될 수 있습니다.",
      "이용자는 파티 운영과 정산이 개인 간 직접 송금이 아니라 플랫폼 중개 구조로 처리된다는 점을 이해하고 동의합니다.",
    ],
    required: true,
  },
  {
    key: "financial",
    title: "계좌정보 등록 및 금융정보 이용 동의",
    summary: "정산 계좌 등록과 지급 처리 목적의 금융정보 활용을 확인합니다.",
    detailTitle: "계좌정보 등록 및 금융정보 이용 동의",
    detailContent: [
      "Submate는 파티장 정산 지급을 위해 은행명, 계좌번호, 예금주명 등 필요한 금융정보를 수집 및 이용할 수 있습니다.",
      "입력된 계좌정보는 정산 지급, 지급 오류 대응, 계좌 확인, 분쟁 대응 및 고객 지원 목적 범위에서 활용될 수 있습니다.",
      "허위 계좌정보 또는 타인 명의 계좌 입력 시 파티 생성 또는 정산 기능 이용이 제한될 수 있습니다.",
      "관련 법령 및 내부 보안 정책에 따라 금융정보는 필요한 기간 동안 안전하게 보관 및 관리됩니다.",
    ],
    required: true,
  },
  {
    key: "privacy",
    title: "개인정보 수집 및 이용 동의",
    summary:
      "본인인증, 파티 운영, 정산 처리 목적의 개인정보 활용을 확인합니다.",
    detailTitle: "개인정보 수집 및 이용 동의",
    detailContent: [
      "서비스는 본인확인, 파티 생성, 계좌 등록, 정산 처리, 고객 문의 대응, 기록 관리 등을 위해 필요한 개인정보를 수집 및 이용할 수 있습니다.",
      "수집 항목에는 이름, 휴대폰번호, 인증 결과 정보, 계좌 관련 정보, 서비스 이용 이력 등이 포함될 수 있습니다.",
      "수집된 정보는 관련 법령 및 내부 정책에 따라 보호되며, 필요한 범위 내에서만 활용됩니다.",
      "세부 내용은 서비스 개인정보 처리방침 및 운영 정책을 따릅니다.",
    ],
    required: true,
  },
  {
    key: "operation",
    title: "파티 운영 책임 및 정책 이해 확인",
    summary:
      "파티장으로서 운영 정책과 책임 범위를 충분히 이해했음을 확인합니다.",
    detailTitle: "파티 운영 책임 및 정책 이해 확인",
    detailContent: [
      "파티장은 본인이 선택한 상품과 운영 방식에 따라 파티를 개설하고 운영할 책임이 있습니다.",
      "공석 발생, 파티원 변경, 운영 제한, 비정상 이용 대응 등은 플랫폼 정책에 따라 처리될 수 있습니다.",
      "허위 정보 입력, 정책 위반, 운영 질서 저해, 비정상적인 파티 운영이 확인될 경우 서비스 이용이 제한될 수 있습니다.",
      "본인은 파티장 등록 전 필요한 정책을 충분히 확인했으며, 이후 단계에서 본인인증 및 계좌 등록이 진행된다는 점을 이해합니다.",
    ],
    required: true,
  },
];

const initialAgreementState: AgreementState = {
  settlement: false,
  fee: false,
  financial: false,
  privacy: false,
  operation: false,
};

function getAuthorizeUrl(responseData: AuthorizeUrlResponse) {
  return responseData.authorizeUrl ?? responseData.data?.authorizeUrl ?? "";
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof (error.response.data as ErrorResponse).message === "string"
  ) {
    return (error.response.data as ErrorResponse).message;
  }

  return "계좌인증 요청에 실패했습니다.";
}

function AgreementModal({
  item,
  open,
  agreed,
  onClose,
  onAgree,
}: {
  item: AgreementItem | null;
  open: boolean;
  agreed: boolean;
  onClose: () => void;
  onAgree: (key: AgreementKey) => void;
}) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 sm:items-center sm:p-6">
      <div className="flex h-[88vh] w-full max-w-[720px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_32px_80px_-24px_rgba(15,23,42,0.35)] sm:h-auto sm:max-h-[85vh] sm:rounded-[32px]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
          <div className="pr-4">
            <div className="inline-flex items-center rounded-full bg-[#EEF4FF] px-3 py-1 text-[11px] font-semibold text-[#1E3A8A]">
              필수 동의
            </div>
            <h2 className="mt-3 text-[20px] font-semibold tracking-tight text-slate-950 sm:text-[24px]">
              {item.detailTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <Icon icon="meteor-icons:xmark" className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="space-y-4">
            {item.detailContent.map((paragraph, index) => (
              <div
                key={`${item.key}-${index}`}
                className="rounded-[22px] bg-slate-50 px-4 py-4 sm:px-5"
              >
                <p className="text-[14px] leading-7 text-slate-600 sm:text-[15px]">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-7 sm:py-5">
          <button
            type="button"
            onClick={() => onAgree(item.key)}
            className={[
              "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[15px] font-semibold transition",
              agreed
                ? "bg-[#E8F0FE] text-[#1E3A8A]"
                : "bg-[#1E3A8A] text-white shadow-[0_20px_46px_-24px_rgba(30,58,138,0.42)] hover:bg-[#1D4ED8]",
            ].join(" ")}
          >
            <Icon
              icon={
                agreed ? "solar:check-circle-bold" : "solar:check-read-bold"
              }
              className="h-5 w-5"
            />
            {agreed ? "동의 완료" : "내용 확인 후 동의하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AgreementCard({
  item,
  checked,
  onOpen,
}: {
  item: AgreementItem;
  checked: boolean;
  onOpen: (item: AgreementItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={[
        "group w-full rounded-[28px] border px-5 py-5 text-left transition sm:px-6 sm:py-6",
        checked
          ? "border-[#D6E4FF] bg-[#F8FBFF] shadow-[0_18px_40px_-30px_rgba(30,58,138,0.18)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition",
            checked
              ? "bg-[#1E3A8A] text-white"
              : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600",
          ].join(" ")}
        >
          <Icon
            icon={checked ? "meteor-icons:check" : "solar:document-text-linear"}
            className="h-5 w-5"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[16px] font-semibold tracking-tight text-slate-950 sm:text-[17px]">
              {item.title}
            </p>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              필수
            </span>
          </div>

          <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
            {item.summary}
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1E3A8A]">
            {checked ? "동의 완료" : "자세히 보기"}
            <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4" />
          </div>
        </div>
      </div>
    </button>
  );
}

export default function PartyHostAgreementPage() {
  const { productId = "" } = useParams<{ productId: string }>();

  const [agreements, setAgreements] = useState<AgreementState>(
    initialAgreementState,
  );
  const [openedItem, setOpenedItem] = useState<AgreementItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredItems = useMemo(() => {
    return agreementItems.filter((item) => item.required);
  }, []);

  const agreedRequiredCount = useMemo(() => {
    return requiredItems.filter((item) => agreements[item.key]).length;
  }, [agreements, requiredItems]);

  const allRequiredChecked = useMemo(() => {
    return requiredItems.every((item) => agreements[item.key]);
  }, [agreements, requiredItems]);

  const handleOpenItem = (item: AgreementItem) => {
    setOpenedItem(item);
  };

  const handleCloseModal = () => {
    setOpenedItem(null);
  };

  const handleAgreeItem = (key: AgreementKey) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: true,
    }));
    setOpenedItem(null);
  };

  const handleAgreeAll = () => {
    const nextState = agreementItems.reduce<AgreementState>((acc, item) => {
      acc[item.key] = true;
      return acc;
    }, {} as AgreementState);

    setAgreements(nextState);
  };

  const handleGoNext = async () => {
    if (isSubmitting) return;

    if (!allRequiredChecked) {
      toast.error("필수 약관에 모두 동의해 주세요.");
      return;
    }

    const trimmedProductId = productId.trim();

    if (!trimmedProductId) {
      toast.error("유효한 상품 ID가 아닙니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.get<AuthorizeUrlResponse>(
        "/api/v1/bank/authorize-url",
        {
          params: {
            productId: trimmedProductId,
          },
        },
      );

      const authorizeUrl = getAuthorizeUrl(response.data);

      if (!authorizeUrl) {
        toast.error("계좌인증 URL을 가져오지 못했습니다.");
        return;
      }

      window.location.href = authorizeUrl;
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F2F4F7]">
        <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-12">
          <section className="rounded-[32px] bg-white px-5 py-7 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)] sm:px-8 sm:py-9">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-full bg-[#EEF4FF] px-3 py-1.5 text-[12px] font-semibold text-[#1E3A8A]">
                HOST AGREEMENT
              </div>
              <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-500">
                {agreedRequiredCount}/{requiredItems.length}
              </div>
            </div>

            <div className="mt-5">
              <h1 className="text-[30px] font-semibold tracking-tight text-slate-950 sm:text-[36px]">
                파티장 등록 전 동의가 필요해요
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-slate-500">
                각 항목을 눌러 내용을 확인한 뒤 동의해 주세요.
                <br className="hidden sm:block" />
                모든 필수 항목에 동의하면 다음 단계에서 본인인증을 진행할 수
                있습니다.
              </p>
            </div>

            <div className="mt-7 rounded-[28px] bg-slate-50 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1E3A8A] shadow-[0_10px_30px_-20px_rgba(30,58,138,0.45)]">
                  <Icon icon="solar:shield-check-bold" className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold tracking-tight text-slate-950">
                    빠르게 한 번에 동의할 수도 있어요
                  </p>
                  <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                    정산, 수수료, 계좌정보 처리 등 파티장 등록에 필요한 내용을
                    이미 충분히 확인하셨다면 전체 동의 후 바로 다음 단계로
                    이동할 수 있습니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAgreeAll}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-[#1E3A8A] shadow-[0_10px_24px_-18px_rgba(30,58,138,0.35)] transition hover:bg-[#F8FBFF]"
                >
                  전체 동의
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {agreementItems.map((item) => (
                <AgreementCard
                  key={item.key}
                  item={item}
                  checked={agreements[item.key]}
                  onOpen={handleOpenItem}
                />
              ))}
            </div>

            <div className="mt-8 rounded-[28px] bg-[#F8FAFC] px-5 py-5 sm:px-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500">
                  <Icon icon="solar:info-circle-linear" className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[15px] font-semibold text-slate-900">
                    안내
                  </p>
                  <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                    계좌인증 버튼을 누르면 인증 URL을 받은 뒤 오픈뱅킹 인증
                    페이지로 이동합니다. 인증과 계좌등록이 끝나면 다시 서비스로
                    돌아와 다음 단계를 이어서 진행합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.14)] sm:px-6 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-slate-400">
                    필수 동의 진행 상태
                  </p>
                  <p className="mt-1 text-[17px] font-semibold tracking-tight text-slate-950">
                    {agreedRequiredCount} / {requiredItems.length} 완료
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoNext}
                  disabled={!allRequiredChecked || isSubmitting}
                  className={[
                    "inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl px-6 text-[15px] font-semibold transition sm:min-w-[220px]",
                    allRequiredChecked && !isSubmitting
                      ? "bg-[#1E3A8A] text-white shadow-[0_20px_46px_-24px_rgba(30,58,138,0.42)] hover:bg-[#1D4ED8]"
                      : "cursor-not-allowed bg-slate-200 text-slate-400",
                  ].join(" ")}
                >
                  {isSubmitting ? "이동 중..." : "계좌인증 단계로 이동"}
                  <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AgreementModal
        item={openedItem}
        open={openedItem !== null}
        agreed={openedItem ? agreements[openedItem.key] : false}
        onClose={handleCloseModal}
        onAgree={handleAgreeItem}
      />
    </>
  );
}
