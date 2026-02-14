// src/features/party/PartyPage.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Clock,
  Download,
  UserPlus,
  Calendar,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { mockServer } from "@/api/mockServer";

export const PartyPage = () => {
  // ✅ 플러그인 없이도 확실히 “등장 애니메이션” 트리거
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["party"],
    queryFn: mockServer.getParty,
  });

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-3 w-72 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 h-60 animate-pulse rounded-3xl border border-slate-100 bg-white" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-slate-900">
          파티 정보를 불러오지 못했어요.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const { header, members, history, lastSyncedLabel } = data;

  const formatMoney = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

  const totalAmount = members.reduce(
    (acc: number, m: { amount: number }) => acc + (m.amount || 0),
    0,
  );

  const paidCount = members.filter(
    (m: { status: string }) => String(m.status).toLowerCase() !== "pending",
  ).length;

  const totalMembers = members.length;
  const progressPercent =
    totalMembers > 0 ? Math.round((paidCount / totalMembers) * 100) : 0;

  const normalizeRole = (role: string) => {
    if (role === "Leader") return "리더";
    return "멤버";
  };

  const normalizeStatus = (status: string) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("paid") || s.includes("done") || s.includes("complete"))
      return "입금 완료";
    if (s.includes("pending") || s.includes("wait")) return "대기";
    return status;
  };

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
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-linear-to-r from-brand-main to-brand-sub p-6 text-white shadow-lg">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-3xl shadow-inner backdrop-blur">
                🎬
              </div>
              <div>
                <h1 className="text-2xl font-bold">{header.title}</h1>
                <p className="mt-1 text-white/80">{header.plan}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold text-white/70">다음 결제일</p>
                <p className="text-lg font-bold">{header.nextPaymentDate}</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                <p className="text-xs font-bold text-white/70">내 부담금</p>
                <p className="text-lg font-bold">
                  {formatMoney(header.myShare)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-8">
            {/* Current Status */}
            <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    이번 달 정산 현황
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    실시간 업데이트 • 마지막 동기화: {lastSyncedLabel}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  실시간 연결됨
                </span>
              </div>

              <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600">
                <span>진행률</span>
                <span className="text-brand-main">
                  {paidCount}/{totalMembers} 입금
                </span>
              </div>

              <div className="mb-3 h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-main transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span>{formatMoney(totalAmount)} / 목표 금액</span>
                <span>{progressPercent}%</span>
              </div>

              <div className="mt-8 space-y-3">
                <h4 className="mb-4 text-sm font-bold text-slate-900">
                  멤버 입금 상태
                </h4>

                {members.map(
                  (
                    member: {
                      name: string;
                      initials: string;
                      color: string;
                      role: string;
                      status: string;
                      time: string;
                      amount: number;
                    },
                    idx: number,
                  ) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-transparent p-3 transition hover:border-slate-100 hover:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${member.color} text-xs font-bold text-white`}
                        >
                          {member.initials}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-bold text-slate-900">
                              {member.name}
                            </span>
                            {member.role === "Leader" && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                리더
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-brand-sub/15 px-2 py-0.5 font-bold text-brand-main">
                              {normalizeStatus(member.status)}
                            </span>
                            <span className="text-slate-400">
                              {normalizeRole(member.role)} • {member.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {formatMoney(member.amount)}
                        </span>
                        <CheckCircle2 className="ml-auto mt-1 h-4 w-4 text-emerald-500" />
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="shrink-0 rounded-full bg-emerald-100 p-2 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    정산이 완료됐어요!
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-700">
                    모든 멤버의 입금이 확인되면, 에스크로를 통해 리더에게
                    안전하게 전달돼요.
                  </p>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="font-bold text-slate-900">정산 기록</h3>
                <button className="text-xs font-bold text-slate-500 transition hover:text-brand-main">
                  전체 보기
                </button>
              </div>

              <div className="space-y-4">
                {history.map(
                  (
                    item: {
                      date: string;
                      participants: number;
                      status: string;
                      amount: number;
                    },
                    idx: number,
                  ) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {item.date} 정산
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.participants}명 •{" "}
                            {normalizeStatus(item.status)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {formatMoney(item.amount)}
                        </p>
                        <p className="text-xs text-slate-400">
                          1인{" "}
                          {formatMoney(
                            Math.round(item.amount / item.participants),
                          )}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-4">
            {/* Stats */}
            <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
              <h3 className="mb-2 font-bold text-slate-900">통계</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-800">
                        입금 완료
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {paidCount}명
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700">
                    {formatMoney(totalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-800">대기</p>
                      <p className="text-sm font-bold text-slate-900">0명</p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-700 opacity-60">
                    {formatMoney(0)}
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">평균 입금 소요</span>
                    <span className="font-bold text-slate-900">1.2일</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">정산 성공률</span>
                    <span className="font-bold text-brand-main">100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety */}
            <div className="rounded-3xl border border-brand-sub/20 bg-brand-sub/10 p-6">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <ShieldCheck className="h-5 w-5 text-brand-main" />
                <span className="font-bold">안전 정산 보호</span>
              </div>

              <ul className="space-y-3">
                {[
                  "에스크로 기반 안전 거래",
                  "트랜잭션 보장 로직",
                  "SSE 실시간 업데이트",
                  "자동 리마인드 및 안내",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-brand-main" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                모든 멤버 입금이 확인되기 전까지 금액은 안전하게 보관되며, 확인
                완료 시 리더에게 자동 전달됩니다.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="rounded-3xl border border-slate-100 bg-white/75 p-6 shadow-sm backdrop-blur">
              <h3 className="mb-4 font-bold text-slate-900">빠른 작업</h3>

              <div className="space-y-2">
                <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left transition hover:bg-slate-50">
                  <UserPlus className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">
                    멤버 초대하기
                  </span>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                </button>

                <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left transition hover:bg-slate-50">
                  <Download className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">
                    정산 리포트 다운로드
                  </span>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                </button>

                <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left transition hover:bg-slate-50">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">
                    결제일 변경하기
                  </span>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flow */}
        <div className="rounded-3xl border border-slate-100 bg-white/75 p-8 shadow-sm backdrop-blur">
          <h3 className="mb-6 text-sm font-bold text-slate-900">
            에스크로 정산 흐름
          </h3>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-4">
            <div className="absolute left-10 right-10 top-6 hidden h-0.5 bg-slate-100 sm:block" />

            {[
              {
                icon: Download,
                title: "1) 입금",
                desc: "멤버가 에스크로 계좌로 입금",
              },
              {
                icon: ShieldCheck,
                title: "2) 안전 보관",
                desc: "확인 전까지 안전하게 보관",
              },
              {
                icon: Clock,
                title: "3) 확인",
                desc: "실시간으로 입금 확인",
              },
              {
                icon: ArrowRight,
                title: "4) 전달",
                desc: "완료 시 리더에게 자동 전달",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="z-10 mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                  <step.icon className="h-5 w-5" />
                </div>
                <h4 className="mb-1 text-sm font-bold text-slate-900">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-semibold text-slate-900">참고</p>
            <p className="mt-1 text-xs text-slate-500">
              본 화면은 데모 데이터 기반이며, 실제 정산 정책/알림 방식은 서비스
              설정에 따라 달라질 수 있어요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
