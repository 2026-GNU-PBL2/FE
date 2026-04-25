import { Icon } from "@iconify/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type PartyJoinPreviewResponse = {
  productId: string;
  productName: string;
  thumbnailUrl: string;
  productPricePerMember: number;
  platformFee: number;
  depositAmount: number;
  firstPaymentAmount: number;
  recurringPaymentAmount: number;
  paymentNotice: string;
};

function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export default function PartyMemberPaymentPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId = "" } = useParams();

  const preview = location.state as PartyJoinPreviewResponse | null;

  const handleGoNext = () => {
    navigate(`/party/create/${productId}/member/agreement`);
  };

  if (!preview) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[520px] items-center justify-center">
          <section className="w-full rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFEF8] text-[#0F766E]">
              <Icon icon="solar:info-circle-bold" className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-[24px] font-semibold tracking-tight text-slate-950">
              결제 정보를 불러올 수 없습니다
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              상품을 다시 선택한 뒤 진행해 주세요.
            </p>
          </section>
        </div>
      </div>
    );
  }

  const paymentRows = [
    {
      label: "상품 금액",
      value: preview.productPricePerMember,
    },
    {
      label: "플랫폼 수수료",
      value: preview.platformFee,
    },
    {
      label: "보증금",
      value: preview.depositAmount,
    },
    {
      label: "다음 정산일부터 결제",
      value: preview.recurringPaymentAmount,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F7] px-4 py-10 sm:px-6">
      <main className="mx-auto w-full max-w-[640px]">
        <div className="mb-8">
          <div className="inline-flex items-center rounded-full bg-[#ECFEF8] px-3 py-1.5 text-[12px] font-semibold text-[#0F766E]">
            MEMBER PAYMENT
          </div>

          <h1 className="mt-4 text-[30px] font-semibold leading-tight tracking-tight text-slate-950 sm:text-[36px]">
            결제 금액을 확인해 주세요
          </h1>

          <p className="mt-4 text-[15px] leading-7 text-slate-500">
            선택한 상품으로 파티 참여를 신청하기 전에 상품 금액, 수수료, 보증금,
            다음 정산일부터 결제될 금액을 확인합니다.
          </p>
        </div>

        <section className="rounded-[32px] bg-white px-5 py-6 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)] sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#ECFEF8]">
              {preview.thumbnailUrl ? (
                <img
                  src={preview.thumbnailUrl}
                  alt={preview.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon
                  icon="solar:play-circle-bold"
                  className="h-7 w-7 text-[#0F766E]"
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">선택한 상품</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-slate-950">
                {preview.productName}
              </h2>
            </div>
          </div>

          <div className="mt-7 rounded-[28px] bg-[#F7FFFD] px-5 py-5 ring-1 ring-inset ring-[#D9FBEF]">
            <p className="text-sm font-medium text-[#0F766E]">
              최초 결제 예정 금액
            </p>

            <p className="mt-2 text-[34px] font-bold tracking-tight text-slate-950">
              {formatPrice(preview.firstPaymentAmount)}
            </p>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            {paymentRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 py-4"
              >
                <p className="text-[15px] text-slate-500">{row.label}</p>
                <p className="text-[15px] font-semibold text-slate-950">
                  {formatPrice(row.value)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {preview.paymentNotice ? (
          <section className="mt-4 rounded-[28px] bg-[#F7FFFD] px-5 py-5 ring-1 ring-inset ring-[#D9FBEF]">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#0F766E]">
                <Icon icon="solar:info-circle-bold" className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  결제 안내
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {preview.paymentNotice}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <button
          type="button"
          onClick={handleGoNext}
          className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#14B8A6] px-5 text-[15px] font-semibold text-white shadow-[0_20px_46px_-24px_rgba(20,184,166,0.42)] transition hover:bg-[#0D9488]"
        >
          약관 동의로 이동
        </button>
      </main>
    </div>
  );
}
