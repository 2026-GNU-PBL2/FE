import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import SetupShell from "./SetupShell";
import { useSetupStore } from "@/stores/setupStore";

const providerLabelMap = {
  google: "Google",
  kakao: "Kakao",
  naver: "Naver",
};

export default function SetupIntroPage() {
  const navigate = useNavigate();
  const { provider, socialEmail, profileImage, setProviderInfo } =
    useSetupStore();

  useEffect(() => {
    if (!provider) {
      setProviderInfo({
        provider: "google",
        socialEmail: "submate.user@gmail.com",
        profileImage: "",
      });
    }
  }, [provider, setProviderInfo]);

  const providerLabel = provider ? providerLabelMap[provider] : "Social";

  return (
    <SetupShell
      step={1}
      totalSteps={5}
      badge="최초 가입 안내"
      title={
        <>
          가입 전에
          <br />
          <span className="text-brand-main">기본 정보만 설정</span>하면 됩니다
        </>
      }
      description={
        <>
          소셜 로그인은 완료됐습니다.
          <br />
          Submate 이용에 필요한 정보만 간단하게 이어서 입력해 주세요.
        </>
      }
      leftBottom={
        <button
          type="button"
          onClick={() => navigate("/setup/profile")}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-main px-5 py-4 text-base font-semibold text-white transition hover:opacity-95 active:scale-95 sm:w-auto sm:px-6"
        >
          계속하기
        </button>
      }
      rightContent={
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-brand-main/10 text-brand-main">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="social profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon
                      icon="solar:user-bold-duotone"
                      width="28"
                      height="28"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-500">
                    연결된 계정
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {providerLabel} 계정으로 로그인됨
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-600">
                    {socialEmail || "연결된 이메일 정보 없음"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">다음 단계</p>

              <div className="mt-4 space-y-4">
                <SimpleStep
                  number="01"
                  title="프로필 정보 입력"
                  desc="아이디와 닉네임을 설정합니다"
                />
                <SimpleStep
                  number="02"
                  title="비밀번호 설정"
                  desc="계정 보안을 위한 비밀번호를 만듭니다"
                />
                <SimpleStep
                  number="03"
                  title="휴대폰 인증"
                  desc="본인 확인 후 가입을 완료합니다"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-brand-sub/20 bg-brand-sub/10 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">
              입력은 오래 걸리지 않아요. 바로 다음 단계로 진행해 주세요.
            </p>
          </div>
        </div>
      }
    />
  );
}

function SimpleStep({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-main ring-1 ring-slate-200">
        {number}
      </div>

      <div className="min-w-0 pt-1">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}
