import { Icon } from "@iconify/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { getAdultCheckKey } from "../shared/provisionStorage";

type AdultCheckLocationState = {
  productName?: string;
};

export default function PartyHostAdultCheckPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { partyId } = useParams<{ partyId: string }>();
  const locationState = location.state as AdultCheckLocationState | null;
  const userId = useAuthStore((state) => state.user?.id);

  const handleComplete = () => {
    if (!partyId) {
      navigate("/myparty", { replace: true });
      return;
    }

    if (userId) {
      window.localStorage.setItem(getAdultCheckKey(partyId, userId), "done");
    }
    navigate(`/myparty/${partyId}/provision/dashboard`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[560px] items-center justify-center">
        <section className="w-full overflow-hidden rounded-[32px] bg-white text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-linear-to-br from-blue-50 via-white to-sky-50 px-6 py-10 sm:px-10">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-white text-brand-main shadow-sm ring-1 ring-blue-100">
              <Icon icon="solar:shield-check-bold" className="h-10 w-10" />
            </div>

            <p className="mt-6 inline-flex max-w-full rounded-full bg-blue-50 px-3 py-1 text-[12px] font-extrabold text-brand-main ring-1 ring-blue-100">
              <span className="truncate">
                {locationState?.productName ?? "공유계정 상품"}
              </span>
            </p>

            <h1 className="mt-3 text-[27px] font-extrabold tracking-tight text-slate-950 sm:text-[30px]">
              성인인증 확인
            </h1>

            <p className="mx-auto mt-3 max-w-md text-[15px] leading-6 text-slate-500">
              파티원이 바로 이용할 수 있도록 공유 계정의 성인인증 완료 여부를
              확인해 주세요.
            </p>
          </div>

          <div className="border-t border-slate-100 px-6 py-6 sm:px-8">
            <div className="rounded-[24px] bg-slate-50 px-5 py-5 text-left ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-main ring-1 ring-blue-100">
                  <Icon icon="solar:check-circle-bold" className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold leading-6 text-slate-600">
                  성인인증이 필요한 콘텐츠가 있는 상품이라면, 파티원이 접속하기
                  전에 계정 인증을 먼저 완료해 주세요.
                </p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-brand-main text-base font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              확인 완료
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
