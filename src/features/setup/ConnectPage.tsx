// src/features/setup/ConnectPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

type ProviderKey = "bank" | "card" | "ott" | "email";

type Provider = {
  key: ProviderKey;
  title: string;
  desc: string;
  hint: string;
  icon: string;
  tone: "main" | "sub" | "accent";
  recommended?: boolean;
};

export default function ConnectPage() {
  const navigate = useNavigate();

  const providers: Provider[] = useMemo(
    () => [
      {
        key: "bank",
        title: "오픈뱅킹 연결",
        desc: "결제 내역 기반으로 구독을 자동 인식",
        hint: "가장 정확한 자동 탐지",
        icon: "solar:banknote-2-bold-duotone",
        tone: "main",
        recommended: true,
      },
      {
        key: "card",
        title: "카드사 연결",
        desc: "구독 결제를 빠르게 모아보기",
        hint: "카드 결제 중심이라면 추천",
        icon: "solar:card-bold-duotone",
        tone: "sub",
        recommended: true,
      },
      {
        key: "ott",
        title: "OTT 계정 연결",
        desc: "서비스별 이용 상태를 더 정교하게",
        hint: "연결 없이도 사용 가능",
        icon: "solar:tv-bold-duotone",
        tone: "accent",
      },
      {
        key: "email",
        title: "이메일 영수증 연결",
        desc: "구독 영수증/청구 알림을 스캔",
        hint: "개인정보 최소 수집",
        icon: "solar:letter-bold-duotone",
        tone: "main",
      },
    ],
    [],
  );

  const [selected, setSelected] = useState<Set<ProviderKey>>(new Set(["bank"]));
  const [agree, setAgree] = useState(false);

  const selectedCount = selected.size;

  const toggle = (key: ProviderKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const goComplete = () => {
    // 여기서 연결 선택값 저장/전송(Zustand/Query)로 붙이면 됨
    // selected, agree
    navigate("/setup/complete");
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 -top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -left-40 top-40 h-80 w-80 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid w-full grid-cols-1 items-start gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-14">
          {/* Left */}
          <section className="space-y-6 sm:space-y-7">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                연결 설정
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
                <span className="text-slate-500">3</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900">3</span>
                <span className="ml-1 text-slate-500">단계</span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                구독을 <span className="text-brand-main">정확하게</span>{" "}
                모으려면,
                <br className="block" />
                일부 연결이 도움이 돼요.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base lg:text-lg">
                연결은 선택이에요. 먼저 시작하고, 나중에 설정에서도 언제든
                추가할 수 있어요.
              </p>
            </div>

            {/* Trust / security card */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-2xl backdrop-blur sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-main/10 text-brand-main">
                  <Icon
                    icon="solar:shield-check-bold-duotone"
                    width="22"
                    height="22"
                  />
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-bold text-slate-900 sm:text-base">
                    최소 권한 · 필요한 정보만
                  </p>
                  <p className="text-sm text-slate-600">
                    결제/청구 내역을 기반으로 구독을 식별하며, 원치 않으면
                    언제든 연결을 해제할 수 있어요.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-main focus:ring-brand-main"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      데이터 연결 및 이용 안내에 동의합니다
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">
                      (필수) 연결 기능 사용을 위한 최소 동의
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/setup/preference")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
                >
                  <Icon icon="solar:arrow-left-bold" width="18" height="18" />
                  이전
                </button>

                <button
                  type="button"
                  onClick={goComplete}
                  disabled={!agree}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-main px-5 py-3 text-sm font-semibold text-white shadow-2xl transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  시작하기
                  <Icon icon="solar:check-circle-bold" width="18" height="18" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/setup/complete")}
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
              >
                연결 없이 시작하기
              </button>
            </div>
          </section>

          {/* Right */}
          <section className="lg:justify-self-stretch">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-linear-to-b from-brand-sub/20 via-brand-accent/10 to-transparent blur-2xl" />

              <div className="relative ml-auto w-full rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-2xl backdrop-blur sm:p-6 lg:max-w-3xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-brand-main sm:text-sm">
                      연결 옵션
                    </p>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      필요한 것만 선택하세요
                    </h2>
                    <p className="text-sm text-slate-600">
                      여러 개 선택 가능 · 추천 정확도는 연결할수록 올라가요
                    </p>
                  </div>

                  <div className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm sm:inline-flex">
                    <span className="text-slate-500">선택</span>
                    <span className="mx-1 text-slate-300">·</span>
                    <span className="text-slate-900">{selectedCount}</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2">
                  {providers.map((p) => (
                    <ConnectCard
                      key={p.key}
                      provider={p}
                      selected={selected.has(p.key)}
                      onClick={() => toggle(p.key)}
                      disabled={!agree}
                    />
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:mt-6">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-main" />
                    <p className="text-sm font-semibold text-slate-800">
                      동의 체크 후 연결 선택이 활성화돼요
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    LINK
                  </span>
                </div>

                {/* Bottom action row */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:mt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-accent/15 text-brand-main">
                        <Icon
                          icon="solar:magic-stick-3-bold-duotone"
                          width="18"
                          height="18"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          추천 세팅 프리셋
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                          오픈뱅킹 + 카드사 연결을 권장해요
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!agree}
                      onClick={() => setSelected(new Set(["bank", "card"]))}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon
                        icon="solar:wand-magic-sparkles-bold"
                        width="18"
                        height="18"
                      />
                      추천으로 선택
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ConnectCard({
  provider,
  selected,
  onClick,
  disabled,
}: {
  provider: Provider;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const tint =
    provider.tone === "main"
      ? "bg-brand-main/10 text-brand-main"
      : provider.tone === "sub"
        ? "bg-brand-sub/15 text-brand-main"
        : "bg-brand-accent/15 text-brand-main";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "group flex w-full items-start gap-3 rounded-2xl border bg-white px-4 py-4 text-left transition active:scale-[0.99]",
        disabled
          ? "cursor-not-allowed border-slate-200 opacity-50"
          : selected
            ? "border-brand-main shadow-md"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition",
            tint,
            selected ? "ring-2 ring-brand-main/20" : "group-hover:opacity-95",
          ].join(" ")}
        >
          <Icon icon={provider.icon} width="22" height="22" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-slate-900 sm:text-base">
                {provider.title}
              </p>
              {provider.recommended ? (
                <span className="inline-flex items-center rounded-full border border-brand-main/15 bg-brand-main/5 px-2 py-0.5 text-[11px] font-extrabold text-brand-main">
                  추천
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-slate-600">{provider.desc}</p>
          </div>

          <span
            className={[
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold",
              selected
                ? "border-brand-main/20 bg-brand-main/5 text-brand-main"
                : "border-slate-200 bg-white text-slate-500",
            ].join(" ")}
          >
            <Icon
              icon={
                selected ? "solar:check-circle-bold" : "solar:add-circle-bold"
              }
              width="16"
              height="16"
            />
            {selected ? "선택됨" : "선택"}
          </span>
        </div>

        <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
          <p className="text-xs font-semibold text-slate-600">
            {provider.hint}
          </p>
        </div>
      </div>
    </button>
  );
}
