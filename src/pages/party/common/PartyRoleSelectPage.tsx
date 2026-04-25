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
      "bg-[#EEF4FF] text-[#1E3A8A] ring-1 ring-inset ring-[#D9E7FF]",
    softBadgeClassName: "bg-[#EEF4FF] text-[#1E3A8A]",
    selectedRingClassName:
      "ring-[10px] ring-[#DBEAFE] border-[#1E3A8A] bg-[#F8FBFF]",
    buttonClassName:
      "bg-[#1E3A8A] text-white shadow-[0_20px_46px_-24px_rgba(30,58,138,0.45)] hover:bg-[#1D4ED8]",
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
      "bg-[#ECFEF8] text-[#0F766E] ring-1 ring-inset ring-[#C9F7EA]",
    softBadgeClassName: "bg-[#ECFEF8] text-[#0F766E]",
    selectedRingClassName:
      "ring-[10px] ring-[#CCFBF1] border-[#14B8A6] bg-[#F7FFFD]",
    buttonClassName:
      "bg-[#14B8A6] text-white shadow-[0_20px_46px_-24px_rgba(20,184,166,0.42)] hover:bg-[#0D9488]",
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
        "group flex flex-col items-center text-center transition-all duration-500 ease-out",
        isDimmed ? "scale-[0.96] opacity-40" : "scale-100 opacity-100",
      ].join(" ")}
    >
      <div
        className={[
          "relative flex items-center justify-center rounded-full border bg-white transition-all duration-500 ease-out",
          compact ? "h-36 w-36 sm:h-40 sm:w-40" : "h-44 w-44 sm:h-48 sm:w-48",
          isSelected
            ? `${content.selectedRingClassName} shadow-[0_26px_60px_-32px_rgba(15,23,42,0.22)]`
            : "border-slate-200 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.14)] hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_54px_-30px_rgba(15,23,42,0.18)]",
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

      <div className="mt-4 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition-all duration-300 group-hover:bg-slate-200">
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
    <div className="min-h-screen bg-[#F6F8FB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[980px] items-center justify-center">
        <section className="w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_90px_-52px_rgba(15,23,42,0.18)]">
          <div className="px-5 py-8 sm:px-8 sm:py-10">
            <div className="mx-auto max-w-xl text-center">
              <h1 className="text-[28px] font-semibold tracking-tight text-slate-950 sm:text-[34px]">
                역할을 선택해 주세요
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-[15px]">
                파티장 또는 파티원을 선택하면 오른쪽에 간단한 설명이 표시됩니다.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-[860px] overflow-hidden">
              <div
                className={[
                  "grid items-center gap-8 transition-all duration-500 ease-out",
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
                    <div className="rounded-[28px] border border-slate-200 bg-[#FBFCFE] p-5 shadow-[0_22px_56px_-38px_rgba(15,23,42,0.16)] sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div
                            className={[
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                              selectedContent.softBadgeClassName,
                            ].join(" ")}
                          >
                            {selectedContent.badge}
                          </div>

                          <h2 className="mt-4 text-[23px] font-semibold tracking-tight text-slate-950 sm:text-[27px]">
                            {selectedContent.title}
                          </h2>
                        </div>

                        <div
                          className={[
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px]",
                            selectedContent.iconWrapClassName,
                          ].join(" ")}
                        >
                          <Icon
                            icon={selectedContent.icon}
                            className="h-6 w-6"
                          />
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-6 text-slate-600 sm:text-[15px]">
                        {selectedContent.summary}
                      </p>

                      <div className="mt-5 grid grid-cols-1 gap-3">
                        {selectedContent.points.map((point) => (
                          <div
                            key={point.title}
                            className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3"
                          >
                            <div
                              className={[
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]",
                                selectedContent.softBadgeClassName,
                              ].join(" ")}
                            >
                              <Icon icon={point.icon} className="h-5 w-5" />
                            </div>

                            <p className="text-sm font-medium text-slate-900">
                              {point.title}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-[20px] bg-slate-50 px-4 py-4">
                        <p className="text-sm leading-6 text-slate-500">
                          {selectedContent.footer}
                        </p>
                      </div>

                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={handleGoNext}
                          disabled={isLoading}
                          className={[
                            "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
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
