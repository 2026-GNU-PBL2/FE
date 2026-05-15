// src/pages/auth/LoginPage.tsx

import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getSocialAuthorizeUrl, type LoginProvider } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";

function providerLabel(provider: LoginProvider) {
  if (provider === "kakao") return "카카오";
  if (provider === "naver") return "네이버";
  return "Google";
}

function providerButtonText(provider: LoginProvider) {
  if (provider === "kakao") return "카카오로 시작하기";
  if (provider === "naver") return "네이버로 시작하기";
  return "Google로 시작하기";
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 animate-spin ${className}`}
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

export default function LoginPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [loadingProvider, setLoadingProvider] = useState<LoginProvider | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const liveRef = useRef<HTMLParagraphElement | null>(null);

  const year = new Date().getFullYear();
  const isLoading = loadingProvider !== null;
  const isLoggedIn =
    Boolean(accessToken) && isAuthenticated && authStatus === "authenticated";

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/mypage", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (errorMsg) {
      liveRef.current?.focus();
    }
  }, [errorMsg]);

  const onLogin = (provider: LoginProvider) => {
    if (isLoading) return;

    try {
      setErrorMsg(null);
      setLoadingProvider(provider);

      const authorizeUrl = getSocialAuthorizeUrl(provider);

      if (!authorizeUrl) {
        throw new Error("Authorize URL not found");
      }

      window.location.href = authorizeUrl;
    } catch {
      setLoadingProvider(null);
      setErrorMsg("로그인을 시작할 수 없습니다. 설정값을 확인해 주세요.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-bg text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[400px] items-center justify-center px-5 py-8">
        <section className="w-full">
          <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-blue-50/80 to-transparent" />

            <div className="px-6 pt-8">
              <div className="flex flex-col items-center">
                <Link
                  to="/"
                  aria-label="Submate 홈으로 이동"
                  className="group flex flex-col items-center rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-sub/25"
                >
                  <div className="relative mb-3">
                    <div className="absolute inset-0 rounded-[24px] bg-brand-main/8 blur-xl transition group-hover:bg-brand-main/12" />
                    <div className="relative grid h-15 w-15 place-items-center overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-brand-main/10 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                      <img
                        src="/images/logo-symbol.png"
                        alt="Submate Logo"
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <h1 className="text-center text-[22px] font-semibold tracking-tight text-slate-900 transition group-hover:text-brand-main">
                    <span className="text-brand-main">Sub</span>mate
                  </h1>
                </Link>

                <p className="mt-2.5 max-w-[28ch] text-center text-sm leading-relaxed text-slate-600">
                  소셜 계정으로 간편하게
                  <br />
                  서브메이트를 시작하세요
                </p>

                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-main ring-1 ring-blue-100">
                  <Icon
                    icon="solar:shield-check-bold-duotone"
                    className="h-4 w-4"
                  />
                  안전한 소셜 로그인
                </div>

                <div className="mt-6 h-px w-full bg-slate-100" />
              </div>

              <p
                ref={liveRef}
                tabIndex={-1}
                aria-live="polite"
                className={`mt-4 rounded-xl px-3 py-2 text-xs ring-1 transition ${
                  errorMsg ? "bg-red-50 text-red-700 ring-red-100" : "sr-only"
                }`}
              >
                {errorMsg}
              </p>

              <div className="mt-5 space-y-2.5 pb-7">
                <p className="pb-0.5 text-center text-xs font-bold text-slate-400">
                  로그인 방법을 선택해 주세요
                </p>

                <button
                  type="button"
                  onClick={() => onLogin("kakao")}
                  disabled={isLoading}
                  aria-busy={loadingProvider === "kakao"}
                  className="relative flex h-11 w-full items-center justify-center rounded-xl bg-[#FEE500] text-sm font-semibold text-[#1F1F1F] shadow-sm transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-sub/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
                  <div className="flex items-center gap-2">
                    {loadingProvider === "kakao" ? (
                      <Spinner className="text-[#1F1F1F]" />
                    ) : (
                      <img
                        src="/images/login/kakao.png"
                        alt="Kakao"
                        className="h-5 w-5"
                        draggable={false}
                      />
                    )}
                    <span>
                      {loadingProvider === "kakao"
                        ? `${providerLabel("kakao")}로 이동 중…`
                        : providerButtonText("kakao")}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onLogin("naver")}
                  disabled={isLoading}
                  aria-busy={loadingProvider === "naver"}
                  className="relative flex h-11 w-full items-center justify-center rounded-xl bg-[#03C75A] text-sm font-semibold text-white shadow-sm transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
                  <div className="flex items-center gap-2">
                    {loadingProvider === "naver" ? (
                      <Spinner className="text-white" />
                    ) : (
                      <img
                        src="/images/login/naver.png"
                        alt="Naver"
                        className="h-5 w-5"
                        draggable={false}
                      />
                    )}
                    <span>
                      {loadingProvider === "naver"
                        ? `${providerLabel("naver")}로 이동 중…`
                        : providerButtonText("naver")}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onLogin("google")}
                  disabled={isLoading}
                  aria-busy={loadingProvider === "google"}
                  className="relative flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-sub/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5 opacity-0 transition hover:opacity-100" />
                  <div className="flex items-center gap-2">
                    {loadingProvider === "google" ? (
                      <Spinner className="text-slate-700" />
                    ) : (
                      <img
                        src="/images/login/google.png"
                        alt="Google"
                        className="h-5 w-5"
                        draggable={false}
                      />
                    )}
                    <span>
                      {loadingProvider === "google"
                        ? `${providerLabel("google")}로 이동 중…`
                        : providerButtonText("google")}
                    </span>
                  </div>
                </button>

                <div className="pt-3">
                  <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-500">
                    <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-brand-main/5 text-brand-main ring-1 ring-brand-main/10">
                      <Icon icon="solar:lock-keyhole-bold-duotone" className="h-3.5 w-3.5" />
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-sub" />
                      <span>로그인 후 바로 이용할 수 있어요</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-4">
              <p className="text-center text-xs leading-relaxed text-slate-500">
                로그인하면{" "}
                <Link
                  to="/terms"
                  className="font-semibold text-brand-main hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sub/30"
                >
                  서비스 이용약관
                </Link>
                과{" "}
                <Link
                  to="/privacy"
                  className="font-semibold text-brand-main hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sub/30"
                >
                  개인정보 처리방침
                </Link>
                에 동의하게 됩니다.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {year}{" "}
            <span className="font-semibold text-brand-main">Submate</span>
          </p>
        </section>
      </div>
    </main>
  );
}
