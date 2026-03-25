import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import SetupShell from "./SetupShell";
import { useSetupStore } from "@/stores/setupStore";

const providerLabelMap = {
  google: "Google",
  kakao: "Kakao",
  naver: "Naver",
};

export default function SetupCompletePage() {
  const navigate = useNavigate();
  const { provider, userId, nickname, phone, resetSetup } = useSetupStore();

  const providerLabel = provider ? providerLabelMap[provider] : "Social";

  const handleStart = () => {
    resetSetup();
    navigate("/");
  };

  return (
    <SetupShell
      step={5}
      totalSteps={5}
      badge="가입 완료"
      title={
        <>
          가입이 완료됐어요
          <br />
          <span className="text-brand-main">이제 바로 시작할 수 있어요</span>
        </>
      }
      description={
        <>
          계정 설정이 모두 끝났습니다.
          <br />
          Submate에서 파티를 찾거나 직접 만들 수 있습니다.
        </>
      }
      leftBottom={
        <button
          type="button"
          onClick={handleStart}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-main px-5 py-4 text-base font-semibold text-white transition hover:opacity-95 active:scale-95 sm:w-auto sm:px-6"
        >
          시작하기
        </button>
      }
      rightContent={
        <div className="space-y-5">
          <div className="rounded-3xl border border-brand-sub/20 bg-linear-to-br from-brand-main/5 to-brand-sub/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-white text-brand-main shadow-sm">
                <Icon
                  icon="solar:check-circle-bold-duotone"
                  width="30"
                  height="30"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-main">
                  계정 설정 완료
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  Submate를 이용할 준비가 끝났습니다
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  입력한 정보를 바탕으로 계정이 설정되었습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  가입 정보
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  기본 설정 확인
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-main/10 text-brand-main">
                <Icon
                  icon="solar:user-check-rounded-bold-duotone"
                  width="22"
                  height="22"
                />
              </div>
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              <SummaryItem
                label="연결된 소셜"
                value={`${providerLabel} 로그인`}
              />
              <SummaryItem label="아이디" value={userId || "-"} />
              <SummaryItem label="닉네임" value={nickname || "-"} />
              <SummaryItem label="휴대폰 번호" value={phone || "-"} />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm leading-6 text-slate-600">
              이제 원하는 파티에 참여하거나 직접 파티를 만들어
              <br />
              구독 정산을 시작할 수 있습니다.
            </p>
          </div>
        </div>
      }
    />
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <p className="shrink-0 text-sm font-medium text-slate-500">{label}</p>
      <p className="min-w-0 break-all text-right text-sm font-semibold text-slate-900 sm:text-base">
        {value}
      </p>
    </div>
  );
}
