// src/features/mypage/Mypage.tsx
import { useEffect, useMemo } from "react";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Link2,
  LogOut,
  Shield,
  SlidersHorizontal,
  User,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Tone = "main" | "sub" | "accent" | "slate";

type Row = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  tone: Tone;
  onClick: () => void;
  right?: React.ReactNode;
};

function toneClasses(tone: Tone) {
  if (tone === "main")
    return "border-brand-main/20 bg-brand-main/10 text-brand-main";
  if (tone === "sub")
    return "border-brand-sub/20 bg-brand-sub/10 text-brand-sub";
  if (tone === "accent")
    return "border-brand-accent/20 bg-brand-accent/10 text-brand-accent";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="space-y-3">
      <div className="px-1 text-sm font-extrabold text-slate-900">{title}</div>

      <div className="space-y-3">
        {rows.map((r) => (
          <button
            key={r.title}
            type="button"
            className="w-full text-left"
            onClick={r.onClick}
          >
            <div className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">
              <span
                className={[
                  "inline-flex h-11 w-11 items-center justify-center rounded-2xl border",
                  toneClasses(r.tone),
                ].join(" ")}
              >
                {r.icon}
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-extrabold text-slate-900">
                  {r.title}
                </div>
                <div className="mt-1 truncate text-xs font-semibold text-slate-600">
                  {r.desc}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {r.right ? r.right : null}
                <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MyPage() {
  const nav = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // TODO: 실제 유저 데이터로 교체
  const user = useMemo(
    () => ({
      email: "user@subfolio.app",
      monthSpend: "₩ 39,900",
      connected: 2,
      unread: 3,
    }),
    [],
  );

  const accountRows: Row[] = [
    {
      title: "프로필",
      desc: "내 정보 관리",
      icon: <User className="h-4 w-4" />,
      tone: "main",
      onClick: () => nav("/mypage/profile"),
    },
    {
      title: "알림",
      desc: "구독 결제/변동 알림",
      icon: <Bell className="h-4 w-4" />,
      tone: "sub",
      right: user.unread ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-brand-sub/20 bg-brand-sub/10 px-2 py-1 text-[11px] font-extrabold text-brand-sub">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-sub" />
          {user.unread}
        </span>
      ) : null,
      onClick: () => nav("/notifications"),
    },
  ];

  const manageRows: Row[] = [
    {
      title: "결제 수단",
      desc: "카드/계좌 관리",
      icon: <CreditCard className="h-4 w-4" />,
      tone: "accent",
      onClick: () => alert("TODO: 결제수단 화면 연결"),
    },
    {
      title: "연동 관리",
      desc: "오픈뱅킹/카드사/이메일 연결",
      icon: <Link2 className="h-4 w-4" />,
      tone: "sub",
      onClick: () => nav("/setup/connect"),
    },
    {
      title: "보안",
      desc: "권한/기기 관리",
      icon: <Shield className="h-4 w-4" />,
      tone: "main",
      onClick: () => alert("TODO: 보안 화면 연결"),
    },
  ];

  const etcRows: Row[] = [
    {
      title: "설정",
      desc: "앱 설정",
      icon: <SlidersHorizontal className="h-4 w-4" />,
      tone: "slate",
      onClick: () => alert("TODO: 설정 화면 연결"),
    },
    {
      title: "로그아웃",
      desc: "세션 종료",
      icon: <LogOut className="h-4 w-4" />,
      tone: "slate",
      onClick: () => alert("TODO: 로그아웃 로직 연결"),
    },
  ];

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
        {/* Title */}
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-500">Account</div>
          <h1 className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-900">
            마이페이지
          </h1>
          <div className="mt-2 truncate text-sm font-semibold text-slate-600">
            {user.email}
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500">
                  이번 달 구독 지출
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">
                  {user.monthSpend}
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500">
                  연결된 계정
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">
                  {user.connected}개
                </div>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Link2 className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        {/* Menus */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section title="계정" rows={accountRows} />
          <Section title="결제 · 연동" rows={manageRows} />
        </div>

        <div className="mt-6">
          <Section title="기타" rows={etcRows} />
        </div>
      </div>
    </div>
  );
}
