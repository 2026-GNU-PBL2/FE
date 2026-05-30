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
    <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[520px] items-center justify-center">
        <section className="w-full overflow-hidden rounded-[32px] bg-white text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-white px-6 py-8 sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-main shadow-sm ring-1 ring-blue-100">
              <Icon icon="solar:shield-check-bold" className="h-9 w-9" />
            </div>

            <p className="mt-5 inline-flex max-w-full rounded-full bg-blue-50 px-3 py-1 text-[12px] font-extrabold text-brand-main ring-1 ring-blue-100">
              <span className="truncate">
                {locationState?.productName ?? "공유계정 상품"}
              </span>
            </p>

            <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-slate-950 sm:text-[29px]">
              성인인증 확인
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-6 text-slate-500">
              파티원이 바로 이용할 수 있도록 공유 계정의 성인인증 완료 여부를
              확인해 주세요.
            </p>
          </div>

          <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
            <button
              onClick={handleComplete}
              className="flex h-13 w-full items-center justify-center rounded-full bg-brand-main text-[15px] font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              확인 완료
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
