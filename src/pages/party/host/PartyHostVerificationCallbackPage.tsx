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

    navigate("/parties", { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2F4F7] px-4">
      <div className="w-full max-w-[480px] rounded-[32px] bg-white px-6 py-10 text-center shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)] sm:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FF] text-[#1E3A8A]">
          <Icon icon="solar:refresh-circle-bold" className="h-8 w-8" />
        </div>

        <h1 className="mt-5 text-[24px] font-semibold tracking-tight text-slate-950">
          인증 결과를 확인하고 있어요
        </h1>

        <p className="mt-3 text-[15px] leading-7 text-slate-500">
          잠시만 기다려 주세요.
          <br />
          인증 완료 여부를 확인한 뒤 자동으로 이동합니다.
        </p>
      </div>
    </div>
  );
}
