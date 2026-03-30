import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import SetupShell from "./SetupShell";
import { useSetupStore } from "@/stores/setupStore";
import { useAuthStore } from "@/stores/authStore";

type DisplayProvider = "google" | "kakao" | "naver";

function resolveDisplayProvider(
  provider: string | null | undefined,
): DisplayProvider | null {
  if (!provider) return null;

  const normalized = provider.toLowerCase();

  if (normalized === "google") return "google";
  if (normalized === "kakao") return "kakao";
  if (normalized === "naver") return "naver";

  return null;
}

function getProviderLabel(provider: DisplayProvider | null) {
  if (provider === "google") return "Google";
  if (provider === "kakao") return "Kakao";
  if (provider === "naver") return "Naver";
  return "Social";
}

function getProviderMeta(provider: DisplayProvider | null) {
  if (provider === "google") {
    return {
      icon: "logos:google-icon",
      badgeClassName: "bg-white ring-1 ring-slate-200",
      iconWrapperClassName: "bg-white",
    };
  }

  if (provider === "kakao") {
    return {
      icon: "simple-icons:kakaotalk",
      badgeClassName: "bg-[#FEE500] ring-1 ring-black/5",
      iconWrapperClassName: "bg-[#FEE500] text-[#1F1F1F]",
    };
  }

  if (provider === "naver") {
    return {
      icon: "simple-icons:naver",
      badgeClassName: "bg-[#03C75A] ring-1 ring-black/5",
      iconWrapperClassName: "bg-[#03C75A] text-white",
    };
  }

  return {
    icon: "solar:user-bold-duotone",
    badgeClassName: "bg-brand-main/10 ring-1 ring-brand-main/10",
    iconWrapperClassName: "bg-brand-main/10 text-brand-main",
  };
}

export default function SetupIntroPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const socialProvider = useAuthStore((state) => state.socialProvider);

  const { provider, socialEmail, profileImage, setProviderInfo } =
    useSetupStore();

  const displayProvider = resolveDisplayProvider(socialProvider ?? provider);
  const providerLabel = getProviderLabel(displayProvider);
  const providerMeta = getProviderMeta(displayProvider);

  useEffect(() => {
    const resolvedProvider = resolveDisplayProvider(socialProvider ?? provider);

    if (!resolvedProvider) return;

    setProviderInfo({
      provider: resolvedProvider,
      socialEmail:
        socialEmail || user?.submateEmail || "연결된 이메일 정보 없음",
      profileImage: profileImage || "",
    });
  }, [
    profileImage,
    provider,
    setProviderInfo,
    socialEmail,
    socialProvider,
    user?.submateEmail,
  ]);

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
          Submate 이용에 필요한 정보만 이어서 입력해 주세요.
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
                <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="social profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={[
                        "flex h-full w-full items-center justify-center rounded-2xl",
                        providerMeta.iconWrapperClassName,
                      ].join(" ")}
                    >
                      <Icon icon={providerMeta.icon} width="28" height="28" />
                    </div>
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
                    "소셜 계정으로 간편하게 로그인 중입니다"
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">다음 단계</p>

              <div className="mt-4 space-y-4">
                <SimpleStep
                  number="01"
                  title="Submate 계정 설정"
                  desc="서비스에서 사용할 서브메이트 이메일과 닉네임을 정합니다"
                />
                <SimpleStep
                  number="02"
                  title="휴대폰 인증"
                  desc="본인 확인을 위해 휴대폰 번호를 인증합니다"
                />
                <SimpleStep
                  number="03"
                  title="간편 비밀번호 설정"
                  desc="로그인과 주요 인증에 사용할 4자리 번호를 설정합니다"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-brand-sub/20 bg-brand-sub/10 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">
              가입 후에는 파티 참여, 결제, 정산 내역 확인까지 바로 이용할 수
              있습니다.
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
