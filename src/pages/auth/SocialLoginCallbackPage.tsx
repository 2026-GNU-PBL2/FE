import { useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  loginWithOauthCode,
  parseSocialProvider,
  type SocialProvider,
} from "@/api/auth";
import {
  useAuthStore,
  type AuthUser,
  type UserRole,
  type UserStatus,
  type AuthSocialProvider,
} from "@/stores/authStore";
import { api } from "@/api/axios";
import axios from "axios";

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-brand-main"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v2.2A5.8 5.8 0 0 0 6.2 12H4z"
      />
    </svg>
  );
}

interface UserMeResponse {
  id: number;
  nickname: string | null;
  submateEmail: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseMessage = (
      error.response?.data as { message?: string } | undefined
    )?.message;

    if (responseMessage) {
      return responseMessage;
    }

    if (error.response?.status === 400) {
      return "로그인 요청 값이 올바르지 않습니다.";
    }

    if (error.response?.status === 401) {
      return "인증에 실패했습니다. 다시 시도해 주세요.";
    }

    if (error.response?.status === 403) {
      return "접근 권한이 없습니다.";
    }

    if (error.response?.status === 404) {
      return "사용자 정보를 찾을 수 없습니다.";
    }

    if (error.response?.status === 500) {
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }
  }

  return "로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요.";
}

function resolveSocialProvider(
  paramsProvider: string | undefined,
  searchParams: URLSearchParams,
): SocialProvider | null {
  const candidates = [
    paramsProvider,
    searchParams.get("provider"),
    searchParams.get("socialProvider"),
  ];

  for (const candidate of candidates) {
    const parsed = parseSocialProvider(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function toAuthSocialProvider(
  provider: SocialProvider,
): Exclude<AuthSocialProvider, null> {
  if (provider === "KAKAO") return "kakao";
  if (provider === "NAVER") return "naver";
  return "google";
}

async function getCurrentUser(accessToken: string) {
  const response = await api.get<UserMeResponse>("/api/v1/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

function normalizeUser(data: UserMeResponse): AuthUser {
  return {
    id: data.id,
    nickname: data.nickname,
    submateEmail: data.submateEmail,
    phoneNumber: data.phoneNumber,
    role: data.role,
    status: data.status,
  };
}

export default function SocialLoginCallbackPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const requestStartedRef = useRef(false);

  const code = searchParams.get("code");
  const socialProvider = resolveSocialProvider(params.provider, searchParams);

  const errorMsg = !code
    ? "인가 코드가 없습니다. 다시 로그인해 주세요."
    : !socialProvider
      ? "소셜 로그인 제공자 정보를 찾을 수 없습니다."
      : null;

  useEffect(() => {
    if (requestStartedRef.current) {
      return;
    }

    if (!code || !socialProvider) {
      if (errorMsg) {
        toast.error(errorMsg);
      }
      return;
    }

    requestStartedRef.current = true;

    const run = async () => {
      try {
        const loginResponse = await loginWithOauthCode({
          code,
          socialProvider,
        });

        const accessToken = loginResponse.accessToken;
        const userResponse = await getCurrentUser(accessToken);
        const normalizedUser = normalizeUser(userResponse);

        setAuth({
          accessToken,
          user: normalizedUser,
          socialProvider: toAuthSocialProvider(socialProvider),
        });

        if (normalizedUser.status === "PENDING_SIGNUP") {
          toast.success("회원가입 정보를 이어서 입력해 주세요.");
          navigate("/setup/intro", { replace: true });
          return;
        }

        if (normalizedUser.status === "ACTIVE") {
          toast.success("로그인에 성공했습니다.");
          navigate("/", { replace: true });
          return;
        }

        toast.error("접근할 수 없는 계정 상태입니다.");
        clearAuth();
        navigate("/log-in", { replace: true });
      } catch (error) {
        clearAuth();

        const message = getErrorMessage(error);
        toast.error(message);

        navigate(`/log-in?error=${encodeURIComponent(message)}`, {
          replace: true,
        });
      }
    };

    void run();
  }, [clearAuth, code, errorMsg, navigate, setAuth, socialProvider]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_18px_60px_rgba(2,6,23,0.08)] ring-1 ring-black/5">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-main/5">
            {errorMsg ? <span className="text-xl">⚠️</span> : <Spinner />}
          </div>

          <h1 className="text-center text-xl font-semibold text-slate-900">
            {errorMsg ? "로그인에 실패했습니다" : "로그인 처리 중입니다"}
          </h1>

          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
            {errorMsg
              ? errorMsg
              : "잠시만 기다려 주세요. 인증 정보를 확인하고 있습니다."}
          </p>

          {errorMsg ? (
            <button
              type="button"
              onClick={() => navigate("/log-in", { replace: true })}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-main px-5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-sub/25"
            >
              로그인 페이지로 돌아가기
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
