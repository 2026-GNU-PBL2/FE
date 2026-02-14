// src/app/App.tsx
import { Header } from "@/shared/ui/Header";
import { useNavStore } from "@/stores/useNavStore";
import { PartyPage } from "@/features/party/PartyPage";
import { ChallengePage } from "@/features/challenge/ChallengePage";
import { SmartSwapPage } from "@/features/smartSwap/SmartSwapPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";

export default function App() {
  const currentPage = useNavStore((s) => s.currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "swap":
        return <SmartSwapPage />;
      case "party":
        return <PartyPage />;
      case "savings":
        return <ChallengePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg font-sans text-slate-900">
      {/* App-level Soft Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-50 -right-45 h-130 w-130 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -left-50 top-45 h-105 w-105 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      {/* ✅ 헤더 + 메인 스크롤 구조 */}
      <div className="relative flex min-h-screen flex-col">
        <Header />

        {/* ✅ 모바일에서 바텀 탭바와 컨텐츠 간격 더 벌리기:
            - pb-32: 바텀 탭바 + 여유 공간
            - md:pb-0: 데스크탑에서는 바텀 탭이 없으니 제거
        */}
        <main className="flex-1 overflow-y-auto scrollbar-hide pb-22 md:pb-10">
          {/* 컨텐츠 래퍼에도 약간의 바텀 여유를 주면 “끝부분 답답함”까지 같이 해결됨 */}
          <div className="mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6 lg:px-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
