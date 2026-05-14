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
    <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[520px] items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] bg-white text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-linear-to-br from-blue-50 via-white to-sky-50 px-6 py-10">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-white text-brand-main shadow-sm ring-1 ring-blue-100">
              <Icon icon="solar:check-circle-bold" className="h-10 w-10" />
            </div>

            <h1 className="mt-6 text-[28px] font-extrabold tracking-tight text-slate-950">
              파티 생성 완료
            </h1>

            <p className="mt-3 text-[15px] leading-6 text-slate-500">
              이제 파티원을 모집하고 정산을 시작할 수 있습니다
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="mx-auto mb-6 flex h-2 w-16 overflow-hidden rounded-full bg-blue-50">
              <div className="h-full w-full rounded-full bg-brand-main" />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoMyParties}
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-brand-main text-[15px] font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                내 파티 보기
              </button>

              <button
                onClick={handleGoHome}
                className="inline-flex h-14 w-full items-center justify-center rounded-full border border-slate-100 bg-white text-[15px] font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
              >
                메인으로 이동
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
