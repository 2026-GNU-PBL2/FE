import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { useAuthStore } from "@/stores/authStore";

type ProvisionMember = {
  provisionMemberId: number;
  userId: number;
  nickname: string;
  submateEmail?: string | null;
};

type PartyProvisionResponse = {
  members: ProvisionMember[];
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

const inviteSteps = [
  {
    icon: "solar:cart-large-2-bold",
    title: "OTT 구독과 추가 회원 구매",
    description:
      "파티장이 OTT 계정에서 구독을 완료하고 추가 회원 자리를 구매합니다.",
  },
  {
    icon: "solar:letter-bold",
    title: "파티원 이메일 입력",
    description:
      "OTT 웹사이트의 추가 회원 초대 화면에서 아래 파티원 이메일을 입력합니다.",
  },
  {
    icon: "solar:users-group-rounded-bold",
    title: "파티원 활성화 확인",
    description:
      "파티원이 이메일로 받은 초대 링크를 눌러 계정을 활성화하면 이용 확인을 완료합니다.",
  },
];

function unwrapResponse<T>(
  value: T | ApiEnvelope<T> | undefined | null,
): T | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null) {
    const maybeEnvelope = value as ApiEnvelope<T>;

    if (maybeEnvelope.data) return maybeEnvelope.data;
    if (maybeEnvelope.result) return maybeEnvelope.result;
    if (maybeEnvelope.payload) return maybeEnvelope.payload;
  }

  return value as T;
}

export default function PartyInviteCodeGuidePage() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const currentUserEmail = useAuthStore((state) => state.user?.submateEmail);
  const [members, setMembers] = useState<ProvisionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProvision = async () => {
      if (!partyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await api.get<
          PartyProvisionResponse | ApiEnvelope<PartyProvisionResponse>
        >(`/api/v1/parties/${partyId}/provision`);
        const data = unwrapResponse<PartyProvisionResponse>(response.data);

        const hostEmail = currentUserEmail?.trim().toLowerCase();
        const nextMembers = (data?.members ?? []).filter((member) => {
          if (currentUserId != null && member.userId === currentUserId) {
            return false;
          }

          const memberEmail = member.submateEmail?.trim().toLowerCase();
          if (hostEmail && memberEmail === hostEmail) {
            return false;
          }

          return true;
        });

        setMembers(nextMembers);
      } catch (error) {
        console.error(error);
        toast.error("파티원 이메일을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvision();
  }, [currentUserEmail, currentUserId, partyId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[760px]">
        <header className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/myparty/${partyId}/provision/dashboard`)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            aria-label="대시보드로 이동"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
          </button>
        </header>

        <section className="mt-5 rounded-[32px] border border-slate-200 bg-white px-5 py-7 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.32)] sm:px-7">
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <Icon icon="solar:plain-2-bold" className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-[26px] font-extrabold text-slate-950 sm:text-[32px]">
            초대 코드형 초대 방법
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            OTT 사이트에서 추가 회원 초대 이메일을 입력하면, 파티원이 이메일로
            받은 초대 링크를 통해 계정을 활성화합니다.
          </p>

          <div className="mt-7 space-y-3">
            {inviteSteps.map((step, index) => (
              <article
                key={step.title}
                className="flex gap-4 rounded-3xl bg-[#F8FAFC] px-4 py-4 ring-1 ring-slate-100"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-900 ring-1 ring-slate-200">
                  <Icon icon={step.icon} className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-sky-600">
                    STEP {index + 1}
                  </p>
                  <h2 className="mt-1 text-base font-extrabold text-slate-950">
                    {step.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)] sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-sky-600">MEMBERS</p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                OTT 초대에 사용할 이메일
              </h2>
            </div>
            <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
              {members.length}명
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {isLoading ? (
              <div className="flex min-h-32 items-center justify-center rounded-2xl bg-[#F8FAFC] ring-1 ring-slate-100">
                <Icon
                  icon="solar:refresh-circle-bold"
                  className="h-9 w-9 animate-spin text-blue-900"
                />
              </div>
            ) : members.length > 0 ? (
              members.map((member, index) => (
                <MemberEmailItem
                  key={member.provisionMemberId}
                  member={member}
                  index={index}
                />
              ))
            ) : (
              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-8 text-center ring-1 ring-slate-100">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-300 ring-1 ring-slate-200">
                  <Icon icon="solar:user-rounded-bold" className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  표시할 파티원 이메일이 없습니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MemberEmailItem({
  member,
  index,
}: {
  member: ProvisionMember;
  index: number;
}) {
  const email = member.submateEmail?.trim();

  const handleCopy = async () => {
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      toast.success("이메일을 복사했습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] px-4 py-4 ring-1 ring-slate-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-900 ring-1 ring-slate-200">
        <Icon icon="solar:letter-bold" className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-400">
          {member.nickname || `파티원 ${index + 1}`}
        </p>
        <p className="mt-1 break-all text-sm font-extrabold text-slate-900">
          {email || "이메일 없음"}
        </p>
      </div>
      {email && (
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-blue-900"
          aria-label={`${member.nickname || `파티원 ${index + 1}`} 이메일 복사`}
        >
          <Icon icon="solar:copy-bold" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
