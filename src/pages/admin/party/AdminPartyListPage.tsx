import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/axios";

type RecruitStatus = "RECRUITING" | "FULL" | "CLOSED" | string;

type OperationStatus =
  | "WAITING_START"
  | "ACTIVE"
  | "TERMINATION_PENDING"
  | "TERMINATED"
  | string;

type AdminParty = {
  partyId: number;
  displayPartyId: string;
  productName: string;
  hostNickname: string;
  currentMemberCount: number;
  maxMemberCount: number;
  pricePerMember: number;
  nextBillingDate: string | null;
  recruitStatus: RecruitStatus;
  operationStatus: OperationStatus;
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

function getRecruitStatusLabel(status: RecruitStatus) {
  switch (status) {
    case "RECRUITING":
      return "모집 중";
    case "FULL":
      return "인원 완료";
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

export default function AdminPartyListPage() {
  const [parties, setParties] = useState<AdminParty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const totalPartyCount = parties.length;

  const activePartyCount = useMemo(
    () => parties.filter((party) => party.operationStatus === "ACTIVE").length,
    [parties],
  );

  const recruitingPartyCount = useMemo(
    () =>
      parties.filter((party) => party.recruitStatus === "RECRUITING").length,
    [parties],
  );

  useEffect(() => {
    const fetchParties = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await api.get<
          AdminParty[] | ApiEnvelope<AdminParty[]>
        >("/api/v1/admin/parties");

        const data = unwrapResponse<AdminParty[]>(response.data);

        setParties(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setErrorMessage("관리자 파티 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParties();
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">전체 파티</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalPartyCount}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">운영 중</p>
          <p className="mt-2 text-2xl font-bold text-blue-900">
            {activePartyCount}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">모집 중</p>
          <p className="mt-2 text-2xl font-bold text-teal-600">
            {recruitingPartyCount}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">관리자 파티 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            전체 파티의 모집 상태와 운영 상태를 확인할 수 있습니다.
          </p>
        </div>

        {isLoading ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            파티 목록을 불러오는 중입니다.
          </div>
        ) : errorMessage ? (
          <div className="px-6 py-16 text-center text-sm text-rose-600">
            {errorMessage}
          </div>
        ) : parties.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            조회된 파티가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1120px]">
              <div className="grid grid-cols-[1.7fr_1.1fr_1fr_1fr_1fr_1.1fr_1.1fr_0.8fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                <span>파티</span>
                <span>파티장</span>
                <span>인원 현황</span>
                <span>월 이용 금액</span>
                <span>다음 정산일</span>
                <span>모집 상태</span>
                <span>운영 상태</span>
                <span>상세</span>
              </div>

              {parties.map((party) => (
                <div
                  key={party.partyId}
                  className="grid grid-cols-[1.7fr_1.1fr_1fr_1fr_1fr_1.1fr_1.1fr_0.8fr] gap-4 border-b border-slate-100 px-6 py-5 text-sm transition last:border-b-0 hover:bg-slate-50/70"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {party.productName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {party.displayPartyId}
                    </p>
                  </div>

                  <div className="flex items-center text-slate-700">
                    {party.hostNickname}
                  </div>

                  <div className="flex items-center text-slate-700">
                    {party.currentMemberCount}/{party.maxMemberCount}명
                  </div>

                  <div className="flex items-center text-slate-700">
                    {formatCurrency(party.pricePerMember)}원
                  </div>

                  <div className="flex items-center text-slate-600">
                    {formatDate(party.nextBillingDate)}
                  </div>

                  <div className="flex items-center">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                        getRecruitStatusClassName(party.recruitStatus),
                      ].join(" ")}
                    >
                      {getRecruitStatusLabel(party.recruitStatus)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                        getOperationStatusClassName(party.operationStatus),
                      ].join(" ")}
                    >
                      {getOperationStatusLabel(party.operationStatus)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Link
                      to={`/admin/parties/${party.partyId}`}
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
                    >
                      보기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
