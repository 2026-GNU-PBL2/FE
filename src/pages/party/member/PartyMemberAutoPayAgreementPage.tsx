import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type AgreementSection = {
  id: string;
  title: string;
};

const agreementSections: AgreementSection[] = [
  {
    id: "auto-pay-terms",
    title: "자동승인 이용약관",
  },
];

const agreementParagraphs = {
  intro: "이용자 본인은 자동결제 이용과 관련하여 아래의 약관에 동의합니다.",
  consentTitle: "금융거래정보의 제공 동의서",
  consentBody:
    "자동결제 이용과 관련하여 이용자 본인은 이용자 본인이 이용 신청한 결제수단(신용카드, 직불카드, 선불카드(이하 '신용카드 등'이라 합니다), 계좌이체)의 정보[신용카드 등의 카드사(은행)명, 카드번호, 계좌의 은행명, 계좌번호]를 자동결제 이용을 신규 신청하는 때로부터 해지 신청할 때까지 청구기관(청구기관과 청구기관의 결제대행업체를 포함함)에 제공하는 것에 대하여 「금융실명거래 및 비밀보장에 관한 법률」의 규정에 따라 동의합니다.",
  serviceTitle: "자동결제 서비스 이용약관",
  items: [
    "이용자 본인은 본 동의서 및 이용약관에 동의하고 회사가 제공한 방법으로 이용자 본인인증을 하여 본 서비스 이용을 신청하며, 회사의 승인을 얻어 본 서비스를 이용할 수 있습니다.",
    "본 서비스 이용 절차 및 최초 결제인증이 완료된 후, 이용자에 대한 추가 결제인증이나 고지 없이 이용자 본인의 결제정보를 사용하여 청구기관에서 정한 결제일(휴일인 경우 익영업일)에 이용자 본인이 청구기관에 납부하여야 할 요금을 자동결제하여 납부하기로 합니다.",
    "신용카드 등 자동결제를 위하여 지정카드번호로 승인하는 경우에는 신용카드 이용약관, 약정서의 규정 및 관련 법령에서 정한 절차에 따라 승인합니다.",
    "계좌 자동결제는 해당 결제일 영업 시간 내에 입금된 예금(지정출금일에 입금된 타점권은 제외)에 한하여 출금 처리됩니다.",
    "이용자 본인이 신청한 결제수단의 잔액(예금한도, 신용한도 등)이 예정 결제금액보다 부족하거나 지급제한, 연체 등의 사유가 발생하는 등 이용자 본인의 과실에 의해 발생하는 손해의 책임은 이용자 본인에게 있습니다.",
    "자동결제 신규신청에 의한 자동결제 개시일은 청구기관의 사정에 의하여 결정되며 청구기관으로부터 사전 통지받은 결제일을 최초 자동결제 개시일로 하겠습니다.",
    "자동결제 신청(신규, 해지) 또는 변경은 신청 또는 변경을 원하는 결제일 30일 전까지 신청서를 제출하여야 합니다.",
    "자동결제에 따라 결제되는 대금의 구체적인 내용 등은 청구기관의 청구에 따르며 결제 대금 등에 이의가 있는 경우에는 이용자 본인과 청구기관이 해결하여야 청구기관 및 회사는 책임이 없습니다.",
    "결제일에 동일한 수종의 자동결제 청구가 있는 경우 결제 우선 순위는 이용자 본인의 거래 금융기관이 정하는 바에 따릅니다.",
    "이 약관은 신청서를 청구기관에 직접 제출하여 자동결제를 신청한 경우에도 동일하게 적용합니다.",
    "이용자가 금융기관 및 회사가 정하는 기간 동안 자동결제 이용 실적이 없는 경우 사전 통지 후 자동결제를 해지할 수 있습니다.",
  ],
};

function getNextPath(productId: string) {
  return `/party/create/${productId}/member/card-register`;
}

function LeftAgreementItem({
  checked,
  opened,
  onClick,
  title,
}: {
  checked: boolean;
  opened: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-500",
        opened
          ? "border-[#C9F7EA] bg-[#F7FFFD] shadow-[0_14px_30px_-24px_rgba(20,184,166,0.24)]"
          : "border-slate-200 bg-white hover:border-[#BFEDE2] hover:bg-[#FCFFFE]",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={[
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300",
            checked ? "text-[#0F766E]" : "text-slate-300",
          ].join(" ")}
        >
          <Icon
            icon={
              checked ? "solar:check-circle-bold" : "solar:check-circle-linear"
            }
            className="h-5 w-5"
          />
        </div>

        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight text-slate-700">
            {title}
          </span>
          <span className="mt-0.5 block text-xs text-slate-400">
            {checked ? "동의 완료" : "내용 확인 필요"}
          </span>
        </div>
      </div>

      <Icon
        icon="solar:alt-arrow-right-linear"
        className={[
          "h-4 w-4 shrink-0 text-slate-300 transition-all duration-500 group-hover:text-slate-500",
          opened ? "rotate-90 text-[#0F766E]" : "",
        ].join(" ")}
      />
    </button>
  );
}

export default function PartyMemberAutoPayAgreementPage() {
  const navigate = useNavigate();
  const { productId = "" } = useParams();

  const [openedSectionId, setOpenedSectionId] = useState<string | null>(null);
  const [agreedMap, setAgreedMap] = useState<Record<string, boolean>>({
    "auto-pay-terms": false,
  });

  const isAgreementOpened = openedSectionId === "auto-pay-terms";

  const allRequiredAgreed = useMemo(() => {
    return agreementSections.every((section) => agreedMap[section.id]);
  }, [agreedMap]);

  const handleOpenAgreement = (id: string) => {
    setOpenedSectionId((prev) => (prev === id ? null : id));
  };

  const handleToggleAgreement = (id: string) => {
    setAgreedMap((prev) => {
      const nextValue = !prev[id];
      return {
        ...prev,
        [id]: nextValue,
      };
    });

    setOpenedSectionId(null);
  };

  const handleGoNext = () => {
    if (!productId || !allRequiredAgreed) {
      return;
    }

    navigate(getNextPath(productId));
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-310">
        <div className="lg:hidden">
          <div className="mx-auto flex min-h-190 w-full max-w-105 flex-col justify-center">
            <aside
              className={[
                "rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)] transition-all duration-500",
                isAgreementOpened ? "mb-5" : "",
              ].join(" ")}
            >
              <div className="flex min-h-155 flex-col">
                <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
                  <div className="mt-2">
                    <div className="inline-flex items-center rounded-full bg-[#ECFEF8] px-3 py-1 text-xs font-semibold tracking-tight text-[#0F766E]">
                      STEP 03
                    </div>

                    <h1 className="mt-4 text-[26px] font-semibold leading-[1.35] tracking-tight text-slate-950 sm:text-[28px]">
                      서비스 이용을 위해
                      <br />
                      약관에 동의해주세요
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      자동승인 결제를 위한 필수 약관입니다.
                      <br />
                      내용을 확인한 뒤 다음 단계로 이동해주세요.
                    </p>
                  </div>

                  <div className="mt-7 space-y-2.5">
                    {agreementSections.map((section) => (
                      <LeftAgreementItem
                        key={section.id}
                        title={section.title}
                        checked={!!agreedMap[section.id]}
                        opened={openedSectionId === section.id}
                        onClick={() => handleOpenAgreement(section.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-auto px-5 pb-5 sm:px-6 sm:pb-6">
                  <button
                    type="button"
                    onClick={handleGoNext}
                    disabled={!allRequiredAgreed}
                    className={[
                      "inline-flex h-14 w-full items-center justify-center rounded-2xl text-base font-semibold tracking-tight transition-all duration-300",
                      allRequiredAgreed
                        ? "bg-[#14B8A6] text-white shadow-[0_18px_36px_-20px_rgba(20,184,166,0.45)] hover:bg-[#0D9488] hover:shadow-[0_22px_42px_-22px_rgba(20,184,166,0.52)]"
                        : "cursor-not-allowed bg-slate-200 text-slate-400",
                    ].join(" ")}
                  >
                    다음 단계로 이동
                  </button>
                </div>
              </div>
            </aside>

            <div
              className={[
                "overflow-hidden transition-all duration-500 ease-out",
                isAgreementOpened
                  ? "max-h-750 translate-y-0 opacity-100"
                  : "pointer-events-none max-h-0 -translate-y-3 opacity-0",
              ].join(" ")}
            >
              <section id="auto-pay-terms">
                <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.18)] transition-all duration-500 sm:px-6 sm:py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.14em] text-[#0F766E]">
                        REQUIRED AGREEMENT
                      </p>
                      <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900">
                        자동승인 이용약관
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECFEF8] text-[#0F766E]">
                      <Icon
                        icon="solar:document-text-bold"
                        className="h-5 w-5"
                      />
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-500">
                    {agreementParagraphs.intro}
                  </p>

                  <div className="mt-8 rounded-2xl bg-[#F7FFFD] px-4 py-4 ring-1 ring-inset ring-[#D9FBEF]">
                    <h3 className="text-[18px] font-semibold tracking-tight text-slate-900">
                      {agreementParagraphs.consentTitle}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {agreementParagraphs.consentBody}
                    </p>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-[18px] font-semibold tracking-tight text-slate-900">
                      {agreementParagraphs.serviceTitle}
                    </h3>

                    <ol className="mt-5 space-y-4">
                      {agreementParagraphs.items.map((item, index) => (
                        <li
                          key={`${index}-${item}`}
                          className="grid grid-cols-[24px_minmax(0,1fr)] gap-3"
                        >
                          <span className="pt-0.5 text-sm font-semibold text-[#0F766E]">
                            {index + 1}.
                          </span>
                          <p className="text-sm leading-7 text-slate-600">
                            {item}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] border border-[#D9FBEF] bg-[#F7FFFD] px-5 py-5 shadow-[0_10px_24px_-20px_rgba(20,184,166,0.28)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ECFEF8] text-[#0F766E]">
                      <Icon
                        icon="solar:shield-check-bold"
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold tracking-tight text-slate-900">
                        다음 단계에서 카드 등록이 진행됩니다
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        약관 동의 후에는 자동승인을 위한 카드 등록 단계로
                        이동합니다. 등록된 카드 정보는 이후 정기 결제 승인
                        절차에 사용될 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] border border-slate-200 bg-white px-5 py-4">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          agreedMap["auto-pay-terms"]
                            ? "text-[#0F766E]"
                            : "text-slate-300",
                        ].join(" ")}
                      >
                        <Icon
                          icon={
                            agreedMap["auto-pay-terms"]
                              ? "solar:check-circle-bold"
                              : "solar:check-circle-linear"
                          }
                          className="h-5 w-5"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold tracking-tight text-slate-900">
                          자동승인 이용약관에 동의합니다
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          필수 약관에 동의해야 다음 단계로 진행할 수 있습니다.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAgreement("auto-pay-terms")}
                      className={[
                        "inline-flex h-10 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-all duration-300",
                        agreedMap["auto-pay-terms"]
                          ? "bg-[#ECFEF8] text-[#0F766E] hover:bg-[#DDFBF1]"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      ].join(" ")}
                    >
                      {agreedMap["auto-pay-terms"] ? "동의 완료" : "동의하기"}
                    </button>
                  </label>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="relative hidden min-h-190 lg:block">
          <div
            className={[
              "absolute inset-y-0 z-20 w-90 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isAgreementOpened
                ? "left-0 translate-x-0"
                : "left-1/2 -translate-x-1/2",
            ].join(" ")}
          >
            <aside className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)]">
              <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
                <div className="mt-2">
                  <div className="inline-flex items-center rounded-full bg-[#ECFEF8] px-3 py-1 text-xs font-semibold tracking-tight text-[#0F766E]">
                    STEP 03
                  </div>

                  <h1 className="mt-4 text-[26px] font-semibold leading-[1.35] tracking-tight text-slate-950 sm:text-[28px]">
                    서비스 이용을 위해
                    <br />
                    약관에 동의해주세요
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    자동승인 결제를 위한 필수 약관입니다.
                    <br />
                    내용을 확인한 뒤 다음 단계로 이동해주세요.
                  </p>
                </div>

                <div className="mt-7 space-y-2.5">
                  {agreementSections.map((section) => (
                    <LeftAgreementItem
                      key={section.id}
                      title={section.title}
                      checked={!!agreedMap[section.id]}
                      opened={openedSectionId === section.id}
                      onClick={() => handleOpenAgreement(section.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-auto px-5 pb-5 sm:px-6 sm:pb-6">
                <button
                  type="button"
                  onClick={handleGoNext}
                  disabled={!allRequiredAgreed}
                  className={[
                    "inline-flex h-14 w-full items-center justify-center rounded-2xl text-base font-semibold tracking-tight transition-all duration-300",
                    allRequiredAgreed
                      ? "bg-[#14B8A6] text-white shadow-[0_18px_36px_-20px_rgba(20,184,166,0.45)] hover:bg-[#0D9488] hover:shadow-[0_22px_42px_-22px_rgba(20,184,166,0.52)]"
                      : "cursor-not-allowed bg-slate-200 text-slate-400",
                  ].join(" ")}
                >
                  다음 단계로 이동
                </button>
              </div>
            </aside>
          </div>

          <div
            className={[
              "absolute inset-y-0 right-0 w-[calc(100%-392px)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isAgreementOpened
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-10 opacity-0",
            ].join(" ")}
          >
            <main className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-[#FCFDFE] shadow-[0_18px_50px_-30px_rgba(15,23,42,0.12)]">
              <div className="flex h-full flex-col">
                <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 items-center rounded-full border border-slate-200 bg-white px-3">
                      <span className="text-sm font-bold tracking-tight text-slate-900">
                        payments
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">
                      자동승인 약관 확인
                    </span>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden px-5 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
                  <div className="mx-auto h-full w-full max-w-190 overflow-y-auto">
                    <section id="auto-pay-terms">
                      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.18)] transition-all duration-500 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold tracking-[0.14em] text-[#0F766E]">
                              REQUIRED AGREEMENT
                            </p>
                            <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900 sm:text-[28px]">
                              자동승인 이용약관
                            </h2>
                          </div>

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECFEF8] text-[#0F766E]">
                            <Icon
                              icon="solar:document-text-bold"
                              className="h-5 w-5"
                            />
                          </div>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-[15px]">
                          {agreementParagraphs.intro}
                        </p>

                        <div className="mt-8 rounded-2xl bg-[#F7FFFD] px-4 py-4 ring-1 ring-inset ring-[#D9FBEF] sm:px-5 sm:py-5">
                          <h3 className="text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[20px]">
                            {agreementParagraphs.consentTitle}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-[15px]">
                            {agreementParagraphs.consentBody}
                          </p>
                        </div>

                        <div className="mt-8">
                          <h3 className="text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[20px]">
                            {agreementParagraphs.serviceTitle}
                          </h3>

                          <ol className="mt-5 space-y-4">
                            {agreementParagraphs.items.map((item, index) => (
                              <li
                                key={`${index}-${item}`}
                                className="grid grid-cols-[24px_minmax(0,1fr)] gap-3"
                              >
                                <span className="pt-0.5 text-sm font-semibold text-[#0F766E]">
                                  {index + 1}.
                                </span>
                                <p className="text-sm leading-7 text-slate-600 sm:text-[15px]">
                                  {item}
                                </p>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[20px] border border-[#D9FBEF] bg-[#F7FFFD] px-5 py-5 shadow-[0_10px_24px_-20px_rgba(20,184,166,0.28)] sm:px-6 sm:py-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ECFEF8] text-[#0F766E]">
                            <Icon
                              icon="solar:shield-check-bold"
                              className="h-5 w-5"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold tracking-tight text-slate-900">
                              다음 단계에서 카드 등록이 진행됩니다
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              약관 동의 후에는 자동승인을 위한 카드 등록 단계로
                              이동합니다. 등록된 카드 정보는 이후 정기 결제 승인
                              절차에 사용될 수 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[20px] border border-slate-200 bg-white px-5 py-4 sm:px-6">
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={[
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                agreedMap["auto-pay-terms"]
                                  ? "text-[#0F766E]"
                                  : "text-slate-300",
                              ].join(" ")}
                            >
                              <Icon
                                icon={
                                  agreedMap["auto-pay-terms"]
                                    ? "solar:check-circle-bold"
                                    : "solar:check-circle-linear"
                                }
                                className="h-5 w-5"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold tracking-tight text-slate-900">
                                자동승인 이용약관에 동의합니다
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                필수 약관에 동의해야 다음 단계로 진행할 수
                                있습니다.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleAgreement("auto-pay-terms")
                            }
                            className={[
                              "inline-flex h-10 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-all duration-300",
                              agreedMap["auto-pay-terms"]
                                ? "bg-[#ECFEF8] text-[#0F766E] hover:bg-[#DDFBF1]"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                            ].join(" ")}
                          >
                            {agreedMap["auto-pay-terms"]
                              ? "동의 완료"
                              : "동의하기"}
                          </button>
                        </label>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
