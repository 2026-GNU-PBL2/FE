import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/axios";

type RecruitStatus = "RECRUITING" | "FULL" | "CLOSED" | string;

type OperationStatus =
  | "WAITING_START"
  | "ACTIVE"
  | "TERMINATION_PENDING"
  | "TERMINATED"
  | string;

type PartyMemberRole = "HOST" | "MEMBER" | string;
type PartyMemberStatus =
  | "PENDING"
  | "ACTIVE"
  | "LEAVE_RESERVED"
  | "LEFT"
  | string;

type AdminPartyMember = {
  userId: number;
  displayUserId: string;
  nickname: string;
  role: PartyMemberRole;
  status: PartyMemberStatus;
};

type AdminPartyDetail = {
  partyId: number;
  displayPartyId: string;
  productName: string;
  hostNickname: string;
  createdAt: string | null;
  currentMemberCount: number;
  maxMemberCount: number;
  pricePerMember: number;
  nextBillingDate: string | null;
  recruitStatus: RecruitStatus;
  operationStatus: OperationStatus;
  members: AdminPartyMember[];
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getRecruitStatusLabel(status: RecruitStatus) {
  switch (status) {
    case "RECRUITING":
      return "모집 중";
    case "FULL":
      return "모집 완료";
    case "CLOSED":
      return "모집 종료";
    default:
      return status;
  }
}

function getOperationStatusLabel(status: OperationStatus) {
  switch (status) {
    case "WAITING_START":
      return "시작 대기";
    case "ACTIVE":
      return "운영 중";
    case "TERMINATION_PENDING":
      return "종료 예정";
    case "TERMINATED":
      return "종료 완료";
    default:
      return status;
  }
}

function getMemberRoleLabel(role: PartyMemberRole) {
  switch (role) {
    case "HOST":
      return "파티장";
    case "MEMBER":
      return "파티원";
    default:
      return role;
  }
}

function getMemberStatusLabel(status: PartyMemberStatus) {
  switch (status) {
    case "PENDING":
      return "대기 중";
    case "ACTIVE":
      return "이용 중";
    case "LEAVE_RESERVED":
      return "탈퇴 예약";
    case "LEFT":
      return "탈퇴 완료";
    default:
      return status;
  }
}

function getRecruitStatusClassName(status: RecruitStatus) {
  switch (status) {
    case "RECRUITING":
      return "bg-sky-50 text-sky-700 ring-sky-100";
    case "FULL":
      return "bg-teal-50 text-teal-700 ring-teal-100";
    case "CLOSED":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function getOperationStatusClassName(status: OperationStatus) {
  switch (status) {
    case "WAITING_START":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    case "ACTIVE":
      return "bg-blue-50 text-blue-700 ring-blue-100";
    case "TERMINATION_PENDING":
      return "bg-orange-50 text-orange-700 ring-orange-100";
    case "TERMINATED":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function getMemberStatusClassName(status: PartyMemberStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    case "ACTIVE":
      return "bg-teal-50 text-teal-700 ring-teal-100";
    case "LEAVE_RESERVED":
      return "bg-orange-50 text-orange-700 ring-orange-100";
    case "LEFT":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

export default function AdminPartyDetailPage() {
  const { partyId } = useParams();
  const [party, setParty] = useState<AdminPartyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const hostMember = useMemo(
    () => party?.members.find((member) => member.role === "HOST"),
    [party],
  );

  useEffect(() => {
    const fetchPartyDetail = async () => {
      if (!partyId) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await api.get<
          AdminPartyDetail | ApiEnvelope<AdminPartyDetail>
        >(`/api/v1/admin/parties/${partyId}`);

        const data = unwrapResponse<AdminPartyDetail>(response.data);

        setParty(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("관리자 파티 상세 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartyDetail();
  }, [partyId]);

  if (!partyId) {
    return <Navigate to="/admin/parties" replace />;
  }

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">
        파티 상세 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (errorMessage || !party) {
    return (
      <div className="space-y-4">
        <div className="rounded-[28px] border border-rose-100 bg-white px-6 py-16 text-center text-sm text-rose-600 shadow-sm shadow-slate-900/5">
          {errorMessage || "파티 상세 정보를 찾을 수 없습니다."}
        </div>

        <Link
          to="/admin/parties"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {party.displayPartyId}
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {party.productName}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              파티장: {party.hostNickname} · 생성일{" "}
              {formatDateTime(party.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={[
                "inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1",
                getRecruitStatusClassName(party.recruitStatus),
              ].join(" ")}
            >
              {getRecruitStatusLabel(party.recruitStatus)}
            </span>

            <span
              className={[
                "inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1",
                getOperationStatusClassName(party.operationStatus),
              ].join(" ")}
            >
              {getOperationStatusLabel(party.operationStatus)}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">파티 인원</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {party.currentMemberCount}/{party.maxMemberCount}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">1인 월 이용 금액</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {formatCurrency(party.pricePerMember)}원
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">다음 정산일</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatDate(party.nextBillingDate)}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">파티장</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {hostMember?.nickname || party.hostNickname}
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <p className="text-lg font-semibold text-slate-900">참여 멤버 목록</p>
          <p className="mt-1 text-sm text-slate-500">
            파티장과 파티원의 참여 상태를 확인할 수 있습니다.
          </p>
        </div>

        {party.members.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            참여 멤버가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {party.members.map((member) => (
              <div
                key={`${party.partyId}-${member.userId}`}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {member.nickname}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {member.displayUserId} · {getMemberRoleLabel(member.role)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                      getMemberStatusClassName(member.status),
                    ].join(" ")}
                  >
                    {getMemberStatusLabel(member.status)}
                  </span>

                  <Link
                    to={`/admin/users/${member.userId}`}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
                  >
                    회원 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
