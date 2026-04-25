import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type AgreementKey =
  | "service"
  | "refund"
  | "settlement"
  | "privacy"
  | "eligibility";

type AgreementItem = {
  key: AgreementKey;
  title: string;
  summary: string;
  detailTitle: string;
  detailContent: string[];
  required: boolean;
};

type AgreementState = Record<AgreementKey, boolean>;

const agreementItems: AgreementItem[] = [
  {
    key: "service",
    title: "공동구독 이용 및 운영 정책",
    summary: "이용권 기준, 참여 방식, 이용 시작 조건을 확인합니다.",
    detailTitle: "공동구독 이용 및 운영 정책",
    detailContent: [
      "Submate의 파티원 참여는 단순 예약이 아니라 1개월 이용권 참여를 의미합니다.",
      "파티 참여가 완료되면 해당 회차 이용 기간 동안 서비스 이용이 가능합니다.",
      "파티 구성, 공석 충원, 운영 상태 반영 등은 플랫폼 정책에 따라 처리됩니다.",
      "파티 운영 안정성을 위해 일부 참여 조건 및 이용 제한이 적용될 수 있습니다.",
    ],
    required: true,
  },
  {
    key: "refund",
    title: "환불 불가 및 중도 탈퇴 정책",
    summary: "중도 탈퇴 시에도 환불이 제공되지 않는 정책을 확인합니다.",
    detailTitle: "환불 불가 및 중도 탈퇴 정책",
    detailContent: [
      "파티원 결제는 월 단위 이용권 기준으로 처리되며, 결제 완료 후 환불은 제공되지 않습니다.",
      "중도 탈퇴, 개인 사유, 단순 변심 등의 사유로도 환불 또는 부분 환급은 적용되지 않습니다.",
      "이용 중 탈퇴하더라도 해당 회차 종료일까지 이용 가능 여부는 운영 정책에 따라 처리됩니다.",
      "일할 계산, 잔여 기간 기준 재정산, 부분 차감 환불은 제공되지 않습니다.",
    ],
    required: true,
  },
  {
    key: "settlement",
    title: "결제 및 정산 정책",
    summary: "결제 처리 방식과 플랫폼 정산 구조를 확인합니다.",
    detailTitle: "결제 및 정산 정책",
    detailContent: [
      "파티원 결제는 플랫폼을 통해 처리되며, 개인 간 직접 송금 방식이 아닙니다.",
      "결제와 참여 기록은 운영 및 분쟁 대응을 위해 시스템에 기록될 수 있습니다.",
      "정산은 서비스 정책에 따라 파티장에게 전달되며, 수수료 및 운영 기준이 반영될 수 있습니다.",
      "결제 실패, 승인 오류, 이용 제한 등의 경우 참여가 완료되지 않을 수 있습니다.",
    ],
    required: true,
  },
  {
    key: "privacy",
    title: "개인정보 수집 및 이용",
    summary:
      "본인 확인, 결제 처리, 참여 기록 관리 목적의 정보 활용을 확인합니다.",
    detailTitle: "개인정보 수집 및 이용",
    detailContent: [
      "서비스는 본인 확인, 결제 처리, 파티 참여 상태 관리, 고객 문의 대응을 위해 필요한 정보를 수집 및 이용할 수 있습니다.",
      "수집된 정보는 관련 법령 및 내부 정책에 따라 보호되며, 필요한 범위 내에서만 활용됩니다.",
      "결제 기록, 이용 이력, 참여 상태 등은 운영 원장 및 감사 목적의 기록으로 보관될 수 있습니다.",
      "세부 내용은 서비스 개인정보 처리방침 및 운영 정책을 따릅니다.",
    ],
    required: true,
  },
  {
    key: "eligibility",
    title: "참여 자격 및 정책 이해 확인",
    summary: "본인이 정책을 충분히 이해하고 참여 자격을 확인했음을 동의합니다.",
    detailTitle: "참여 자격 및 정책 이해 확인",
    detailContent: [
      "본인은 서비스 이용 조건, 참여 구조, 결제 및 환불 정책을 충분히 확인했습니다.",
      "본인은 본인 책임 하에 파티 참여를 진행하며, 허위 정보로 인한 문제는 본인에게 책임이 있을 수 있습니다.",
      "정책 미확인으로 인한 오해나 분쟁을 줄이기 위해 각 항목 내용을 충분히 읽고 동의해야 합니다.",
      "동의를 완료하면 다음 단계에서 결제 정보 입력 및 참여 절차가 진행됩니다.",
    ],
    required: true,
  },
];

const initialAgreementState: AgreementState = {
  service: false,
  refund: false,
  settlement: false,
  privacy: false,
  eligibility: false,
};

function getPaymentPath(productId: string) {
  return `/party/create/${productId}/member/auto-pay-agreement`;
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
  if (!open || !item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 sm:items-center sm:p-6">
      <div className="flex h-[88vh] w-full max-w-[720px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_32px_80px_-24px_rgba(15,23,42,0.35)] sm:h-auto sm:max-h-[85vh] sm:rounded-[32px]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
          <div className="pr-4">
            <div className="inline-flex items-center rounded-full bg-[#ECFEF8] px-3 py-1 text-[11px] font-semibold text-[#0F766E]">
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
                className="rounded-[22px] bg-[#F7FFFD] px-4 py-4 ring-1 ring-inset ring-[#D9FBEF] sm:px-5"
              >
                <p className="text-[14px] leading-7 text-slate-600 sm:text-[15px]">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onAgree(item.key)}
              className={[
                "inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-semibold transition",
                agreed
                  ? "bg-[#E8FFF7] text-[#0F766E]"
                  : "bg-[#14B8A6] text-white shadow-[0_20px_46px_-24px_rgba(20,184,166,0.42)] hover:bg-[#0D9488]",
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
          ? "border-[#C9F7EA] bg-[#F7FFFD] shadow-[0_18px_40px_-30px_rgba(20,184,166,0.18)]"
          : "border-slate-200 bg-white hover:border-[#BFEDE2] hover:bg-[#FCFFFE]",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition",
            checked
              ? "bg-[#14B8A6] text-white"
              : "bg-slate-100 text-slate-400 group-hover:bg-[#ECFEF8] group-hover:text-[#0F766E]",
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

            {item.required ? (
              <span className="inline-flex items-center rounded-full bg-[#ECFEF8] px-2.5 py-1 text-[11px] font-semibold text-[#0F766E]">
                필수
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
            {item.summary}
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0F766E]">
            {checked ? "동의 완료" : "자세히 보기"}
            <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4" />
          </div>
        </div>
      </div>
    </button>
  );
}

export default function PartyMemberAgreementPage() {
  const navigate = useNavigate();
  const { productId = "" } = useParams();

  const [agreements, setAgreements] = useState<AgreementState>(
    initialAgreementState,
  );
  const [openedItem, setOpenedItem] = useState<AgreementItem | null>(null);

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

  const handleGoNext = () => {
    if (!productId || !allRequiredChecked) {
      return;
    }

    navigate(getPaymentPath(productId));
  };

  return (
    <>
      <div className="min-h-screen bg-[#F2F4F7]">
        <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-12">
          <section className="rounded-[32px] bg-white px-5 py-7 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)] sm:px-8 sm:py-9">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-full bg-[#ECFEF8] px-3 py-1.5 text-[12px] font-semibold text-[#0F766E]">
                MEMBER AGREEMENT
              </div>
              <div className="inline-flex items-center rounded-full bg-[#F0FDF9] px-3 py-1.5 text-[12px] font-semibold text-[#0F766E]">
                {agreedRequiredCount}/{requiredItems.length}
              </div>
            </div>

            <div className="mt-5">
              <h1 className="text-[30px] font-semibold tracking-tight text-slate-950 sm:text-[36px]">
                결제 전 동의가 필요해요
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-slate-500">
                각 항목을 눌러 내용을 확인한 뒤 동의해 주세요.
                <br className="hidden sm:block" />
                모든 필수 항목에 동의하면 다음 단계로 진행할 수 있습니다.
              </p>
            </div>

            <div className="mt-7 rounded-[28px] bg-[#F7FFFD] px-5 py-5 ring-1 ring-inset ring-[#D9FBEF] sm:px-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#0F766E] shadow-[0_10px_30px_-20px_rgba(20,184,166,0.45)]">
                  <Icon icon="solar:shield-check-bold" className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold tracking-tight text-slate-950">
                    빠르게 한 번에 동의할 수도 있어요
                  </p>
                  <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                    이미 내용을 충분히 확인하셨다면 전체 동의 후 바로 결제
                    단계로 이동할 수 있습니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAgreeAll}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-[#0F766E] shadow-[0_10px_24px_-18px_rgba(20,184,166,0.35)] transition hover:bg-[#F0FDF9]"
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
                    파티원 참여는 결제와 연결되는 단계라서, 결제 전에 정책
                    내용을 충분히 확인하는 흐름으로 구성하는 것이 좋습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-[#D9FBEF] bg-white px-5 py-5 shadow-[0_18px_48px_-34px_rgba(20,184,166,0.14)] sm:px-6 sm:py-6">
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
                  disabled={!allRequiredChecked}
                  className={[
                    "inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl px-6 text-[15px] font-semibold transition sm:min-w-[220px]",
                    allRequiredChecked
                      ? "bg-[#14B8A6] text-white shadow-[0_20px_46px_-24px_rgba(20,184,166,0.42)] hover:bg-[#0D9488]"
                      : "cursor-not-allowed bg-slate-200 text-slate-400",
                  ].join(" ")}
                >
                  결제 단계로 이동
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
