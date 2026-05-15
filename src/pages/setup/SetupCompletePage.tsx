import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import SetupShell from "./SetupShell";
import { useSetupStore } from "@/stores/setupStore";
import { api } from "@/api/axios";
import {
  useAuthStore,
  type AuthUser,
  type UserRole,
  type UserStatus,
} from "@/stores/authStore";

const providerLabelMap = {
  google: "Google",
  kakao: "Kakao",
  naver: "Naver",
};

const SUBMATE_DOMAIN = "@submate.cloud";

type SignupResponse = {
  id: number;
  nickname: string | null;
  submateEmail: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;
};

type ApiErrorResponse = {
  message?: string;
};

function normalizeSignedUpUser(data: SignupResponse): AuthUser {
  return {
    id: data.id,
    nickname: data.nickname,
    submateEmail: data.submateEmail,
    phoneNumber: data.phoneNumber,
    role: data.role,
    status: data.status,
  };
}

export default function SetupCompletePage() {
  const navigate = useNavigate();

  const {
    provider,
    submateEmail,
    nickname,
    phoneNumber,
    isPhoneVerified,
    pinNumber,
    resetSetup,
  } = useSetupStore();

  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);
  const socialProvider = useAuthStore((state) => state.socialProvider);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const providerLabel = provider ? providerLabelMap[provider] : "Social";
  const displaySubmateEmail = formatSubmateEmail(submateEmail);

  useEffect(() => {
    if (!submateEmail || !nickname) {
      toast.error("계정 정보를 먼저 설정해 주세요.");
      navigate("/setup/profile", { replace: true });
      return;
    }

    if (!phoneNumber || !isPhoneVerified) {
      toast.error("휴대폰 인증을 먼저 완료해 주세요.");
      navigate("/setup/phone", { replace: true });
      return;
    }

    if (!pinNumber) {
      toast.error("간편 비밀번호를 먼저 설정해 주세요.");
      navigate("/setup/security", { replace: true });
    }
  }, [
    isPhoneVerified,
    navigate,
    nickname,
    phoneNumber,
    pinNumber,
    submateEmail,
  ]);

  const handleStart = async () => {
    if (!accessToken) {
      toast.error("로그인 정보가 없습니다. 다시 로그인해 주세요.");
      clearAuth();
      navigate("/log-in", { replace: true });
      return;
    }

    if (!phoneNumber || !submateEmail || !nickname || !pinNumber) {
      toast.error("가입에 필요한 정보가 부족합니다. 다시 진행해 주세요.");
      return;
    }

    if (!currentUser || !socialProvider) {
      toast.error("로그인 사용자 정보가 없습니다. 다시 로그인해 주세요.");
      clearAuth();
      navigate("/log-in", { replace: true });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post<SignupResponse>(
        "/api/v1/user",
        {
          phoneNumber,
          submateEmail,
          nickname,
          pinNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const signedUpUser = normalizeSignedUpUser(response.data);

      setAuth({
        accessToken,
        user: signedUpUser,
        socialProvider,
      });

      toast.success("회원가입이 완료되었습니다.");
      resetSetup();
      navigate("/", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const status = axiosError.response?.status;
      const message =
        axiosError.response?.data?.message ||
        (status === 400
          ? "입력한 회원가입 정보가 올바르지 않습니다."
          : status === 401
            ? "인증이 만료되었거나 로그인 정보가 올바르지 않습니다. 다시 로그인해 주세요."
            : status === 403
              ? "회원가입을 진행할 권한이 없습니다."
              : status === 409
                ? "이미 사용 중인 정보가 있습니다. 입력값을 다시 확인해 주세요."
                : "회원가입 처리에 실패했습니다. 다시 시도해 주세요.");

      toast.error(message);

      if (status === 401) {
        clearAuth();
        navigate("/log-in", { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SetupShell
      step={5}
      totalSteps={5}
      badge="가입 확인"
      title={
        <>
          입력한 정보를 확인하고
          <br />
          <span className="text-brand-main">가입을 완료해 주세요</span>
        </>
      }
      description={
        <>
          아래 정보로 서브메이트 계정을 생성합니다.
          <br />
          완료하면 바로 서비스 이용이 가능합니다.
        </>
      }
      leftBottom={
        <button
          type="button"
          onClick={handleStart}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-main px-5 py-4 text-base font-semibold text-white transition hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {isSubmitting ? "가입 처리 중..." : "가입 완료하기"}
        </button>
      }
      rightCardClassName="relative mx-auto w-full max-w-[480px] rounded-[30px] border border-slate-100 bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)] sm:p-6"
      rightContent={
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-main/10 text-brand-main">
              <Icon
                icon="solar:check-circle-bold-duotone"
                width="26"
                height="26"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-main">가입 준비 완료</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">
                마지막으로 정보만 확인해 주세요
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                확인 후 가입을 완료하면 바로 서비스를 이용할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 px-4 py-2.5">
            <div className="divide-y divide-slate-200/70">
              <SummaryItem
                label="연결된 소셜"
                value={`${providerLabel} 로그인`}
              />
              <SummaryItem
                label="서브메이트 이메일"
                value={displaySubmateEmail}
              />
              <SummaryItem label="닉네임" value={nickname || "-"} />
              <SummaryItem label="휴대폰 번호" value={phoneNumber || "-"} />
              <SummaryItem
                label="간편 비밀번호"
                value={pinNumber ? "●●●●" : "-"}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-blue-50 px-4 py-3.5 text-blue-900">
            <Icon
              icon="solar:lock-keyhole-bold-duotone"
              width="20"
              height="20"
              className="shrink-0"
            />
            <p className="text-sm font-semibold leading-5">
              입력한 정보는 가입 완료 후 내 정보에서 다시 확인할 수 있습니다.
            </p>
          </div>
        </div>
      }
    />
  );
}

function formatSubmateEmail(emailId: string) {
  const normalizedEmailId = emailId.trim();

  if (!normalizedEmailId) {
    return "-";
  }

  if (normalizedEmailId.includes("@")) {
    return normalizedEmailId;
  }

  return `${normalizedEmailId}${SUBMATE_DOMAIN}`;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <p className="shrink-0 text-sm font-semibold text-slate-500">{label}</p>
      <p className="min-w-0 break-all text-right text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
