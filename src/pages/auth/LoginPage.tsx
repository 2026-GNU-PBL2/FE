// src/pages/auth/LoginPage.tsx

import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.10) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-sub/25 blur-3xl" />
        <div className="absolute -bottom-36 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="absolute -left-28 top-28 h-96 w-96 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -right-28 bottom-24 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/0 via-white/0 to-white/35" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-5 py-10">
        <section className="w-full">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
            <div className="h-1.5 w-full bg-linear-to-r from-brand-main via-brand-sub to-brand-accent" />

            <div className="px-7 pt-10">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-br from-brand-sub/35 to-brand-accent/25 blur-md" />
                  <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-main/10">
                    <img
                      src="/images/logo-symbol.png"
                      alt="Submate Logo"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
                  <span className="text-brand-main">Sub</span>mate
                </h1>

                <p className="mt-3 max-w-[28ch] text-center text-sm leading-relaxed text-slate-600">
                  공동구독 파티 참여부터
                  <br />
                  결제와 정산까지 한 번에 관리하세요
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-main/5 px-3 py-1 text-[11px] font-semibold text-brand-main ring-1 ring-brand-main/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-main" />
                    간편 로그인
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-sub/10 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-brand-sub/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-sub" />
                    자동 정산
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent/10 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-brand-accent/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                    파티 운영 관리
                  </span>
                </div>

                <div className="mt-7 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />
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

              <div className="mt-6 space-y-3 pb-8">
                <button
                  type="button"
                  onClick={() => onLogin("kakao")}
                  disabled={isLoading}
                  aria-busy={loadingProvider === "kakao"}
                  className="relative flex h-12 w-full items-center justify-center rounded-xl bg-[#FEE500] text-[15px] font-semibold text-[#1F1F1F] shadow-sm transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-sub/25 disabled:cursor-not-allowed disabled:opacity-70"
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
                  className="relative flex h-12 w-full items-center justify-center rounded-xl bg-[#03C75A] text-[15px] font-semibold text-white shadow-sm transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/25 disabled:cursor-not-allowed disabled:opacity-70"
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
                  className="relative flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-sub/20 disabled:cursor-not-allowed disabled:opacity-70"
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
                    <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-brand-main/5 ring-1 ring-brand-main/10">
                      🔒
                    </span>
                    <span>안전한 소셜 로그인</span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-sub" />
                      <span>로그인 후 바로 이용 가능</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-7 py-5">
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
