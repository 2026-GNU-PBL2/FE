import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AreaChart, Area, XAxis, Tooltip } from "recharts";

type ChartPoint = { month: string; saved: number };

function ChartFrame({
  heightClass,
  children,
}: {
  heightClass: string;
  children: (size: { width: number; height: number }) => React.ReactNode;
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

/** 현재는 "자주 보는 OTT"를 더미로 고정/선정 (seed 기반) */
function pickTopOtt(seedText: string) {
  const candidates = ["Netflix", "Disney+", "YouTube Premium"] as const;
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  return candidates[hash % candidates.length];
}

type Reward = {
  milestoneMonths: number; // 6, 12, 18 ...
  title: string;
  subtitle: string;
};

function buildSixMonthRewards(seedText: string, maxMonths = 24): Reward[] {
  const topOtt = pickTopOtt(seedText);
  const rewards: Reward[] = [];

  for (let m = 6; m <= maxMonths; m += 6) {
    const freeMonths = Math.floor(m / 6); // 6->1, 12->2 ...
    rewards.push({
      milestoneMonths: m,
      title: `${topOtt} ${freeMonths}개월 무료 이용권`,
      subtitle: `${m}개월 적립 달성 시 제공돼요.`,
    });
  }

  return rewards;
}

const formatMoney = (n: number) =>
  `₩${Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)).toLocaleString()}`;

export const BenefitChart = ({
  data,
  currentMonth,
}: {
  data: ChartPoint[];
  currentMonth: number;
}) => {
  const safeMonth = Math.max(0, Math.floor(currentMonth || 0));

  const seedText = useMemo(() => {
    const lastLabel = data[data.length - 1]?.month ?? "seed";
    return `${lastLabel}-${safeMonth}`;
  }, [data, safeMonth]);

  const rewardTable = useMemo(
    () => buildSixMonthRewards(seedText, 24),
    [seedText],
  );

  const currentReward = useMemo(() => {
    const eligible = rewardTable.filter((r) => r.milestoneMonths <= safeMonth);
    return eligible.length ? eligible[eligible.length - 1] : null;
  }, [rewardTable, safeMonth]);

  const nextReward = useMemo(() => {
    return rewardTable.find((r) => r.milestoneMonths > safeMonth) ?? null;
  }, [rewardTable, safeMonth]);

  const monthsToNext = nextReward ? nextReward.milestoneMonths - safeMonth : 0;

  // 진행중인 "6개월 시즌" 배지용
  const seasonStart = useMemo(() => {
    if (safeMonth <= 0) return 0;
    return Math.floor((safeMonth - 1) / 6) * 6; // 1~6 => 0, 7~12 => 6 ...
  }, [safeMonth]);

  const seasonEnd = seasonStart + 6;

  // 누적 적립 금액: 마지막 데이터의 saved
  const last = data[data.length - 1];
  const savedTotal = last?.saved ?? 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
      {/* soft background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">다음 리워드</p>

          {nextReward ? (
            <>
              <h3 className="mt-1 truncate text-2xl font-bold text-slate-900">
                {nextReward.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {monthsToNext}개월 더 적립하면 받을 수 있어요.
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-1 truncate text-2xl font-bold text-slate-900">
                다음 시즌 리워드 준비 중
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                이번 시즌 목표를 모두 달성했어요.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-brand-main/15 bg-brand-main/10 px-3 py-1 text-xs font-bold text-brand-main">
            {seasonStart + 1}~{seasonEnd}개월 시즌
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-1 text-xs font-bold text-slate-700">
            진행 {safeMonth}개월
          </div>
        </div>
      </div>

      {/* 상태 카드 (다른 카드들과 톤 맞추기) */}
      <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">현재 달성</p>
          {currentReward ? (
            <>
              <p className="mt-1 truncate text-sm font-bold text-slate-900">
                {currentReward.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {currentReward.milestoneMonths}개월 적립 달성
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm font-bold text-slate-900">
                첫 리워드까지 조금만 더
              </p>
              <p className="mt-1 text-xs text-slate-500">
                6개월 적립을 달성하면 리워드를 받을 수 있어요.
              </p>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">누적 적립 금액</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatMoney(savedTotal)}
          </p>
          {nextReward ? (
            <p className="mt-1 text-xs text-slate-500">
              다음 리워드까지 {monthsToNext}개월
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              다음 시즌 리워드가 곧 열려요.
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 mt-4">
        <ChartFrame heightClass="h-32">
          {({ width, height }) => {
            const chartW = Math.max(1, Math.floor(width));
            const chartH = Math.max(1, Math.floor(height));

            return (
              <div className="-ml-2">
                <AreaChart width={chartW} height={chartH} data={data}>
                  <defs>
                    <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#38BDF8"
                        stopOpacity={0.35}
                      />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="month" hide />

                  <Tooltip
                    formatter={(value: number | string | undefined) => {
                      const n =
                        typeof value === "number"
                          ? value
                          : typeof value === "string"
                            ? Number(value)
                            : 0;
                      const safe = Number.isFinite(n) ? n : 0;
                      return formatMoney(safe);
                    }}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.96)",
                      border: "1px solid rgb(226 232 240)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 20px -10px rgb(15 23 42 / 0.25)",
                      fontSize: "12px",
                      color: "rgb(15 23 42)",
                    }}
                    itemStyle={{ color: "rgb(15 23 42)" }}
                  />

                  <Area
                    type="monotone"
                    dataKey="saved"
                    stroke="#1E3A8A"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSaved)"
                    dot={false}
                  />
                </AreaChart>
              </div>
            );
          }}
        </ChartFrame>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-main/80" />
            <span className="font-semibold text-slate-700">누적 적립</span>
          </div>

          <p className="text-[11px] text-slate-400">
            리워드는 적립 달성 조건에 따라 제공돼요.
          </p>
        </div>
      </div>
    </div>
  );
};
