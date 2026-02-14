// src/features/setup/CompletePage.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

type NextHint = {
  title: string;
  desc: string;
  icon: string;
  tone: "main" | "sub" | "accent";
};

export default function CompletePage() {
  const navigate = useNavigate();

  const hints: NextHint[] = useMemo(
    () => [
      {
        title: "구독 자동 모아보기",
        desc: "연결한 정보로 구독 결제를 찾아 한 화면에 보여줘요",
        icon: "solar:widget-4-bold-duotone",
        tone: "sub",
      },
      {
        title: "불필요한 구독 정리",
        desc: "중복/미사용/인상 감지로 정리 우선순위를 알려줘요",
        icon: "solar:trash-bin-trash-bold-duotone",
        tone: "main",
      },
      {
        title: "나에게 맞는 추천",
        desc: "선택한 취향 기반으로 더 좋은 조합을 제안해요",
        icon: "solar:magic-stick-3-bold-duotone",
        tone: "accent",
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 -top-24 h-130 w-130 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-50 -right-45 h-130 w-130 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -left-50 top-45 h-105 w-105 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid w-full grid-cols-1 items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-14">
          {/* Left */}
          <section className="space-y-6 sm:space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-brand-accent" />
              가입 완료
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                가입이 <span className="text-brand-main">완료</span>되었습니다.
                <br className="block" />
                이제 구독을 <span className="text-brand-main">
                  한 곳에서
                </span>{" "}
                관리하세요.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base lg:text-lg">
                지금부터는 메인 화면에서 구독을 모아보고, 정리하고, 추천까지 한
                번에 할 수 있어요.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-2xl backdrop-blur sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-main/10 text-brand-main">
                  <Icon
                    icon="solar:check-circle-bold-duotone"
                    width="22"
                    height="22"
                  />
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-bold text-slate-900 sm:text-base">
                    준비 완료
                  </p>
                  <p className="text-sm text-slate-600">
                    아래 버튼을 누르면 바로 메인 화면으로 이동합니다.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-main px-5 py-4 text-base font-semibold text-white shadow-2xl transition hover:opacity-95 active:scale-[0.99]"
                >
                  시작하기
                  <Icon icon="solar:arrow-right-bold" width="18" height="18" />
                </button>
              </div>
            </div>
          </section>

          {/* Right */}
          <section className="lg:justify-self-stretch">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-linear-to-b from-brand-sub/20 via-brand-accent/10 to-transparent blur-2xl" />

              <div className="relative ml-auto w-full rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-2xl backdrop-blur sm:p-6 lg:max-w-3xl">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-brand-main sm:text-sm">
                    메인 화면에서 할 수 있는 것
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    이렇게 바로 시작돼요
                  </h2>
                  <p className="text-sm text-slate-600">
                    아래 3가지만 기억하면 됩니다.
                  </p>
                </div>

                <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                  {hints.map((h) => (
                    <HintRow key={h.title} hint={h} />
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:mt-6">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-accent" />
                    <p className="text-sm font-semibold text-slate-800">
                      설정은 나중에도 언제든 바꿀 수 있어요
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    OK
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

function HintRow({ hint }: { hint: NextHint }) {
  const tint =
    hint.tone === "main"
      ? "bg-brand-main/10 text-brand-main"
      : hint.tone === "sub"
        ? "bg-brand-sub/15 text-brand-main"
        : "bg-brand-accent/15 text-brand-main";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:gap-4">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tint}`}
      >
        <Icon icon={hint.icon} width="22" height="22" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 sm:text-base">
          {hint.title}
        </p>
        <p className="mt-0.5 text-sm text-slate-600">{hint.desc}</p>
      </div>
    </div>
  );
}
