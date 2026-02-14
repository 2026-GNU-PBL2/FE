// src/features/landing/LandingPage.tsx
import { useEffect, useMemo, useState } from "react";
import FeatureCard from "./components/FeatureCard";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useScrollToTop } from "@/shared/hooks/useScrollToTop";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { scrollToTop } = useScrollToTop();

  const now = useMemo(() => {
    const d = new Date();
    return { m: d.getMonth() + 1, day: d.getDate() };
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-slate-900">
      {/* Soft Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute top-40 -left-40 h-130 w-130 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -bottom-56 right-0 h-160 w-160 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      {/* Sticky Navbar */}
      <header
        className={[
          "sticky top-0 z-50 border-b transition-all",
          scrolled
            ? "border-slate-200/70 bg-white/85 backdrop-blur"
            : "border-transparent bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => scrollToTop()}
            className="group flex items-center gap-3"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
              <img
                src="/images/logo-symbol.png"
                alt="Sub-Life"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-slate-900">
                SubLife <span className="text-slate-400">/</span>{" "}
                <span className="text-slate-600">서브라이프</span>
              </div>
              <div className="text-[11px] text-slate-500">
                구독을 소비에서 자산으로
              </div>
            </div>
          </Link>

          <Link
            to="/log-in"
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand-main shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
          >
            시작하기
            <span className="ml-2 inline-block rounded-full bg-brand-accent/20 px-2 py-0.5 text-[11px] font-semibold text-brand-main">
              소셜로그인
            </span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pt-6 pb-10 sm:px-6 sm:pt-10 sm:pb-14 md:gap-10 lg:grid-cols-2 lg:items-center lg:px-8 lg:pt-14 lg:pb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              KFTC Open Banking Connected
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:mt-5 sm:text-4xl lg:text-5xl">
              흩어진 구독, <span className="text-brand-main">이제 자산</span>이
              됩니다
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base md:text-lg">
              매달 빠져나가는 구독료를 <br className="hidden sm:block" />
              한눈에 관리하고, 바꾸고, 쌓으세요.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/log-in"
                className="inline-flex items-center justify-center rounded-xl bg-brand-main px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                무료로 구독 분석 시작하기
                <span className="ml-2">→</span>
              </Link>

              <div className="text-xs text-slate-500">
                카드·계좌 연동 1분 · 신용점수 영향 없음
              </div>
            </div>

            {/* StatChips */}
            <div className="mt-7 grid grid-cols-3 gap-2 text-xs text-slate-600 sm:mt-8 sm:gap-3">
              {[
                {
                  label: "인식된 구독",
                  value: "8개",
                  icon: "lucide:scan-line",
                },
                {
                  label: "이번 달 절약",
                  value: "₩ 12,000",
                  icon: "lucide:badge-percent",
                },
                {
                  label: "구독 리워드",
                  value: "10,000P",
                  icon: "lucide:wallet",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500">
                      {item.label}
                    </div>
                    <Icon icon={item.icon} className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual: ✅ Dashboard 핵심만 프리뷰 */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-brand-sub/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
                </div>
                <div className="text-xs text-slate-500">대시보드</div>
              </div>

              <div className="p-4 sm:p-5">
                {/* Dashboard header (가벼운 버전) */}
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-slate-900">
                      이번 달 구독 현황 👋🏻
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {now.m}월 {now.day}일 기준
                    </div>
                  </div>

                  <Link
                    to="/log-in"
                    className="shrink-0 rounded-xl bg-brand-main px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:opacity-95"
                  >
                    시작 →
                  </Link>
                </div>

                {/* KPI 4 cards (DashboardPage 축약) */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-3xl border border-slate-100 bg-white/75 p-4 shadow-sm backdrop-blur">
                    <p className="text-[11px] text-slate-500">
                      이번 달 총 지출
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">
                      ₩58,900
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      ₩12,000 절약
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-white/75 p-4 shadow-sm backdrop-blur">
                    <p className="text-[11px] text-slate-500">연간 지출 추정</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">
                      ₩706,800
                    </p>
                    <p className="mt-2 text-[10px] text-slate-400">
                      활성 구독 기준
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-white/75 p-4 shadow-sm backdrop-blur">
                    <p className="text-[11px] text-slate-500">활성 구독</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">
                      8개
                    </p>
                    <p className="mt-2 text-[10px] font-semibold text-brand-main">
                      자동결제 연결됨
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-linear-to-br from-brand-main to-brand-sub p-4 text-white shadow-lg">
                    <p className="text-[11px] text-white/80">구독 리워드</p>
                    <p className="mt-1 text-lg font-extrabold">10,000P</p>
                    <p className="mt-2 text-[10px] text-white/80">
                      다음 달 +2,500P
                    </p>
                  </div>
                </div>

                {/* Smart swap highlight (DashboardPage 핵심 문장) */}
                <div className="mt-4 rounded-3xl border border-brand-accent/20 bg-brand-accent/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-900">
                        스마트 스왑 추천
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        이번 달{" "}
                        <span className="font-semibold text-slate-900">
                          디즈니+
                        </span>{" "}
                        신규 콘텐츠가 많아요. 바꾸면{" "}
                        <span className="font-semibold text-brand-main">
                          월 ₩3,600
                        </span>{" "}
                        절약할 수 있어요.
                      </p>
                    </div>

                    <Link
                      to="/log-in"
                      className="shrink-0 rounded-xl bg-brand-main px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:opacity-95"
                    >
                      상세 →
                    </Link>
                  </div>
                </div>

                <div className="mt-3 text-center text-[10px] text-slate-400">
                  * 프리뷰는 데모 화면이며, 실제 데이터는 로그인 후 표시됩니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              핵심 기능 3가지
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              복잡한 설정 없이, 연결만 하면 결과를 보여줍니다.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3">
            <FeatureCard
              icon="ph:brain"
              title="구독 자동 분석"
              points={[
                "카드·계좌 연동만 하면",
                "→ 모든 구독을 자동으로 찾아줍니다",
              ]}
            />
            <FeatureCard
              icon="ph:arrows-left-right"
              title="스마트 스왑 추천"
              points={[
                "내가 좋아하는 장르 기준으로",
                "→ 지금 바꾸면 더 잘 맞는 서비스 제안",
              ]}
            />
            <FeatureCard
              icon="ph:piggy-bank"
              title="구독 리워드 적립"
              points={[
                "그냥 나가는 돈 ❌",
                "구독 이용이 리워드로 쌓이는 구조 ⭕",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="relative">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 sm:pt-12 sm:pb-8 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-sub/20 blur-3xl" />
            <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-brand-accent/15 blur-3xl" />

            <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center lg:gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                  구독을 관리하는 수준을 넘어서{" "}
                  <br className="hidden sm:block" />
                  구독으로 자산을 만드세요
                </h3>
                <p className="mt-3 text-sm text-slate-600">
                  무료로 시작하고, 내 구독을 한 번에 정리해보세요.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  신용점수 영향 없음 · 언제든 연결 해제 가능
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
                <Link
                  to="/log-in"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-main px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  지금 무료로 시작하기 →
                </Link>

                <div className="text-center text-xs text-slate-500 sm:text-left lg:text-center">
                  1분 연동 · 언제든 연결 해제 가능
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="relative mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200/70 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-relaxed text-slate-500">
              <div className="font-semibold text-slate-700">SubLife</div>
              <div className="mt-1">
                대표자: 김용환 · 사업자등록번호: 000-00-00000 · 통신판매업:
                2026-서울-0000
              </div>
              <div className="mt-1">
                주소: 경남 진주시 진주대로 501, ICT융합센터 601호관 · 고객센터:{" "}
                <a
                  className="font-semibold text-slate-700 hover:text-slate-900"
                  href="mailto:hello@sub-life.app"
                >
                  hello@sub-life.app
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#"
                className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                aria-label="GitHub"
                title="GitHub"
              >
                <Icon
                  icon="lucide:github"
                  className="h-5 w-5 text-slate-600 transition group-hover:text-slate-900"
                />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="#"
                className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                aria-label="Blog"
                title="Blog"
              >
                <Icon
                  icon="lucide:pen-line"
                  className="h-5 w-5 text-slate-600 transition group-hover:text-slate-900"
                />
                <span className="sr-only">Blog</span>
              </a>
              <a
                href="mailto:hello@sub-life.app"
                className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                aria-label="Email"
                title="Email"
              >
                <Icon
                  icon="lucide:mail"
                  className="h-5 w-5 text-slate-600 transition group-hover:text-slate-900"
                />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-400">
              © 2026 SubLife. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
