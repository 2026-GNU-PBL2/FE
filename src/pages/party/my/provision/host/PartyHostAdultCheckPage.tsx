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
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
            <Icon icon="solar:shield-warning-bold" className="h-9 w-9" />
          </div>

          <p className="mt-6 text-sm font-bold text-sky-600">
            {locationState?.productName ?? "공유계정 상품"}
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-slate-950">
            계정 성인인증을 확인해주세요
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-slate-500">
            파티원이 바로 이용할 수 있도록 공유 계정에서 성인인증이 완료되어
            있는지 확인해주세요.
          </p>

          <div className="mt-7 rounded-3xl bg-slate-50 px-5 py-5 text-left ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <Icon
                icon="solar:check-circle-bold"
                className="mt-0.5 h-5 w-5 shrink-0 text-teal-500"
              />
              <p className="text-sm font-semibold leading-6 text-slate-600">
                성인인증이 필요한 콘텐츠가 있는 상품이라면, 파티원이 접속하기 전
                계정 인증을 먼저 완료해주세요.
              </p>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-blue-900 text-base font-bold text-white transition hover:bg-blue-950"
          >
            완료했어요
          </button>
        </section>
      </div>
    </div>
  );
}
