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

type OttInviteLink = {
  serviceNames: string[];
  title: string;
  description: string;
  url: string;
  buttonLabel: string;
  note?: string;
};

const OTT_INVITE_LINKS: OttInviteLink[] = [
  {
    serviceNames: ["넷플릭스", "netflix"],
    title: "넷플릭스 파티원 초대",
    description:
      "넷플릭스 계정으로 로그인해 파티원 이메일을 입력하고 초대 메일을 보내세요.",
    url: "https://www.netflix.com/accountowner/addextramember",
    buttonLabel: "초대하러 가기",
  },
  {
    serviceNames: ["디즈니플러스", "디즈니+", "disney", "disneyplus"],
    title: "디즈니플러스 파티원 초대",
    description:
      "디즈니플러스 계정으로 로그인해 파티원 이메일을 입력하고 초대 메일을 보내세요.",
    url: "https://www.disneyplus.com/account",
    buttonLabel: "초대하러 가기",
  },
  {
    serviceNames: ["유튜브", "youtube"],
    title: "유튜브 가족 멤버 초대",
    description: "유튜브 Premium 가족 공유 설정에서 파티원 계정을 초대하세요.",
    url: "https://www.youtube.com/paid_memberships",
    buttonLabel: "초대하러 가기",
    note: "가족 요금제는 동일 거주지 조건이 적용될 수 있습니다.",
  },
  {
    serviceNames: ["애플티비", "애플tv", "apple", "appletv"],
    title: "Apple TV+ 가족 공유 설정",
    description:
      "Apple 가족 공유에서 파티원 계정을 초대한 뒤 Apple TV+ 구독을 공유하세요.",
    url: "https://support.apple.com/108380",
    buttonLabel: "설정하러 가기",
    note: "Apple TV 앱 안에서는 가족 그룹을 직접 만들 수 없습니다.",
  },
  {
    serviceNames: ["티빙", "tving"],
    title: "티빙 파티원 초대",
    description:
      "티빙 계정으로 로그인해 파티원 이메일을 입력하고 초대 메일을 보내세요.",
    url: "https://www.tving.com",
    buttonLabel: "초대하러 가기",
  },
  {
    serviceNames: ["웨이브", "wavve", "wave"],
    title: "웨이브 파티원 초대",
    description:
      "웨이브 계정으로 로그인해 파티원 이메일을 입력하고 초대 메일을 보내세요.",
    url: "https://www.wavve.com",
    buttonLabel: "초대하러 가기",
  },
  {
    serviceNames: ["왓챠", "watcha"],
    title: "왓챠 파티원 초대",
    description:
      "왓챠 계정으로 로그인해 파티원 이메일을 입력하고 초대 메일을 보내세요.",
    url: "https://watcha.com",
    buttonLabel: "초대하러 가기",
  },
  {
    serviceNames: ["라프텔", "laftel"],
    title: "라프텔 파티원 초대",
    description:
      "라프텔 계정으로 로그인해 파티원 이메일을 입력하고 초대 메일을 보내세요.",
    url: "https://laftel.net",
    buttonLabel: "초대하러 가기",
  },
];

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
    return "bg-emerald-50 text-[#00875A] ring-[#A9E6C9]";
  }

  if (status === "REQUIRED") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  if (status === "RESET_REQUIRED") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function normalizeServiceName(value: string) {
  return value
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[+＋]/g, "plus")
    .replace(/[^a-z0-9가-힣]/g, "");
}

function getOttInviteLink(serviceName: string) {
  const normalizedServiceName = normalizeServiceName(serviceName);

  return OTT_INVITE_LINKS.find((link) =>
    link.serviceNames.some((serviceNameCandidate) =>
      normalizedServiceName.includes(
        normalizeServiceName(serviceNameCandidate),
      ),
    ),
  );
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

          console.log(memberData);
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
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-96 w-full max-w-2xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-brand-main"
            />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              초대 정보를 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const ottInviteLink = getOttInviteLink(product.serviceName);

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="relative border-b border-slate-100 px-6 py-7 pr-24 sm:px-8">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-15 w-15 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-100">
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand-main ring-1 ring-blue-100">
                  <Icon icon="solar:link-circle-bold" className="h-4 w-4" />
                  초대 코드형
                </span>
                <h1 className="mt-3 truncate text-2xl font-extrabold text-slate-950 sm:text-[32px]">
                  {product.serviceName}
                </h1>
                <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                  서비스 구독이 완료되었다면 파티원 이용 안내를 활성화해주세요.
                </p>
              </div>
            </div>

            <div className="absolute right-6 top-7 flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100 sm:right-8">
              <Icon icon="solar:mailbox-bold" className="h-7 w-7" />
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

            <div className="mt-6 rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-main ring-1 ring-blue-100">
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

            {ottInviteLink && (
              <section className="mt-6 rounded-[24px] bg-white px-5 py-5 ring-1 ring-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
                      <Icon
                        icon="solar:cart-large-2-bold"
                        className="h-6 w-6"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-main">
                        OTT 바로가기
                      </p>
                      <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                        {ottInviteLink.title}
                      </h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        {ottInviteLink.description}
                      </p>
                      {ottInviteLink.note && (
                        <p className="mt-2 text-xs font-semibold leading-5 text-amber-700">
                          {ottInviteLink.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <a
                    href={ottInviteLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-main px-4 text-sm font-bold text-white shadow-md shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-800"
                  >
                    {ottInviteLink.buttonLabel}
                    <Icon
                      icon="solar:arrow-right-up-linear"
                      className="h-5 w-5"
                    />
                  </a>
                </div>
              </section>
            )}

            <section className="mt-6 rounded-[24px] bg-slate-50 px-5 py-5 ring-1 ring-slate-100">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-main ring-1 ring-blue-100">
                  <Icon icon="solar:plain-2-bold" className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-extrabold text-slate-950">
                    초대 코드형 초대 방법
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    OTT 사이트에서 초대 메일을 보낸 뒤 이용 정보를 등록하면,
                    파티원은 안내 페이지에서 활성화를 완료합니다.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {inviteSteps.map((step, index) => (
                  <article
                    key={step.title}
                    className="flex gap-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-100"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-brand-main ring-1 ring-slate-100">
                      <Icon icon={step.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400">
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

            <section className="mt-6 rounded-[24px] bg-white px-5 py-5 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950">
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
              className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-main text-base font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
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
    <div className="min-w-0 rounded-[22px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-main ring-1 ring-blue-100">
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
        className="mt-0.5 h-5 w-5 shrink-0 text-[#00875A]"
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
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-main ring-1 ring-blue-100">
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-brand-main"
          aria-label={`${member.nickname || `파티원 ${index + 1}`} 이메일 복사`}
        >
          <Icon icon="solar:copy-bold" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
