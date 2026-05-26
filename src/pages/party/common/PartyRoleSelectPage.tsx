import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/axios";

type PartyRole = "HOST" | "MEMBER";

type RoleBenefit = {
  title: string;
  icon: string;
};

type RoleContent = {
  roleLabel: string;
  badge: string;
  title: string;
  summary: string;
  points: RoleBenefit[];
  footer: string;
  icon: string;
  iconWrapClassName: string;
  softBadgeClassName: string;
  selectedRingClassName: string;
  buttonClassName: string;
};

export type PartyJoinPreviewResponse = {
  productId: string;
  productName: string;
  thumbnailUrl: string;
  productPricePerMember: number;
  platformFee: number;
  depositAmount: number;
  firstPaymentAmount: number;
  recurringPaymentAmount: number;
  paymentNotice: string;
};

const roleContents: Record<PartyRole, RoleContent> = {
  HOST: {
    roleLabel: "파티장",
    badge: "직접 운영",
    title: "파티를 직접 만들고 운영합니다",
    summary:
      "구독을 직접 관리하고, 파티원을 모집하며, 운영 흐름을 주도하는 역할입니다.",
    points: [
      { title: "파티 직접 개설", icon: "solar:add-circle-bold" },
      { title: "운영 흐름 주도", icon: "solar:crown-bold" },
      { title: "정산 흐름 확인", icon: "solar:wallet-money-bold" },
    ],
    footer: "직접 운영과 관리가 필요하다면 파티장이 적합합니다.",
    icon: "solar:crown-bold",
    iconWrapClassName:
      "bg-blue-50 text-brand-main ring-1 ring-inset ring-blue-100",
    softBadgeClassName: "bg-blue-50 text-brand-main",
    selectedRingClassName:
      "ring-[10px] ring-blue-100 border-brand-main bg-white",
    buttonClassName:
      "bg-brand-main text-white shadow-lg shadow-blue-900/20 hover:bg-blue-800",
  },
  MEMBER: {
    roleLabel: "파티원",
    badge: "간편 참여",
    title: "이미 운영 중인 파티에 참여합니다",
    summary:
      "운영 부담 없이 원하는 파티에 참여하고, 간편하게 이용하는 역할입니다.",
    points: [
      { title: "빠르게 참여", icon: "solar:user-plus-bold" },
      { title: "간편한 결제", icon: "solar:card-bold" },
      { title: "운영 부담 최소화", icon: "solar:shield-check-bold" },
    ],
    footer: "복잡한 운영 없이 편하게 이용하고 싶다면 파티원이 적합합니다.",
    icon: "solar:user-plus-bold",
    iconWrapClassName:
      "bg-emerald-50 text-[#047857] ring-1 ring-inset ring-emerald-100",
    softBadgeClassName: "bg-[#ECFDF5] text-[#047857]",
    selectedRingClassName:
      "ring-[10px] ring-emerald-100 border-[#10B981] bg-white",
    buttonClassName:
      "bg-[#10B981] text-white shadow-lg shadow-emerald-900/20 hover:bg-[#059669]",
  },
};

function getHostNextPath(productId: string) {
  return `/party/create/${productId}/host/agreement`;
}

function getMemberPreviewPath(productId: string) {
  return `/party/create/${productId}/member/payment-preview`;
}

type RoleCircleCardProps = {
  role: PartyRole;
  selectedRole: PartyRole | null;
  onSelect: (role: PartyRole) => void;
  compact: boolean;
};

function RoleCircleCard({
  role,
  selectedRole,
  onSelect,
  compact,
}: RoleCircleCardProps) {
  const content = roleContents[role];
  const isSelected = selectedRole === role;
  const isDimmed = selectedRole !== null && selectedRole !== role;

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={[
        "group flex flex-col items-center text-center transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
        isDimmed ? "scale-[0.96] opacity-40" : "scale-100 opacity-100",
      ].join(" ")}
    >
      <div
        className={[
          "relative flex items-center justify-center rounded-full border bg-white transition-all duration-500 ease-out",
          compact ? "h-36 w-36 sm:h-40 sm:w-40" : "h-44 w-44 sm:h-48 sm:w-48",
          isSelected
            ? `${content.selectedRingClassName} shadow-xl shadow-slate-900/10`
            : "border-slate-100 shadow-xl shadow-slate-900/6 hover:-translate-y-1 hover:border-sky-100 hover:shadow-xl hover:shadow-blue-900/8",
        ].join(" ")}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_55%)]" />

        <div className="relative z-10 flex flex-col items-center">
          <div
            className={[
              "flex items-center justify-center rounded-full transition-all duration-500 ease-out",
              compact ? "h-18 w-18" : "h-20 w-20",
              content.iconWrapClassName,
            ].join(" ")}
          >
            <Icon
              icon={content.icon}
              className={compact ? "h-9 w-9" : "h-10 w-10"}
            />
          </div>

          <p
            className={[
              "mt-4 font-semibold tracking-tight text-slate-950 transition-all duration-500 ease-out",
              compact ? "text-[22px]" : "text-[24px]",
            ].join(" ")}
          >
            {content.roleLabel}
          </p>
        </div>
      </div>

      <div className="mt-4 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-100 transition-all duration-300 group-hover:text-brand-main">
        {content.badge}
      </div>
    </button>
  );
}

export default function PartyRoleSelectPage() {
  const navigate = useNavigate();
  const { productId = "" } = useParams();

  const [selectedRole, setSelectedRole] = useState<PartyRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedContent = selectedRole ? roleContents[selectedRole] : null;

  const handleSelectRole = (role: PartyRole) => {
    setSelectedRole((prev) => (prev === role ? null : role));
  };

  const handleGoNext = async () => {
    if (!productId || !selectedRole) {
      navigate("/");
      return;
    }

    if (selectedRole === "HOST") {
      navigate(getHostNextPath(productId));
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post<PartyJoinPreviewResponse>(
        "/api/v1/party-join/preview",
        { productId },
      );

      console.log("party join preview response:", response.data);

      navigate(getMemberPreviewPath(productId), {
        state: response.data,
      });
    } catch (error) {
      console.error("party join preview error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-6xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-linear-to-br from-blue-50 via-white to-sky-50 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-main shadow-sm ring-1 ring-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                파티 역할 선택
              </div>

              <h1 className="mt-4 text-[30px] font-extrabold tracking-tight text-slate-950 sm:text-[38px]">
                어떤 방식으로 시작할까요?
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-500">
                직접 파티를 운영하거나, 만들어진 파티에 바로 참여할 수 있어요.
              </p>
            </div>
          </div>

          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="mx-auto max-w-[960px] overflow-hidden">
              <div
                className={[
                  "grid items-center gap-8 transition-all duration-500 ease-out lg:gap-10",
                  selectedRole
                    ? "grid-cols-1 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,0.92fr)]"
                    : "grid-cols-1",
                ].join(" ")}
              >
                <div className="transition-all duration-500 ease-out">
                  <div
                    className={[
                      "grid items-center justify-items-center gap-8 transition-all duration-500 ease-out",
                      selectedRole
                        ? "grid-cols-1"
                        : "grid-cols-1 md:grid-cols-2",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "transition-all duration-500 ease-out",
                        selectedRole ? "lg:-translate-x-4" : "translate-x-0",
                      ].join(" ")}
                    >
                      <RoleCircleCard
                        role="HOST"
                        selectedRole={selectedRole}
                        onSelect={handleSelectRole}
                        compact={selectedRole !== null}
                      />
                    </div>

                    <div
                      className={[
                        "transition-all duration-500 ease-out",
                        selectedRole ? "lg:-translate-x-4" : "translate-x-0",
                      ].join(" ")}
                    >
                      <RoleCircleCard
                        role="MEMBER"
                        selectedRole={selectedRole}
                        onSelect={handleSelectRole}
                        compact={selectedRole !== null}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    "min-w-0 transition-all duration-500 ease-out",
                    selectedRole
                      ? "translate-x-0 opacity-100"
                      : "pointer-events-none translate-x-16 opacity-0 lg:max-h-0",
                  ].join(" ")}
                >
                  {selectedContent ? (
                    <div className="rounded-[32px] bg-white p-5 shadow-xl shadow-slate-900/6 ring-1 ring-slate-100 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div
                            className={[
                              "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold",
                              selectedContent.softBadgeClassName,
                            ].join(" ")}
                          >
                            {selectedContent.badge}
                          </div>

                          <h2 className="mt-4 text-[24px] font-extrabold tracking-tight text-slate-950 sm:text-[28px]">
                            {selectedContent.title}
                          </h2>
                        </div>

                        <div
                          className={[
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] shadow-sm",
                            selectedContent.iconWrapClassName,
                          ].join(" ")}
                        >
                          <Icon
                            icon={selectedContent.icon}
                            className="h-6 w-6"
                          />
                        </div>
                      </div>

                      <p className="mt-5 text-[15px] leading-7 text-slate-600">
                        {selectedContent.summary}
                      </p>

                      <div className="mt-5 grid grid-cols-1 gap-3">
                        {selectedContent.points.map((point) => (
                          <div
                            key={point.title}
                            className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-4 py-3"
                          >
                            <div
                              className={[
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]",
                                selectedContent.softBadgeClassName,
                              ].join(" ")}
                            >
                              <Icon icon={point.icon} className="h-5 w-5" />
                            </div>

                            <p className="text-sm font-bold text-slate-950">
                              {point.title}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-[20px] bg-blue-50/60 px-4 py-4 ring-1 ring-blue-100/70">
                        <p className="text-sm font-medium leading-6 text-slate-600">
                          {selectedContent.footer}
                        </p>
                      </div>

                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={handleGoNext}
                          disabled={isLoading}
                          className={[
                            "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
                            selectedContent.buttonClassName,
                          ].join(" ")}
                        >
                          {isLoading ? "조회 중..." : "다음"}
                          <Icon
                            icon={
                              isLoading
                                ? "solar:refresh-bold"
                                : "solar:arrow-right-linear"
                            }
                            className={[
                              "h-4 w-4",
                              isLoading ? "animate-spin" : "",
                            ].join(" ")}
                          />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
