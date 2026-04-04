import { Icon } from "@iconify/react";

export default function PaymentMethodManagePage() {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200">
              <Icon icon="solar:wallet-money-bold" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-base font-bold text-slate-900">
                등록된 결제 수단 없음
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                아직 등록된 카드가 없습니다. 카드 등록 API가 연결되면 기본카드,
                카드 브랜드, 마스킹 번호를 보여주면 됩니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-[linear-gradient(135deg,#1E3A8A_0%,#2563EB_100%)] px-4 text-sm font-semibold text-white transition hover:opacity-95"
          >
            <Icon icon="solar:add-circle-bold" className="h-5 w-5" />
            카드 등록 / 변경
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MiniInfoCard label="기본 카드" value="미등록" />
        <MiniInfoCard label="자동결제" value="연동 전" />
        <MiniInfoCard label="최근 변경 이력" value="내역 없음" />
      </div>
    </div>
  );
}

function MiniInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-5 py-5">
      <p className="text-xs font-semibold tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}
