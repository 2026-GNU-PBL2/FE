// src/features/setup/PreferencePage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

type GenreKey =
  | "drama"
  | "romance"
  | "comedy"
  | "action"
  | "thriller"
  | "sf"
  | "fantasy"
  | "documentary"
  | "animation"
  | "variety"
  | "kids"
  | "sports";

type Genre = {
  key: GenreKey;
  label: string;
  desc: string;
  icon: string;
  tone: "main" | "sub" | "accent";
};

export default function PreferencePage() {
  const navigate = useNavigate();

  const genres: Genre[] = useMemo(
    () => [
      {
        key: "drama",
        label: "드라마",
        desc: "몰입감 있는 스토리",
        icon: "solar:clapperboard-play-bold-duotone",
        tone: "main",
      },
      {
        key: "romance",
        label: "로맨스",
        desc: "설렘 가득한 이야기",
        icon: "solar:heart-angle-bold-duotone",
        tone: "accent",
      },
      {
        key: "comedy",
        label: "코미디",
        desc: "가볍게 웃고 싶을 때",
        icon: "solar:emoji-funny-square-bold-duotone",
        tone: "sub",
      },
      {
        key: "action",
        label: "액션",
        desc: "속도감 있는 전개",
        icon: "solar:bolt-bold-duotone",
        tone: "main",
      },
      {
        key: "thriller",
        label: "스릴러",
        desc: "긴장감의 연속",
        icon: "solar:mask-happly-bold-duotone",
        tone: "sub",
      },
      {
        key: "sf",
        label: "SF",
        desc: "미래·기술·우주",
        icon: "solar:planet-3-bold-duotone",
        tone: "accent",
      },
      {
        key: "fantasy",
        label: "판타지",
        desc: "상상력 풀가동",
        icon: "solar:magic-stick-3-bold-duotone",
        tone: "accent",
      },
      {
        key: "documentary",
        label: "다큐",
        desc: "현실을 깊게",
        icon: "solar:book-2-bold-duotone",
        tone: "main",
      },
      {
        key: "animation",
        label: "애니",
        desc: "취향저격 그림체",
        icon: "solar:palette-round-bold-duotone",
        tone: "sub",
      },
      {
        key: "variety",
        label: "예능",
        desc: "편하게 보기",
        icon: "solar:confetti-bold-duotone",
        tone: "accent",
      },
      {
        key: "kids",
        label: "키즈",
        desc: "가족과 함께",
        icon: "solar:balloon-bold-duotone",
        tone: "sub",
      },
      {
        key: "sports",
        label: "스포츠",
        desc: "라이브·하이라이트",
        icon: "solar:football-bold-duotone",
        tone: "main",
      },
    ],
    [],
  );

  const [selected, setSelected] = useState<Set<GenreKey>>(new Set());
  const selectedCount = selected.size;

  const toggle = (key: GenreKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  const goNext = () => {
    // 여기서 selected를 저장/전송하고 싶으면 Zustand/Query로 연결하면 됨
    navigate("/setup/connect");
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
                취향 설정
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
                <span className="text-slate-500">2</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900">3</span>
                <span className="ml-1 text-slate-500">단계</span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                자주 보는 <span className="text-brand-main">장르</span>를
                <br className="hidden sm:block" />
                선택해 주세요.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base lg:text-lg">
                선택한 취향을 바탕으로 구독 추천과 정리 우선순위가 더
                정확해져요.
              </p>
            </div>

            {/* Selection summary */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-2xl backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-brand-main sm:text-sm">
                    선택 현황
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-lg font-bold text-slate-900 sm:text-xl">
                      {selectedCount}개 선택됨
                    </p>
                    <p className="pb-0.5 text-xs font-semibold text-slate-400 sm:text-sm">
                      (추천 정확도 ↑)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  <Icon
                    icon="solar:trash-bin-trash-bold-duotone"
                    width="18"
                    height="18"
                  />
                  초기화
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCount === 0 ? (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 sm:text-sm">
                    아직 선택이 없어요. 2~5개 정도 추천드려요.
                  </span>
                ) : (
                  Array.from(selected).map((key) => {
                    const g = genres.find((x) => x.key === key);
                    if (!g) return null;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                        {g.label}
                      </span>
                    );
                  })
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/setup/intro")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
                >
                  <Icon icon="solar:arrow-left-bold" width="18" height="18" />
                  이전
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={selectedCount === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-main px-5 py-3 text-sm font-semibold text-white shadow-2xl transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  다음으로
                  <Icon icon="solar:arrow-right-bold" width="18" height="18" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/setup/connect")}
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
              >
                지금은 건너뛰기
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
                      OTT 장르 선택
                    </p>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      무엇을 즐겨 보시나요?
                    </h2>
                    <p className="text-sm text-slate-600">
                      여러 개 선택 가능 · 나중에 언제든 변경 가능
                    </p>
                  </div>

                  <div className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm sm:inline-flex">
                    <span className="text-slate-500">선택</span>
                    <span className="mx-1 text-slate-300">·</span>
                    <span className="text-slate-900">{selectedCount}</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2">
                  {genres.map((g) => (
                    <GenreCard
                      key={g.key}
                      genre={g}
                      selected={selected.has(g.key)}
                      onClick={() => toggle(g.key)}
                    />
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:mt-6">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-main" />
                    <p className="text-sm font-semibold text-slate-800">
                      최소 1개 선택하면 다음으로 진행돼요
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    PREF
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

function GenreCard({
  genre,
  selected,
  onClick,
}: {
  genre: Genre;
  selected: boolean;
  onClick: () => void;
}) {
  const tint =
    genre.tone === "main"
      ? "bg-brand-main/10 text-brand-main"
      : genre.tone === "sub"
        ? "bg-brand-sub/15 text-brand-main"
        : "bg-brand-accent/15 text-brand-main";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-4 text-left transition active:scale-[0.99]",
        selected
          ? "border-brand-main shadow-md"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-2xl transition",
          tint,
          selected ? "ring-2 ring-brand-main/20" : "group-hover:opacity-95",
        ].join(" ")}
      >
        <Icon icon={genre.icon} width="22" height="22" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-900 sm:text-base">
            {genre.label}
          </p>

          <span
            className={[
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold",
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

        <p className="mt-0.5 text-sm text-slate-600">{genre.desc}</p>
      </div>
    </button>
  );
}
