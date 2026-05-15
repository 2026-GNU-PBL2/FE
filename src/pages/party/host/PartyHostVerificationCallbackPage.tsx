import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function PartyHostVerificationCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const productId = searchParams.get("productId");
    const message = searchParams.get("message");

    if (success === "true" && productId) {
      toast.success("본인인증 및 계좌 등록이 완료되었습니다.");
      navigate(`/party/create/${productId}/host/complete`, { replace: true });
      return;
    }

    toast.error(message || "본인인증 처리 중 문제가 발생했습니다.");

    if (productId) {
      navigate(`/party/create/${productId}/host/agreement`, { replace: true });
      return;
    }

    navigate("/", { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[520px] items-center justify-center">
        <section className="w-full overflow-hidden rounded-[32px] bg-white text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="px-6 py-10 sm:px-8">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-blue-50 text-brand-main ring-1 ring-blue-100">
              <Icon
                icon="solar:refresh-circle-bold"
                className="h-10 w-10 animate-spin"
              />
            </div>

            <div className="mt-6">
              <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-100">
                계좌 인증
              </div>

              <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-slate-950 sm:text-[30px]">
                인증 결과를 확인하고 있어요
              </h1>

              <p className="mt-3 text-sm font-semibold leading-7 text-slate-500 sm:text-base">
                인증 완료 여부를 확인한 뒤 자동으로 이동합니다.
              </p>
            </div>

            <div className="mt-7 rounded-[24px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
              <div className="mx-auto h-2 max-w-40 overflow-hidden rounded-full bg-white">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-brand-main" />
              </div>
              <p className="mt-3 text-xs font-bold text-slate-400">
                잠시만 기다려 주세요
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
