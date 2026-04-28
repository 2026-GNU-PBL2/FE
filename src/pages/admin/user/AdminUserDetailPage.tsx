import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type AdminUserRole = "CUSTOMER" | "ADMIN" | string;

type AdminUserStatus =
  | "PENDING_SIGNUP"
  | "ACTIVE"
  | "INACTIVE"
  | "DELETED"
  | string;

type PartyOperationStatus =
  | "WAITING_START"
  | "ACTIVE"
  | "TERMINATION_PENDING"
  | "TERMINATED"
  | string;

type PartyRecruitStatus = "RECRUITING" | "FULL" | "CLOSED" | string;

type UsingParty = {
  partyId: number;
  productName: string;
  currentMemberCount: number;
  maxMemberCount: number;
  recruitStatus: PartyRecruitStatus;
  operationStatus: PartyOperationStatus;
  nextBillingDate: string | null;
};

type AdminUserDetail = {
  userId: number;
  displayUserId: string;
  nickname: string;
  email: string;
  phoneNumber: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  usingPartyCount: number;
  usingParties: UsingParty[];
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

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getRoleLabel(role: AdminUserRole) {
  switch (role) {
    case "CUSTOMER":
      return "일반 회원";
    case "ADMIN":
      return "관리자";
    default:
      return role || "-";
  }
}

function getStatusLabel(status: AdminUserStatus) {
  switch (status) {
    case "PENDING_SIGNUP":
      return "가입 진행 중";
    case "ACTIVE":
      return "정상 이용";
    case "INACTIVE":
      return "비활성";
    case "DELETED":
      return "탈퇴";
    default:
      return status || "-";
  }
}

function getOperationStatusLabel(status: PartyOperationStatus) {
  switch (status) {
    case "WAITING_START":
      return "시작 대기";
    case "ACTIVE":
      return "이용중";
    case "TERMINATION_PENDING":
      return "종료 예정";
    case "TERMINATED":
      return "종료 완료";
    default:
      return status || "-";
  }
}

function getRecruitStatusLabel(status: PartyRecruitStatus) {
  switch (status) {
    case "RECRUITING":
      return "모집중";
    case "FULL":
      return "모집 완료";
    case "CLOSED":
      return "모집 종료";
    default:
      return status || "-";
  }
}

function getRoleBadgeClassName(role: AdminUserRole) {
  switch (role) {
    case "ADMIN":
      return "bg-blue-50 text-blue-700";
    case "CUSTOMER":
      return "bg-sky-50 text-sky-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusBadgeClassName(status: AdminUserStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-teal-50 text-teal-700";
    case "PENDING_SIGNUP":
      return "bg-amber-50 text-amber-700";
    case "INACTIVE":
      return "bg-slate-100 text-slate-600";
    case "DELETED":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getOperationBadgeClassName(status: PartyOperationStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-teal-50 text-teal-700";
    case "WAITING_START":
      return "bg-sky-50 text-sky-700";
    case "TERMINATION_PENDING":
      return "bg-amber-50 text-amber-700";
    case "TERMINATED":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getRecruitBadgeClassName(status: PartyRecruitStatus) {
  switch (status) {
    case "RECRUITING":
      return "bg-teal-50 text-teal-700";
    case "FULL":
      return "bg-blue-50 text-blue-700";
    case "CLOSED":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <p className="shrink-0 text-sm font-medium text-slate-500">{label}</p>
      <p className="min-w-0 break-all text-right text-sm font-semibold text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "blue",
}: {
  icon: string;
  label: string;
  value: string | number;
  tone?: "blue" | "teal" | "sky" | "slate";
}) {
  const toneClassName = {
    blue: "bg-blue-50 text-blue-700",
    teal: "bg-teal-50 text-teal-700",
    sky: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-600",
  }[tone];

  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.45)]">
      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-2xl",
          toneClassName,
        ].join(" ")}
      >
        <Icon icon={icon} className="h-5 w-5" />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { userId } = useParams();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!userId) {
      setShouldRedirect(true);
      return;
    }

    let isMounted = true;

    async function fetchUserDetail() {
      try {
        setIsLoading(true);

        const response = await api.get<
          AdminUserDetail | ApiEnvelope<AdminUserDetail>
        >(`/api/v1/admin/users/${userId}`);

        const data = unwrapResponse<AdminUserDetail>(response.data);

        if (!isMounted) return;

        if (!data) {
          setShouldRedirect(true);
          return;
        }

        setUser({
          ...data,
          usingPartyCount: data.usingPartyCount ?? 0,
          usingParties: Array.isArray(data.usingParties)
            ? data.usingParties
            : [],
        });
      } catch (error) {
        console.error(error);
        toast.error("회원 상세 정보를 불러오지 못했습니다.");

        if (isMounted) {
          setShouldRedirect(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUserDetail();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (shouldRedirect) {
    return <Navigate to="/admin/users" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.45)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Icon icon="line-md:loading-twotone-loop" className="h-5 w-5" />
            회원 상세 정보를 불러오는 중입니다.
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/users" replace />;
  }

  const usingPartyCount = user.usingPartyCount ?? user.usingParties.length;

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.55)]">
        <div className="bg-gradient-to-br from-slate-50 via-white to-sky-50 px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-[#1E3A8A] text-xl font-bold text-white shadow-lg shadow-blue-950/15 sm:h-20 sm:w-20 sm:rounded-[28px] sm:text-2xl">
                {(user.nickname || "회원").slice(0, 2)}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                      getRoleBadgeClassName(user.role),
                    ].join(" ")}
                  >
                    {getRoleLabel(user.role)}
                  </span>

                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                      getStatusBadgeClassName(user.status),
                    ].join(" ")}
                  >
                    {getStatusLabel(user.status)}
                  </span>
                </div>

                <h1 className="mt-4 truncate text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {user.nickname || "-"}
                </h1>

                <p className="mt-2 truncate text-sm font-medium text-slate-500">
                  {user.email || "-"}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {user.displayUserId || user.userId}
                </p>
              </div>
            </div>

            <Link
              to="/admin/users"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Icon icon="solar:arrow-left-linear" className="h-4 w-4" />
              목록으로
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="solar:user-id-bold-duotone"
          label="회원 역할"
          value={getRoleLabel(user.role)}
          tone={user.role === "ADMIN" ? "blue" : "sky"}
        />

        <StatCard
          icon="solar:shield-check-bold-duotone"
          label="회원 상태"
          value={getStatusLabel(user.status)}
          tone={user.status === "ACTIVE" ? "teal" : "slate"}
        />

        <StatCard
          icon="solar:users-group-rounded-bold-duotone"
          label="이용중인 파티"
          value={`${usingPartyCount}개`}
          tone="blue"
        />

        <StatCard
          icon="solar:calendar-date-bold-duotone"
          label="가입일"
          value={formatDateTime(user.createdAt)}
          tone="slate"
        />
      </section>

      <section className="grid gap-7 xl:grid-cols-[1fr_380px]">
        <div className="rounded-[32px] border border-slate-100 bg-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.55)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                이용중인 파티
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                회원이 현재 참여 중인 공동구독 파티입니다.
              </p>
            </div>

            <div className="hidden rounded-2xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 sm:block">
              총 {usingPartyCount}개
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {user.usingParties.length > 0 ? (
              user.usingParties.map((party) => (
                <div key={party.partyId} className="px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-lg font-bold text-slate-950">
                          {party.productName || "-"}
                        </p>

                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                            getOperationBadgeClassName(party.operationStatus),
                          ].join(" ")}
                        >
                          {getOperationStatusLabel(party.operationStatus)}
                        </span>

                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                            getRecruitBadgeClassName(party.recruitStatus),
                          ].join(" ")}
                        >
                          {getRecruitStatusLabel(party.recruitStatus)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span>파티 ID {party.partyId}</span>
                        <span>
                          인원 {party.currentMemberCount}/{party.maxMemberCount}
                          명
                        </span>
                        <span>
                          다음 결제일 {formatDateTime(party.nextBillingDate)}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/admin/parties/${party.partyId}`}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 text-sm font-bold text-slate-700 transition hover:bg-[#1E3A8A] hover:text-white"
                    >
                      상세 보기
                      <Icon
                        icon="solar:alt-arrow-right-linear"
                        className="h-4 w-4"
                      />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
                  <Icon
                    icon="solar:box-minimalistic-bold-duotone"
                    className="h-7 w-7"
                  />
                </div>

                <p className="mt-4 text-base font-bold text-slate-900">
                  이용중인 파티가 없습니다.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  현재 이 회원이 참여 중인 파티가 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.55)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
              <Icon
                icon="solar:document-text-bold-duotone"
                className="h-5 w-5"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">
                기본 정보
              </h2>
              <p className="text-sm text-slate-500">회원 식별 정보</p>
            </div>
          </div>

          <div className="mt-6">
            <InfoRow label="이메일" value={user.email} />
            <InfoRow label="전화번호" value={user.phoneNumber} />
            <InfoRow
              label="회원 ID"
              value={user.displayUserId || user.userId}
            />
            <InfoRow label="내부 번호" value={user.userId} />
            <InfoRow label="가입일" value={formatDateTime(user.createdAt)} />
          </div>
        </aside>
      </section>
    </div>
  );
}
