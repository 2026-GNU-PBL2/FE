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
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
              <Icon icon="solar:mailbox-bold" className="h-7 w-7" />
            </div>

            <h1 className="mt-6 text-[28px] font-extrabold tracking-tight text-slate-950">
              초대 코드 활성화
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              메일함에 도착한 초대 링크로 OTT 계정을 활성화한 뒤 완료 버튼을
              눌러주세요.
            </p>
          </div>

          <div className="border-t border-slate-100 px-6 py-6 sm:px-8">
            <div className="space-y-1">
              <GuideRow
                title="메일함에서 초대 메일 확인"
                description="파티장이 보낸 초대 코드 또는 링크를 확인합니다."
                icon="solar:inbox-bold"
              />
              <GuideRow
                title="OTT 계정 활성화"
                description="메일의 안내에 따라 OTT 초대 절차를 완료합니다."
                icon="solar:link-circle-bold"
              />
              <GuideRow
                title="완료 버튼 선택"
                description="활성화가 끝나면 이용 확인을 완료합니다."
                icon="solar:check-circle-bold"
              />
            </div>

            <div className="mt-6 rounded-[24px] bg-blue-50/60 p-5 ring-1 ring-blue-100">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-main ring-1 ring-blue-100">
                  <Icon icon="solar:info-circle-bold" className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    활성화가 끝난 뒤 눌러주세요
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    완료 처리 후 파티 이용 대시보드로 이동합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
              <button
                type="button"
                onClick={() => navigate("/mypage/mailbox")}
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
              >
                <Icon icon="solar:inbox-bold" className="h-5 w-5" />
                메일함 확인
              </button>

              <button
                type="button"
                onClick={handleCompleteActivation}
                disabled={isSubmitting}
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#00A86B] text-base font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-[#00875A] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <Icon
                      icon="solar:refresh-circle-bold"
                      className="h-5 w-5 animate-spin"
                    />
                    처리 중
                  </>
                ) : (
                  <>
                    OTT 계정 활성화 완료
                    <Icon
                      icon="solar:alt-arrow-right-linear"
                      className="h-5 w-5"
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function GuideRow({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-[22px] px-1 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-brand-main ring-1 ring-slate-100">
        <Icon icon={icon} className="h-6 w-6" />
      </div>

      <div className="min-w-0 border-b border-slate-100 pb-4 last:border-b-0">
        <p className="text-sm font-extrabold text-slate-950">{title}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}
