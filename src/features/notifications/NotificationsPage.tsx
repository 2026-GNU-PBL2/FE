// src/features/notifications/NotificationsPage.tsx
import { useEffect, useMemo } from "react";
import { Bell, ChevronRight, CreditCard, Sparkles, Users } from "lucide-react";

type NotiKind = "payment" | "recommend" | "party";

type Noti = {
  id: string;
  title: string;
  desc: string;
  time: string;
  kind: NotiKind;
  unread?: boolean;
};

function kindPill(kind: NotiKind) {
  if (kind === "payment")
    return "border-brand-accent/20 bg-brand-accent/10 text-brand-accent";
  if (kind === "party")
    return "border-brand-sub/20 bg-brand-sub/10 text-brand-sub";
  return "border-brand-main/20 bg-brand-main/10 text-brand-main";
}

function KindIcon({ kind }: { kind: NotiKind }) {
  if (kind === "payment") return <CreditCard className="h-4 w-4" />;
  if (kind === "party") return <Users className="h-4 w-4" />;
  return <Sparkles className="h-4 w-4" />;
}

function kindLabel(kind: NotiKind) {
  if (kind === "payment") return "결제";
  if (kind === "party") return "파티";
  return "추천";
}

export default function NotificationsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const list = useMemo<Noti[]>(
    () => [
      {
        id: "n1",
        title: "넷플릭스 결제 예정",
        desc: "내일 ₩ 17,000 결제 예정이에요.",
        time: "방금",
        kind: "payment",
        unread: true,
      },
      {
        id: "n2",
        title: "Smart Swap 추천 업데이트",
        desc: "형님 취향 기준 더 효율적인 조합이 생겼어요.",
        time: "2시간 전",
        kind: "recommend",
        unread: true,
      },
      {
        id: "n3",
        title: "파티 멤버 변동",
        desc: "파티에 새 멤버가 참여했어요.",
        time: "어제",
        kind: "party",
      },
      {
        id: "n4",
        title: "유튜브 프리미엄 요금 변경 감지",
        desc: "다음 결제부터 금액이 달라질 수 있어요.",
        time: "3일 전",
        kind: "payment",
      },
    ],
    [],
  );

  const unread = list.filter((x) => x.unread).length;

  return (
    <div className="relative min-h-screen bg-brand-bg font-sans text-slate-900">
      {/* Soft Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-50 -right-45 h-130 w-130 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -left-50 top-45 h-105 w-105 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500">Updates</div>
            <h1 className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-900">
              알림
            </h1>
            <div className="mt-2 text-sm text-slate-600">
              읽지 않은 알림{" "}
              <span className="font-extrabold text-slate-900">{unread}개</span>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            onClick={() => alert("TODO: 전체 읽음 처리 연결")}
          >
            모두 읽음
          </button>
        </div>

        {/* List */}
        <div className="mt-6 space-y-3">
          {list.map((n) => (
            <button
              key={n.id}
              type="button"
              className="w-full text-left"
              onClick={() => alert(`TODO: 알림 클릭 처리 (${n.id})`)}
            >
              <div className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">
                <span
                  className={[
                    "inline-flex h-11 w-11 items-center justify-center rounded-2xl border",
                    kindPill(n.kind),
                  ].join(" ")}
                >
                  <KindIcon kind={n.kind} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-extrabold text-slate-900">
                      {n.title}
                    </div>

                    {n.unread ? (
                      <span className="inline-flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    ) : null}

                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-extrabold",
                        kindPill(n.kind),
                      ].join(" ")}
                    >
                      {kindLabel(n.kind)}
                    </span>
                  </div>

                  <div className="mt-1 truncate text-xs font-semibold text-slate-600">
                    {n.desc}
                  </div>

                  <div className="mt-2 text-[11px] font-semibold text-slate-500">
                    {n.time}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>

        {/* Minimal footer hint */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-slate-900">
                필요한 알림만 딱
              </div>
              <div className="mt-1 text-sm text-slate-600">
                결제 예정/요금 변동/추천 업데이트만 모아서 보여드려요.
              </div>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              <Bell className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
