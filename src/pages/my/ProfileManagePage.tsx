import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

function getRoleLabel(role: string | null | undefined) {
  if (role === "CUSTOMER") return "일반 회원";
  if (role === "ADMIN") return "관리자";
  return "미확인";
}

export default function ProfileManagePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  const displayName = user.nickname?.trim() || "닉네임 미설정";
  const displayEmail = user.submateEmail?.trim() || "이메일 미등록";
  const displayPhone = user.phoneNumber?.trim() || "전화번호 미등록";
  const roleLabel = getRoleLabel(user.role);

  const handleGoSetup = () => {
    navigate("/setup/intro");
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="닉네임" value={displayName} />
        <InfoCard label="Submate 이메일" value={displayEmail} />
        <InfoCard label="전화번호" value={displayPhone} />
        <InfoCard label="회원 유형" value={roleLabel} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-900">
              회원 정보 수정 및 추가 정보 입력
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              닉네임, 전화번호, 보안 정보 등은 현재 회원가입/설정 플로우에서
              이어서 관리할 수 있어요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoSetup}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Icon icon="solar:pen-new-square-bold" className="h-5 w-5" />
            정보 수정하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-5 py-5">
      <p className="text-xs font-semibold tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-all text-base font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
