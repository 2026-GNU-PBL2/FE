// src/features/setup/IntroPage.tsx
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

export default function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 -top-35 h-130 w-130 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-50 -right-45 h-130 w-130 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -left-50 top-45 h-105 w-105 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid w-full grid-cols-1 items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-14">
          {/* Left */}
          <section className="space-y-6 sm:space-y-7">
            {/* Step badge */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                환영합니다
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
                <span className="text-slate-900">1</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500">3</span>
                <span className="ml-1 text-slate-500">단계</span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                구독을 <span className="text-brand-main">한 곳에</span>,
                <br className="hidden sm:block" />더 똑똑하게{" "}
                <span className="text-brand-main">관리</span>하세요.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base lg:text-lg">
                흩어진 구독 결제를 모아보고, 필요한 것만 남기는 흐름을 만들어요.
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate("/setup/preference")}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-main px-5 py-4 text-base font-semibold text-white shadow-2xl transition hover:opacity-95 active:scale-[0.99] sm:w-auto sm:px-6"
              >
                다음으로
              </button>
            </div>
          </section>

          {/* Right */}
          <section className="lg:justify-self-stretch">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-linear-to-b from-brand-sub/20 via-brand-accent/10 to-transparent blur-2xl" />

              <div className="relative ml-auto w-full rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-2xl backdrop-blur sm:p-6 lg:max-w-3xl">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-brand-main sm:text-sm">
                    핵심 기능
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    딱 필요한 것만
                  </h2>
                </div>

                <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                  <Pillar
                    icon="solar:widget-4-bold-duotone"
                    title="모아보기"
                    desc="구독 결제를 한 화면에"
                    tone="sub"
                  />
                  <Pillar
                    icon="solar:shield-check-bold-duotone"
                    title="관리하기"
                    desc="주기와 변동을 깔끔하게"
                    tone="main"
                  />
                  <Pillar
                    icon="solar:magic-stick-3-bold-duotone"
                    title="최적화"
                    desc="나에게 맞는 조합으로"
                    tone="accent"
                  />
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:mt-6">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-main" />
                    <p className="text-sm font-semibold text-slate-800">
                      선호도 설정으로 추천 정확도 ↑
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Next
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Pillar({
  icon,
  title,
  desc,
  tone,
}: {
  icon: string;
  title: string;
  desc: string;
  tone: "main" | "sub" | "accent";
}) {
  const tint =
    tone === "main"
      ? "bg-brand-main/10 text-brand-main"
      : tone === "sub"
        ? "bg-brand-sub/15 text-brand-main"
        : "bg-brand-accent/15 text-brand-main";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:gap-4">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tint}`}
      >
        <Icon icon={icon} width="22" height="22" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 sm:text-base">{title}</p>
        <p className="mt-0.5 text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}
