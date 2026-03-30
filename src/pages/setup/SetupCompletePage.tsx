import { useState } from "react";
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
                  가입 준비 완료
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  마지막으로 정보 확인 후 계정을 생성합니다
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  공동구독 파티 참여와 정산을 위한 기본 계정 정보가 설정됩니다.
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
                  최종 확인
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
              <SummaryItem
                label="서브메이트 이메일"
                value={submateEmail || "-"}
              />
              <SummaryItem label="닉네임" value={nickname || "-"} />
              <SummaryItem label="휴대폰 번호" value={phoneNumber || "-"} />
              <SummaryItem
                label="간편 비밀번호"
                value={pinNumber ? "●●●●" : "-"}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm leading-6 text-slate-600">
              가입이 완료되면 Submate에서 파티 참여, 결제, 정산 관리 기능을 바로
              사용할 수 있습니다.
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
