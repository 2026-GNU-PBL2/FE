"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Provider = "kakao" | "naver" | "google";

const OAUTH_PATH: Record<Provider, string> = {
  kakao: "/api/auth/signin/kakao",
  naver: "/api/auth/signin/naver",
  google: "/api/auth/signin/google",
};

function providerLabel(p: Provider) {
  if (p === "kakao") return "카카오";
  if (p === "naver") return "네이버";
  return "Google";
}

function providerButtonText(p: Provider) {
  if (p === "kakao") return "카카오로 시작하기";
  if (p === "naver") return "네이버로 시작하기";
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

export default function Loginpage() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const liveRef = useRef<HTMLParagraphElement | null>(null);

  const year = useMemo(() => new Date().getFullYear(), []);
  const isLoading = loadingProvider !== null;

  const onLogin = (provider: Provider) => {
    if (isLoading) return;

    try {
      setErrorMsg(null);
      setLoadingProvider(provider);

      requestAnimationFrame(() => {
        window.location.assign(OAUTH_PATH[provider]);
      });
    } catch {
      setLoadingProvider(null);
      setErrorMsg("로그인을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  useEffect(() => {
    if (errorMsg) liveRef.current?.focus();
  }, [errorMsg]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-bg text-slate-900">
      {/* Premium background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.10) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="absolute -top-32 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-brand-sub/25 blur-3xl" />
        <div className="absolute -bottom-36 left-1/2 h-115 w-115 -translate-x-1/2 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="absolute top-28 -left-28 h-96 w-96 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute bottom-24 -right-28 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" />

        <div className="absolute inset-0 bg-linear-to-b from-white/0 via-white/0 to-white/35" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-5 py-10">
        <section className="w-full">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_18px_60px_rgba(2,6,23,0.12)] ring-1 ring-black/5">
            <div className="h-1.5 w-full bg-linear-to-r from-brand-main via-brand-sub to-brand-accent" />
            <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-130 -translate-x-1/2 rounded-full bg-linear-to-r from-brand-sub/10 via-white/25 to-brand-accent/10 blur-2xl" />

            <div className="px-7 pt-10">
              {/* Header */}
              <div className="flex flex-col items-center">
                {/* Logo badge */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-br from-brand-sub/35 to-brand-accent/25 blur-md" />

                  {/* ✅ 여기만 변경: "보이는 영역"을 작게 잡고 overflow-hidden + scale */}
                  <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-brand-main/10 shadow-sm">
                    <img
                      src="/images/logo-symbol.png" // 👉 로고 경로만 바꾸면 됨
                      alt="Sub-Life Logo"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
                  <span className="text-brand-main">Sub</span>Life
                </h1>

                <p className="mt-3 max-w-[28ch] text-center text-sm leading-relaxed text-slate-600">
                  구독 관리의 새로운 기준
                  <br />
                  소비를 자산으로 만드는 스마트한 선택
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-main/5 px-3 py-1 text-[11px] font-semibold text-brand-main ring-1 ring-brand-main/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-main" />
                    빠른 시작
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-sub/10 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-brand-sub/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-sub" />
                    안전한 인증
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent/10 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-brand-accent/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                    구독 인사이트
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
                  onClick={() => onLogin("kakao")}
                  disabled={isLoading}
                  aria-busy={loadingProvider === "kakao"}
                  className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-[#FEE500] text-[15px] font-semibold text-[#1F1F1F] shadow-sm transition
                             hover:brightness-[0.98] hover:shadow-[0_10px_26px_rgba(2,6,23,0.10)]
                             focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-sub/25
                             active:scale-[0.99]
                             disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
                  <div className="flex items-center gap-2">
                    {loadingProvider === "kakao" ? (
                      <Spinner className="text-[#1F1F1F]" />
                    ) : (
                      <img
                        src="/images/kakao.png"
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
                  onClick={() => onLogin("naver")}
                  disabled={isLoading}
                  aria-busy={loadingProvider === "naver"}
                  className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-[#03C75A] text-[15px] font-semibold text-white shadow-sm transition
                             hover:brightness-[0.98] hover:shadow-[0_10px_26px_rgba(2,6,23,0.10)]
                             focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/25
                             active:scale-[0.99]
                             disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
                  <div className="flex items-center gap-2">
                    {loadingProvider === "naver" ? (
                      <Spinner className="text-white" />
                    ) : (
                      <img
                        src="/images/naver.png"
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
                  onClick={() => onLogin("google")}
                  disabled={isLoading}
                  aria-busy={loadingProvider === "google"}
                  className="group relative flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-800 shadow-sm transition
                             hover:bg-slate-50 hover:shadow-[0_10px_26px_rgba(2,6,23,0.08)]
                             focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-sub/20
                             active:scale-[0.99]
                             disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5 opacity-0 transition group-hover:opacity-100" />
                  <div className="flex items-center gap-2">
                    {loadingProvider === "google" ? (
                      <Spinner className="text-slate-700" />
                    ) : (
                      <img
                        src="/images/google.png"
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
                    <span>비밀번호 없이 안전하게 로그인</span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-sub" />
                      <span>즉시 시작</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-7 py-5">
              <p className="text-center text-xs leading-relaxed text-slate-500">
                로그인하면{" "}
                <a
                  href="/terms"
                  className="font-semibold text-brand-main hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sub/30"
                >
                  서비스 이용약관
                </a>
                과{" "}
                <a
                  href="/privacy"
                  className="font-semibold text-brand-main hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sub/30"
                >
                  개인정보 처리방침
                </a>
                에 동의하게 됩니다.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {year}{" "}
            <span className="font-semibold text-brand-main">SubLife</span>
          </p>
        </section>
      </div>
    </main>
  );
}
