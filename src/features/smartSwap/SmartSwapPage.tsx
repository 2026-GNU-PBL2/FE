// src/features/smartswap/SmartSwapPage.tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  Film,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { mockServer } from "@/api/mockServer";

function ChartFrame({
  heightClass,
  children,
}: {
  heightClass: string;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const read = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      setSize((prev) =>
        prev.width === w && prev.height === h ? prev : { width: w, height: h },
      );
    };

    read();

    const ro = new ResizeObserver(() => read());
    ro.observe(el);

    const raf1 = requestAnimationFrame(read);
    const raf2 = requestAnimationFrame(read);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ro.disconnect();
    };
  }, []);

  const ready = size.width > 1 && size.height > 1;

  return (
    <div className={clsx("w-full min-w-0", heightClass)}>
      <div ref={ref} className="h-full w-full">
        {ready ? (
          children(size)
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl border border-slate-100 bg-white">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
          </div>
        )}
      </div>
    </div>
  );
}

/** ✅ 렌더 중 생성 금지 이슈 해결: 컴포넌트는 파일 스코프(바깥)에서 선언 */
function KPI({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500">{label}</p>
        <p className="truncate text-base font-extrabold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

type SmartSwapData = {
  hero: {
    title: string;
    subtitle: string;
    savePerMonth: number;
    matchRateUp: number;
    newTitles: number;
    yearlySave: number;
    currentService: string;
    recommendedService: string; // ✅ 상단 “최고 추천” (고정)
  };
  radarData: Array<{
    subject: string;
    A: number;
    B: number;
    C: number;
  }>;
  otherRecs: Array<{
    name: string;
    tag: string;
    match: number;
    save: number;
    color: "main" | "sub" | "slate";
  }>;
};

type RecItem = {
  name: string;
  tag: string;
  match: number;
  save: number;
  color: "main" | "sub" | "slate";
  isBest?: boolean;
};

export const SmartSwapPage = () => {
  const queryClient = useQueryClient();

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["smartSwap"],
    queryFn: mockServer.getSmartSwap,
  });

  const swapMutation = useMutation({
    mutationFn: mockServer.oneClickSwap,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["smartSwap"] });
    },
  });

  const d = data as SmartSwapData | undefined;

  const hero = useMemo(() => {
    const h = d?.hero;
    return {
      title: h?.title ?? "이번 달, 구독 갈아타기 찬스",
      subtitle:
        h?.subtitle ??
        "취향 매칭과 신작 흐름을 반영해, 더 잘 맞는 구독 조합을 추천해요.",
      savePerMonth: h?.savePerMonth ?? 3600,
      matchRateUp: h?.matchRateUp ?? 7,
      newTitles: h?.newTitles ?? 10,
      yearlySave: h?.yearlySave ?? 43200,
      currentService: h?.currentService ?? "넷플릭스",
      recommendedService: h?.recommendedService ?? "웨이브", // ✅ 상단 고정
    };
  }, [d]);

  const radarData = useMemo(() => {
    const raw = d?.radarData ?? [];
    const mapSubject = (s: string) => {
      const t = String(s ?? "");
      if (t.includes("Drama") || t.includes("드라마")) return "드라마";
      if (t.includes("Movie") || t.includes("영화")) return "영화";
      if (t.includes("Variety") || t.includes("예능")) return "예능";
      if (t.includes("Anime") || t.includes("애니")) return "애니";
      if (t.includes("Sports") || t.includes("스포츠")) return "스포츠";
      if (t.includes("Documentary") || t.includes("다큐")) return "다큐";
      return t || "기타";
    };

    const normalized = raw.map((r) => ({
      ...r,
      subject: mapSubject(r.subject),
    }));

    if (normalized.length === 0) {
      return [
        { subject: "드라마", A: 78, B: 65, C: 72 },
        { subject: "영화", A: 62, B: 70, C: 58 },
        { subject: "예능", A: 54, B: 45, C: 67 },
        { subject: "애니", A: 41, B: 60, C: 38 },
        { subject: "스포츠", A: 36, B: 25, C: 52 },
        { subject: "다큐", A: 48, B: 40, C: 55 },
      ];
    }

    return normalized;
  }, [d]);

  // ✅ “선택 가능한 3개 조합” 구성:
  // - 1번(맨 위): 상단 리포트의 추천 OTT(최고 추천) = 고정
  // - 아래 2개: otherRecs에서 최고 추천을 제외한 2개
  const selectableRecs = useMemo<RecItem[]>(() => {
    const raw = (d?.otherRecs ?? []).map((r) => ({
      name: r.name,
      tag: r.tag && /[A-Za-z]/.test(r.tag) ? "추천 조합" : r.tag || "추천 조합",
      match: r.match,
      save: r.save,
      color: r.color,
    }));

    const bestName = hero.recommendedService;

    // 서버 otherRecs에 bestName이 있으면 그 값을 best로 사용
    const foundBest = raw.find((x) => x.name === bestName);

    const best: RecItem = foundBest
      ? { ...foundBest, isBest: true }
      : {
          name: bestName,
          tag: "가장 추천하는 조합",
          match: 72,
          save: hero.savePerMonth,
          color: "main",
          isBest: true,
        };

    const rest = raw.filter((x) => x.name !== best.name);

    // ✅ 아래 2개만 노출
    const tail = rest.slice(0, 2);

    // ✅ 항상 3개(최고추천 + 2개)
    // 만약 rest가 부족하면 더미로 채움
    while (tail.length < 2) {
      const fallback: RecItem =
        tail.length === 0
          ? {
              name: "티빙",
              tag: "국내 예능/드라마 강점",
              match: 69,
              save: 1200,
              color: "sub",
            }
          : {
              name: "쿠팡플레이",
              tag: "스포츠·독점 콘텐츠",
              match: 61,
              save: 900,
              color: "slate",
            };
      if (![best, ...tail].some((x) => x.name === fallback.name)) {
        tail.push(fallback);
      } else {
        break;
      }
    }

    return [best, ...tail];
  }, [d, hero.recommendedService, hero.savePerMonth]);

  /**
   * ✅ 에러 해결 핵심
   * - idx를 useEffect로 리셋(setState)하지 않는다.
   * - 선택 상태는 "name"으로 들고가고, recs가 바뀌면 find 실패 시 0번으로 자연 fallback.
   */
  const [selectedName, setSelectedName] = useState<string>("");

  // 최초 1회만: 아직 선택값이 없으면 0번(최고추천)로 세팅
  // (이건 "조건부"라 렌더 폭주 패턴이 아니고, 데이터 로딩 후 1번만 들어감)
  if (!selectedName && selectableRecs[0]?.name) {
    setSelectedName(selectableRecs[0].name);
  }

  const selectedRec = useMemo(() => {
    return (
      selectableRecs.find((x) => x.name === selectedName) ?? selectableRecs[0]
    );
  }, [selectableRecs, selectedName]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 h-80 animate-pulse rounded-3xl border border-slate-100 bg-white" />
      </div>
    );
  }

  if (isError || !d || !selectedRec) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-slate-900">
          스마트 스왑 데이터를 불러오지 못했어요.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const cardTone =
    "bg-white/75 border border-slate-100 shadow-sm backdrop-blur";
  const brandStrokeMain = "#1E3A8A";
  const brandStrokeAccent = "#2DD4BF";

  return (
    <div
      className={[
        "relative transform-gpu transition duration-500 ease-out",
        "motion-reduce:transition-none motion-reduce:transform-none",
        entered
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-95",
      ].join(" ")}
    >
      {/* Soft Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-50 -right-45 h-130 w-130 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -left-50 top-45 h-105 w-105 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      <div className="space-y-6">
        {/* ✅ 상단 카드: “최고 추천” 고정 (선택에 의해 절대 바뀌면 안 됨) */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-main via-brand-sub to-brand-accent" />

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-main" />
                스마트 스왑 추천 리포트
              </div>

              <h1 className="mt-3 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                {hero.title}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                {hero.subtitle}
              </p>

              <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                <span className="text-slate-500">현재</span>
                <span className="text-slate-900">{hero.currentService}</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">최고 추천</span>
                <span className="text-slate-900">
                  {hero.recommendedService}
                </span>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-130 lg:grid-cols-1">
              <KPI
                label="월 절약 예상"
                value={`₩${hero.savePerMonth.toLocaleString()}`}
                icon={
                  <span className="text-base font-extrabold text-emerald-700">
                    ₩
                  </span>
                }
              />
              <KPI
                label="취향 매칭 상승"
                value={`+${hero.matchRateUp}%p`}
                icon={<TrendingUp className="h-4.5 w-4.5 text-brand-main" />}
              />
              <KPI
                label="신규 콘텐츠"
                value={
                  <>
                    {hero.newTitles}
                    <span className="ml-1 text-xs font-semibold text-slate-500">
                      편
                    </span>
                  </>
                }
                icon={<Film className="h-4.5 w-4.5 text-brand-accent" />}
              />

              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <p className="text-[11px] font-semibold text-slate-500">
                  연간 절약
                </p>
                <p className="mt-0.5 text-base font-extrabold text-slate-900">
                  ₩{hero.yearlySave.toLocaleString()}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  시청 이력 + 신작 공개량 + 장르 선호를 종합해요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Chart + 비교 영역 */}
          <div
            className={clsx("min-w-0 rounded-3xl p-6 lg:col-span-7", cardTone)}
          >
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  현재 vs 추천 분석
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  오른쪽에서 조합을 바꾸면, 아래 “추천 카드”와 “원클릭 적용
                  대상”이 함께 바뀌어요.
                </p>
              </div>

              {/* ✅ 중간 분석의 “선택된 조합” 표시 (상단 리포트와 분리) */}
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                <span className="text-slate-500">선택 조합</span>
                <span className="text-slate-900">{selectedRec.name}</span>
                <span className="mx-1 h-3 w-px bg-slate-200" />
                <span className="text-emerald-700">
                  월 ₩{selectedRec.save.toLocaleString()} 절약
                </span>
              </div>
            </div>

            <div className="relative">
              <ChartFrame heightClass="h-88">
                {({ width, height }) => (
                  <RadarChart
                    width={width}
                    height={height}
                    cx={Math.floor(width / 2)}
                    cy={Math.floor(height / 2)}
                    outerRadius={Math.floor(Math.min(width, height) * 0.36)}
                    data={radarData}
                  >
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />

                    <Radar
                      name="내 취향"
                      dataKey="A"
                      stroke={brandStrokeMain}
                      strokeWidth={2}
                      fill={brandStrokeMain}
                      fillOpacity={0.12}
                    />

                    <Radar
                      name={hero.currentService}
                      dataKey="B"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="#ef4444"
                      fillOpacity={0.08}
                    />

                    {/* ✅ 라벨은 선택된 추천 조합으로 표시 */}
                    <Radar
                      name={selectedRec.name}
                      dataKey="C"
                      stroke={brandStrokeAccent}
                      strokeWidth={2}
                      fill={brandStrokeAccent}
                      fillOpacity={0.1}
                    />
                  </RadarChart>
                )}
              </ChartFrame>

              <div className="mt-4 flex flex-wrap justify-center gap-5">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-brand-main/60" />
                  <span className="font-medium text-slate-700">내 취향</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <span className="font-medium text-slate-700">
                    {hero.currentService}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-brand-accent/60" />
                  <span className="font-medium text-slate-700">
                    {selectedRec.name}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ 비교 카드: 오른쪽(추천) 카드가 선택된 조합으로 교체 */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                    {hero.currentService.slice(0, 1)}
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {hero.currentService}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">매칭률</span>
                    <span className="font-bold text-slate-900">65%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">신작</span>
                    <span className="font-bold text-slate-900">8편</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                    <span className="text-slate-500">월 요금</span>
                    <span className="font-bold text-slate-900">₩13,500</span>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-brand-accent/20 bg-brand-accent/10 p-4">
                <div className="absolute right-0 top-0 rounded-bl-xl bg-brand-accent px-2 py-1 text-[10px] font-bold text-white">
                  선택 추천
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                    {selectedRec.name.slice(0, 1)}
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedRec.name}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">매칭률</span>
                    <span className="font-bold text-emerald-700">
                      {selectedRec.match}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">절약</span>
                    <span className="font-bold text-slate-900">
                      월 ₩{selectedRec.save.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-emerald-200/60 pt-2 text-xs">
                    <span className="text-slate-600">설명</span>
                    <span className="font-bold text-slate-900">
                      {selectedRec.tag}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-semibold text-slate-900">분석 기준</p>
              <p className="mt-1 text-xs text-slate-500">
                시청 이력 가중치 + 플랫폼별 신작 공개량 + 장르 선호를 종합해요.
              </p>
            </div>
          </div>

          {/* ✅ 우측: 선택 가능한 3개 조합 (맨 위 = 상단 리포트의 최고 추천) */}
          <div className="space-y-4 lg:col-span-5">
            <h3 className="text-lg font-bold text-slate-900">
              추천 조합 선택 (3가지)
            </h3>

            {selectableRecs.map((item, idx) => {
              const selected = item.name === selectedRec.name;
              return (
                <button
                  key={`${item.name}-${idx}`}
                  type="button"
                  onClick={() => setSelectedName(item.name)}
                  className={clsx(
                    "group w-full rounded-2xl border bg-white/75 p-5 text-left shadow-sm backdrop-blur transition",
                    "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-main/20",
                    selected
                      ? "border-brand-main/20 ring-1 ring-brand-main/10"
                      : "border-slate-100",
                  )}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          "flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white transition",
                          item.color === "main"
                            ? "bg-brand-main"
                            : item.color === "sub"
                              ? "bg-brand-sub"
                              : "bg-slate-800",
                          selected ? "scale-105" : "scale-100",
                        )}
                      >
                        {item.name.slice(0, 1)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate font-bold text-slate-900">
                            {item.name}
                          </h4>

                          {item.isBest && (
                            <span className="rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-extrabold text-white">
                              최고 추천
                            </span>
                          )}

                          {selected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              선택됨
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.tag}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={clsx(
                          "h-full rounded-full transition",
                          item.color === "main"
                            ? "bg-brand-main"
                            : item.color === "sub"
                              ? "bg-brand-sub"
                              : "bg-slate-800",
                          selected ? "opacity-100" : "opacity-80",
                        )}
                        style={{ width: `${item.match}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {item.match}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      예상 절약
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      월 ₩{item.save.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-4 h-px bg-slate-100" />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      이 조합으로 적용/비교
                    </span>
                    <span className="text-xs font-bold text-slate-900 transition group-hover:translate-x-0.5">
                      보기 →
                    </span>
                  </div>
                </button>
              );
            })}

            <div className="rounded-2xl border border-brand-sub/20 bg-brand-sub/10 p-4 text-xs leading-relaxed text-slate-700">
              <div className="flex gap-3">
                <div className="shrink-0">ℹ️</div>
                <p>
                  “최고 추천”은 상단 리포트와 동일하게 고정이며, 아래는 대안
                  조합이에요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ CTA: 선택된 조합 기준으로 적용 (상단 리포트는 고정) */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/80 shadow-sm backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-main via-brand-sub to-brand-accent" />

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-main" />
                원클릭 스왑
              </div>

              <h3 className="mt-3 text-xl font-extrabold text-slate-900">
                {hero.currentService} →{" "}
                <span className="text-brand-main">{selectedRec.name}</span>{" "}
                적용하기
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                선택한 조합을 바로 적용할 수 있어요.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <span className="text-emerald-600">✓</span> 자동 해지
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <span className="text-emerald-600">✓</span> 가입/전환
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <span className="text-emerald-600">✓</span> 자동 반영
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                  월 ₩{selectedRec.save.toLocaleString()} 절약
                </span>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-500">
                      적용 대상
                    </p>
                    <p className="mt-0.5 truncate text-base font-extrabold text-slate-900">
                      {selectedRec.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedRec.tag}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-right">
                    <p className="text-[11px] font-semibold text-slate-500">
                      예상 절약
                    </p>
                    <p className="mt-0.5 text-sm font-extrabold text-emerald-700">
                      월 ₩{selectedRec.save.toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  disabled={swapMutation.isPending}
                  onClick={() => swapMutation.mutate()}
                  className={clsx(
                    "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow-sm transition",
                    "bg-brand-main hover:opacity-95 disabled:opacity-60",
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  {swapMutation.isPending
                    ? "스왑 적용 중…"
                    : "원클릭 스왑 적용"}
                </button>

                <p className="mt-2 text-center text-[11px] text-slate-400">
                  실제 결제/해지는 연결된 결제수단 설정에 따라 달라질 수 있어요.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
};
