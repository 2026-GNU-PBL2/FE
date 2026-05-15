import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

interface SetupShellProps {
  step: number;
  totalSteps: number;
  badge: string;
  title: ReactNode;
  description: ReactNode;
  rightContent: ReactNode;
  leftBottom?: ReactNode;
  rightCardClassName?: string;
}

export default function SetupShell({
  step,
  totalSteps,
  badge,
  title,
  description,
  rightContent,
  leftBottom,
  rightCardClassName,
}: SetupShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="relative overflow-hidden">
        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <section className="flex flex-col justify-center">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-brand-accent" />
                    {badge}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                    <span className="text-slate-900">{step}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500">{totalSteps}</span>
                    <span className="ml-1 text-slate-500">단계</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    {title}
                  </h1>

                  <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    {description}
                  </p>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)] sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-main/10 text-brand-main">
                      <Icon
                        icon="solar:shield-check-bold-duotone"
                        width="24"
                        height="24"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900 sm:text-base">
                        최초 가입에 필요한 정보만 순서대로 입력하면 됩니다
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        소셜 로그인 이후 부족한 계정 정보를 추가로 설정하는
                        단계입니다.
                      </p>
                    </div>
                  </div>
                </div>

                {leftBottom ? <div>{leftBottom}</div> : null}
              </div>
            </section>

            <section>
              <div className="relative">
                <div
                  className={
                    rightCardClassName ??
                    "relative rounded-[32px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6"
                  }
                >
                  {rightContent}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
