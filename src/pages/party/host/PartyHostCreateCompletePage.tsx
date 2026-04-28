import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

export default function PartyHostCreateCompletePage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoMyParties = () => {
    navigate("/myparty");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 pt-24 sm:pt-32 ">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="rounded-[32px] bg-white px-6 py-10 text-center shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] ring-1 ring-slate-200">
          {/* 아이콘 */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2DD4BF]/10">
            <Icon
              icon="solar:check-circle-bold"
              className="h-10 w-10 text-[#2DD4BF]"
            />
          </div>

          {/* 텍스트 */}
          <h1 className="mt-6 text-[24px] font-bold text-slate-950">
            파티 생성 완료
          </h1>

          <p className="mt-2 text-[14px] text-slate-500">
            이제 파티원을 모집하고 정산을 시작할 수 있습니다
          </p>

          {/* 버튼 */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleGoMyParties}
              className="h-14 w-full rounded-2xl bg-[#1E3A8A] text-[16px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              내 파티 보기
            </button>

            <button
              onClick={handleGoHome}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white text-[16px] font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              메인으로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
