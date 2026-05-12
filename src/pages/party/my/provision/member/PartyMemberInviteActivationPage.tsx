import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

export default function PartyMemberInviteActivationPage() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteActivation = async () => {
    if (!partyId || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await api.post(`/api/v1/parties/${partyId}/provision/confirm`);

      toast.success("이용 확인이 완료되었습니다.");
      navigate(`/myparty/${partyId}/provision/member-dashboard`, {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("초대 코드 확인 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[680px]">
        <header className="flex items-center justify-between"></header>

        <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_56px_-46px_rgba(15,23,42,0.3)]">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#EEF4FF] text-[#1E3A8A] ring-1 ring-[#D9E6FF]">
              <Icon icon="solar:mailbox-bold" className="h-7 w-7" />
            </div>
            <p className="mt-5 text-sm font-bold text-[#14B8A6]">
              MEMBER PARTY
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-950">
              초대 코드 안내
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              파티장이 마이페이지 메일함으로 초대 코드를 발송하면, 받은 링크를
              통해 OTT 계정을 활성화해주세요.
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <div className="rounded-3xl bg-slate-50 px-5 py-5 ring-1 ring-slate-200">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1E3A8A] ring-1 ring-slate-200">
                  <Icon icon="solar:checklist-bold" className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-950">
                    완료 전 확인사항
                  </p>
                  <div className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-600">
                    <p>
                      마이페이지 메일함에서 파티장이 발송한 메일을 확인해주세요.
                    </p>
                    <p>메일의 링크를 통해 OTT 계정 활성화를 완료해주세요.</p>
                    <p>
                      활성화가 끝나면 아래 확인 버튼을 눌러 이용 정보를
                      확인해주세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-2 sm:grid-cols-[1fr_1.4fr]">
              <button
                type="button"
                onClick={() => navigate("/mypage/mailbox")}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Icon icon="solar:inbox-bold" className="h-5 w-5" />
                메일함 확인
              </button>
              <button
                type="button"
                onClick={handleCompleteActivation}
                disabled={isSubmitting}
                className="flex h-14 items-center justify-center rounded-2xl bg-blue-900 text-sm font-bold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? "처리 중" : "OTT 계정 활성화 완료"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
