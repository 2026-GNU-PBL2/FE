import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type ProductResponse = {
  id: string;
  serviceName: string;
  description?: string | null;
  thumbnailUrl: string;
  operationType: string;
  maxMemberCount?: number | null;
};

type InviteSetupLocationState = {
  productId?: string;
};

type MemberStatus =
  | "WAITING"
  | "REQUIRED"
  | "ACTIVE"
  | "RESET_REQUIRED"
  | string;

type ProvisionMember = {
  provisionMemberId: number;
  partyMemberId: number;
  userId: number;
  nickname: string;
  submateEmail?: string | null;
  memberStatus: MemberStatus;
  inviteSentAt: string | null;
  mustCompleteBy: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  activatedAt: string | null;
  lastResetAt: string | null;
  penaltyApplied: boolean;
  provisionMessage: string | null;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

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

const INVITE_CODE_PROVISION_GUIDE =
  "파티장이 이용 정보를 등록하면 초대 코드형 이용 안내를 확인한 뒤 이용 확인을 완료해주세요.";
const INVITE_CODE_PLACEHOLDER_VALUE = "https://submate.example/invite-code";
const inviteSteps = [
  {
    icon: "solar:cart-large-2-bold",
    title: "추가 회원 자리 준비",
    description: "OTT 계정에서 파티원 수만큼 추가 회원 자리를 준비합니다.",
  },
  {
    icon: "solar:letter-bold",
    title: "파티원 이메일 입력",
    description:
      "아래 파티원 이메일을 OTT 초대 화면에 입력해 초대 메일을 보냅니다.",
  },
  {
    icon: "solar:users-group-rounded-bold",
    title: "파티원 활성화 확인",
    description:
      "파티원이 메일의 링크로 계정을 활성화할 수 있도록 이용 정보를 확인합니다.",
  },
];

function getMemberStatusLabel(status: MemberStatus) {
  if (status === "WAITING") return "대기";
  if (status === "REQUIRED") return "확인 필요";
  if (status === "ACTIVE") return "확인 완료";
  if (status === "RESET_REQUIRED") return "재확인 필요";
  return status;
}

function getStatusStyle(status: MemberStatus) {
  if (status === "ACTIVE") {
    return "bg-teal-50 text-teal-700 ring-teal-100";
  }

  if (status === "REQUIRED") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  if (status === "RESET_REQUIRED") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function PartyHostInviteSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { partyId, productId: productIdParam } = useParams<{
    partyId: string;
    productId: string;
  }>();
  const locationState = location.state as InviteSetupLocationState | null;
  const productId = productIdParam ?? locationState?.productId;

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [members, setMembers] = useState<ProvisionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        toast.error("상품 정보를 확인할 수 없습니다.");
        navigate("/myparty", { replace: true });
        return;
      }

      try {
        setIsLoading(true);

        const response = await api.get<
          ProductResponse | ApiEnvelope<ProductResponse>
        >(`/api/v1/products/${productId}`);
        const data = unwrapResponse<ProductResponse>(response.data);

        if (!data) {
          toast.error("상품 정보를 불러오지 못했습니다.");
          navigate("/myparty", { replace: true });
          return;
        }

        if (data.operationType !== "INVITE_CODE") {
          navigate(`/myparty/${partyId}/provision/setup/${data.id}`, {
            replace: true,
            state: {
              productId: data.id,
            },
          });
          return;
        }

        if (!partyId) {
          toast.error("파티 정보를 확인할 수 없습니다.");
          navigate("/myparty", { replace: true });
          return;
        }

        setProduct(data);

        try {
          const membersResponse = await api.get<
            ProvisionMember[] | ApiEnvelope<ProvisionMember[]>
          >(`/api/v1/parties/${partyId}/provision/members`);
          const memberData =
            unwrapResponse<ProvisionMember[]>(membersResponse.data) ?? [];

          setMembers(memberData);
        } catch (membersError) {
          console.error(membersError);
          setMembers([]);
          toast.error("파티원 이메일을 불러오지 못했습니다.");
        }
      } catch (error) {
        console.error(error);
        toast.error("상품 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [navigate, partyId, productId]);

  const handleNext = async () => {
    if (!partyId || !product) {
      toast.error("파티 정보를 확인할 수 없습니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post(`/api/v1/parties/${partyId}/provision`, {
        provisionType: "INVITE_CODE",
        inviteValue: INVITE_CODE_PLACEHOLDER_VALUE,
        sharedAccountEmail: null,
        sharedAccountPassword: null,
        provisionGuide: INVITE_CODE_PROVISION_GUIDE,
      });

      toast.success("초대 코드형 이용 정보가 등록되었습니다.");
      navigate(`/myparty/${partyId}/provision/dashboard`, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("이용 정보 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-96 w-full max-w-2xl items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Icon
            icon="solar:refresh-circle-bold"
            className="h-11 w-11 animate-spin text-blue-900"
          />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[760px]">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_-55px_rgba(15,23,42,0.35)]">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-slate-100 ring-1 ring-slate-200">
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.serviceName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon
                      icon="solar:play-circle-bold"
                      className="h-8 w-8 text-slate-400"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
                    <Icon icon="solar:link-circle-bold" className="h-4 w-4" />
                    초대 코드형
                  </span>
                  <h1 className="mt-3 truncate text-2xl font-extrabold text-slate-950 sm:text-[32px]">
                    {product.serviceName}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                    서비스 구독이 완료되었다면 파티원 이용 안내를
                    활성화해주세요.
                  </p>
                </div>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-blue-900 text-white shadow-[0_16px_35px_-24px_rgba(30,58,138,0.8)]">
                <Icon icon="solar:mailbox-bold" className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile
                icon="solar:users-group-two-rounded-bold"
                label="이용 방식"
                value="초대 코드"
              />
              <InfoTile
                icon="solar:user-plus-rounded-bold"
                label="최대 인원"
                value={
                  product.maxMemberCount
                    ? `${product.maxMemberCount}명`
                    : "상품 기준"
                }
              />
            </div>

            <div className="mt-6 rounded-[28px] bg-[#F8FAFC] px-5 py-5 ring-1 ring-slate-200">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-900 ring-1 ring-slate-200">
                  <Icon
                    icon="solar:checklist-minimalistic-bold"
                    className="h-6 w-6"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-950">
                    등록 전 확인
                  </p>
                  <div className="mt-4 grid gap-3">
                    <ChecklistItem text="해당 OTT 서비스의 구독 결제가 완료되어 있어야 합니다." />
                    <ChecklistItem text="추가 회원 자리가 준비된 상태에서 진행해주세요." />
                    <ChecklistItem text="초대 메일 발송을 마친 뒤 이용 정보를 등록해주세요." />
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-6 rounded-[28px] border border-sky-100 bg-sky-50 px-5 py-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600 ring-1 ring-sky-100">
                <Icon icon="solar:plain-2-bold" className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                초대 코드형 초대 방법
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                OTT 사이트에서 초대 메일을 보낸 뒤 이용 정보를 등록하면,
                파티원은 안내 페이지에서 활성화를 완료합니다.
              </p>

              <div className="mt-5 space-y-3">
                {inviteSteps.map((step, index) => (
                  <article
                    key={step.title}
                    className="flex gap-4 rounded-3xl bg-white px-4 py-4 ring-1 ring-sky-100"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-blue-900 ring-1 ring-sky-100">
                      <Icon icon={step.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-sky-600">
                        STEP {index + 1}
                      </p>
                      <h3 className="mt-1 text-sm font-extrabold text-slate-950">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)]">
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
                {members.length > 0 ? (
                  members.map((member, index) => (
                    <MemberEmailItem
                      key={`${member.provisionMemberId}-${member.partyMemberId}`}
                      member={member}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#F8FAFC] px-4 py-8 text-center ring-1 ring-slate-100">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-300 ring-1 ring-slate-200">
                      <Icon
                        icon="solar:user-rounded-bold"
                        className="h-6 w-6"
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      표시할 파티원 이메일이 없습니다.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-900 text-base font-bold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "등록 중" : "초대 완료 후 이용 정보 확인"}
              <Icon icon="solar:alt-arrow-right-linear" className="h-5 w-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[22px] bg-[#F8FAFC] px-4 py-4 ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-900 ring-1 ring-slate-200">
          <Icon icon={icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400">{label}</p>
          <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        icon="solar:check-circle-bold"
        className="mt-0.5 h-5 w-5 shrink-0 text-teal-500"
      />
      <p className="text-sm font-semibold leading-6 text-slate-600">{text}</p>
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
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold text-slate-400">
            {member.nickname || `파티원 ${index + 1}`}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${getStatusStyle(
              member.memberStatus,
            )}`}
          >
            {getMemberStatusLabel(member.memberStatus)}
          </span>
        </div>
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
