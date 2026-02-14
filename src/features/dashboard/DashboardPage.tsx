// src/features/dashboard/DashboardPage.tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Sparkles,
  TrendingDown,
  CreditCard,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { mockServer } from "@/api/mockServer";
import { useNavStore } from "@/stores/useNavStore";
import { useScrollToTop } from "@/shared/hooks/useScrollToTop";

type LinePoint = { month: string; amount: number };
type PieSlice = { name: string; value: number; color: string };
type SubItem = {
  name: string;
  icon: string;
  category: string;
  date: string;
  cost: number;
};

type DashboardData = {
  summary: {
    totalMonthlySpend: number;
    deltaFromLastMonth: number;
    yearlySpend: number;
    activeSubs: number;
    rewardPoints: number;
  };
  lineData: LinePoint[];
  pieData: PieSlice[];
  subscriptions: SubItem[];
};

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
    <div className={`min-w-0 w-full ${heightClass}`}>
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

export const DashboardPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: mockServer.getDashboard,
  });

  // ✅ swap / savings 탭 이동
  const navigateTab = useNavStore((s) => s.navigate) as (
    id: "dashboard" | "swap" | "party" | "savings",
  ) => void;

  const { scrollToTop } = useScrollToTop();

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const now = useMemo(() => {
    const d = new Date();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return { m, day };
  }, []);

  const safeLineData = useMemo(() => {
    const d = data as DashboardData | undefined;
    const raw = d?.lineData ?? [];
    return raw.map((p) => ({
      ...p,
      month: String(p.month).includes("월") ? p.month : `${p.month}월`,
    }));
  }, [data]);

  const totalPie = useMemo(() => {
    const d = data as DashboardData | undefined;
    const raw = d?.pieData ?? [];
    return raw.reduce((acc, cur) => acc + (cur.value || 0), 0);
  }, [data]);

  const moneyFormatter = useMemo(
    () => (value: number | string | undefined) => {
      const n =
        typeof value === "number"
          ? value
          : typeof value === "string"
            ? Number(value)
            : 0;

      return `₩${(Number.isFinite(n) ? n : 0).toLocaleString()}`;
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-100" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-3xl border border-slate-100 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-slate-900">
          대시보드를 불러오지 못했어요.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const { summary, pieData, subscriptions } = data as DashboardData;

  const chartStroke = "#1E3A8A";
  const activeDot = "#38BDF8";

  // ✅ 대시보드엔 아직 챌린지 데이터가 없어서 "유도 카드"는 UI용 값으로 구성
  const challengeTotalMonths = 6;
  const challengeCurrentMonth = 3;
  const challengeMonthlyAmount = 12000;
  const challengeSavedTotal = challengeMonthlyAmount * challengeCurrentMonth;
  const challengePercent = Math.min(
    (challengeCurrentMonth / challengeTotalMonths) * 100,
    100,
  );

  return (
    <div
      className={[
        "relative transform-gpu transition duration-500 ease-out",
        "motion-reduce:transition-none motion-reduce:transform-none",
        entered ? "opacity-100 scale-100" : "opacity-0 scale-95",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-50 -right-45 h-130 w-130 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -left-50 top-45 h-105 w-105 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      <div className="space-y-6">
        {/* ✅ 상단: '구독 추가하기' 제거 → 자동 인식/보안/업데이트 배지로 대체 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              이번 달 구독 현황 👋🏻
            </h1>
            <p className="mt-1 text-slate-500">
              {now.m}월 {now.day}일 기준, 구독을 더 똑똑하게 관리해 보세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
              <CreditCard className="h-3.5 w-3.5 text-brand-main" />
              결제 내역 기반 자동 인식
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
              연결 정보 암호화
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">이번 달 총 지출</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              ₩{summary.totalMonthlySpend.toLocaleString()}
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <TrendingDown className="h-3.5 w-3.5" />
              지난달 대비 ₩
              {Math.abs(summary.deltaFromLastMonth).toLocaleString()} 절약
            </div>

            <p className="mt-3 text-xs text-slate-400">
              결제 내역 기반 추정치예요.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">연간 지출 추정</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              ₩{summary.yearlySpend.toLocaleString()}
            </p>
            <p className="mt-3 text-xs text-slate-400">
              현재 활성 구독 기준으로 계산돼요.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">활성 구독</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {summary.activeSubs}개
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-main">
              <CreditCard className="h-3.5 w-3.5" />
              자동결제 연결됨
            </div>
            <p className="mt-3 text-xs text-slate-400">
              결제 예정일도 자동 추적돼요.
            </p>
          </div>

          {/* ✅ 챌린지 유도 카드 */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-brand-sub/15 blur-3xl" />
              <div className="absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-brand-accent/15 blur-3xl" />
              <div className="absolute inset-0 bg-linear-to-br from-white/50 via-transparent to-transparent" />
            </div>

            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500">
                구독 적립 챌린지
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {challengeCurrentMonth} / {challengeTotalMonths}개월 진행 중
              </p>

              <p className="mt-2 text-xs text-slate-500">
                매달{" "}
                <span className="font-semibold text-slate-900">
                  ₩{challengeMonthlyAmount.toLocaleString()}
                </span>{" "}
                적립 · 현재까지{" "}
                <span className="font-semibold text-brand-main">
                  ₩{challengeSavedTotal.toLocaleString()}
                </span>{" "}
                모았어요
              </p>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>진행률</span>
                  <span>{challengePercent.toFixed(0)}%</span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand-main to-brand-sub transition-all duration-700"
                    style={{ width: `${challengePercent}%` }}
                    aria-label="챌린지 진행률"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigateTab("savings");
                  scrollToTop();
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-main px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                챌린지 보러가기
                <ChevronRight className="h-4 w-4" />
              </button>

              <p className="mt-3 text-[11px] text-slate-400">
                6개월 달성 시 무료 이용권 리워드를 받을 수 있어요.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-brand-accent/20 bg-brand-accent/10 p-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-brand-accent p-3 text-white shadow-lg shadow-brand-accent/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                스마트 스왑 추천
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                이번 달{" "}
                <span className="font-semibold text-slate-900">디즈니+</span>{" "}
                신규 콘텐츠가 많아요. 넷플릭스에서 바꾸면{" "}
                <span className="font-semibold text-brand-main">월 ₩3,600</span>{" "}
                절약할 수 있어요.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              navigateTab("swap");
              scrollToTop();
            }}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand-main px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            상세 보기
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="min-w-0 rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur lg:col-span-2">
            <div className="mb-6">
              <h3 className="font-bold text-slate-900">최근 6개월 지출 추이</h3>
              <p className="mt-1 text-sm text-slate-500">
                구독 지출 변화를 한눈에 확인해요.
              </p>
            </div>

            <ChartFrame heightClass="h-64">
              {({ width, height }) => (
                <LineChart width={width} height={height} data={safeLineData}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <RechartsTooltip
                    formatter={moneyFormatter}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid rgb(226 232 240)",
                      boxShadow: "0 10px 20px -10px rgb(15 23 42 / 0.25)",
                      backgroundColor: "rgba(255,255,255,0.95)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={chartStroke}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: activeDot }}
                  />
                </LineChart>
              )}
            </ChartFrame>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-xs text-slate-500">이번 달</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  ₩{summary.totalMonthlySpend.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-xs text-slate-500">연간 추정</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  ₩{summary.yearlySpend.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-xs text-slate-500">활성 구독</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {summary.activeSubs}개
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">카테고리별 지출</h3>
              <p className="mt-1 text-sm text-slate-500">이번 달 기준</p>
            </div>

            <div className="relative flex w-full items-center justify-center">
              <ChartFrame heightClass="h-48">
                {({ width, height }) => (
                  <PieChart width={width} height={height}>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={82}
                      paddingAngle={6}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                )}
              </ChartFrame>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-slate-400">합계</p>
                  <p className="text-lg font-bold text-slate-900">
                    ₩{totalPie.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ₩{item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              리포트 보기
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white/75 shadow-sm backdrop-blur">
          {/* ✅ '전체 보기' 제거 → 활성 개수/자동 인식 배지로 대체 */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">활성 구독 목록</h3>
              <p className="mt-1 text-sm text-slate-500">
                다음 결제일과 월 비용을 확인하세요.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                <CreditCard className="h-3.5 w-3.5 text-brand-main" />
                활성 {subscriptions.length}개
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                결제 내역 자동 업데이트
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {subscriptions.map((sub, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between gap-4 p-4 transition hover:bg-white/70"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src={sub.icon}
                      alt={sub.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {sub.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        {sub.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        다음 결제: {sub.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ₩{sub.cost.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">/월</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-semibold text-slate-900">
                팁: 안 쓰는 구독이 있나요?
              </p>
              <p className="mt-1 text-xs text-slate-500">
                최근 사용량이 낮은 구독을 자동으로 찾아 정리해 드려요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
