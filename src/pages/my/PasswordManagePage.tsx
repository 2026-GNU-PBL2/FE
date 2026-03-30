import { Icon } from "@iconify/react";

export default function PasswordManagePage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <SecurityCard
          title="로그인 비밀번호"
          description="정기적으로 비밀번호를 변경하면 계정을 더 안전하게 보호할 수 있어요."
          status="최근 변경 이력 없음"
        />
        <SecurityCard
          title="결제 / 인증 비밀번호"
          description="결제 승인이나 민감한 정보 확인 시 사용할 추가 인증 수단입니다."
          status="등록 여부 연동 필요"
        />
      </div>

      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200">
            <Icon icon="solar:shield-warning-bold" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-base font-bold text-slate-900">보안 안내</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              백엔드 API가 준비되면 비밀번호 변경, 결제 비밀번호 등록/수정, 최근
              변경 시각 표시를 이 화면에 바로 붙이면 됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityCard({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-bold text-slate-900">{title}</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>

      <button
        type="button"
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <Icon icon="solar:key-bold" className="h-5 w-5" />
        변경하기
      </button>
    </div>
  );
}
