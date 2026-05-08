import { Icon } from "@iconify/react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type PartyLeaveReservationStatus =
  | "ACTIVE"
  | "LEAVE_RESERVED"
  | "LEFT"
  | "PENDING"
  | string;

type PartyLeaveReservationRole = "HOST" | "MEMBER" | string;

type PartyLeaveReservation = {
  partyMemberId: number;
  userId: number;
  role: PartyLeaveReservationRole;
  status: PartyLeaveReservationStatus;
  leaveReservedAt: string | null;
};

type PartyLeaveReserveResponse = PartyLeaveReservation & {
  partyId: number;
  vacancyType?: string | null;
  message?: string | null;
};

type ErrorResponse = {
  message?: string;
};

type ProvisionMember = {
  partyMemberId: number;
  nickname: string;
};

type PartyProvisionResponse = {
  members: ProvisionMember[];
};

type PartySettingsResponse = {
  ottServiceName?: string | null;
  settlementDayOfMonth?: number | null;
  monthlySettlementAmount?: number | null;
  settlementBankName?: string | null;
  settlementAccountMasked?: string | null;
};

type PartyFeeDetailResponse = {
  role?: "HOST" | "MEMBER" | string;
  memberCount?: number | null;
  membersShareAmount?: number | null;
  platformFee?: number | null;
  monthlySettlementAmount?: number | null;
  nextSettlementDate?: string | null;
  isSettlementGuaranteeApplied?: boolean | null;
  monthlyPaymentAmount?: number | null;
  ottUsageFee?: number | null;
  nextBillingDate?: string | null;
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

function getRoleLabel(role: PartyLeaveReservationRole) {
  if (role === "HOST") return "파티장";
  if (role === "MEMBER") return "파티원";
  return role;
}

function getStatusLabel(status: PartyLeaveReservationStatus) {
  if (status === "LEAVE_RESERVED") return "해지 예약";
  if (status === "ACTIVE") return "이용 중";
  if (status === "LEFT") return "이용 종료";
  if (status === "PENDING") return "예약 대기";
  return status;
}

function formatDateTime(value?: string | null) {
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

function formatDate(value?: string | null) {
  if (!value) return "-";

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateOnlyMatch) {
    return `${dateOnlyMatch[1]}.${dateOnlyMatch[2]}.${dateOnlyMatch[3]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatWon(value?: number | null) {
  if (value === null || value === undefined) return "-";
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as ErrorResponse | undefined;

    if (responseData?.message) {
      return responseData.message;
    }
  }

  return fallbackMessage;
}

function formatDayOfMonth(value?: number | null) {
  if (value === null || value === undefined) return "-";
  return `매달 ${value}일`;
}

export default function PartyHostSettingsPage() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();
  const [partySettings, setPartySettings] =
    useState<PartySettingsResponse | null>(null);
  const [feeDetail, setFeeDetail] = useState<PartyFeeDetailResponse | null>(
    null,
  );
  const [reservations, setReservations] = useState<PartyLeaveReservation[]>([]);
  const [members, setMembers] = useState<ProvisionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeeDetailModalOpen, setIsFeeDetailModalOpen] = useState(false);
  const [isFeeDetailLoading, setIsFeeDetailLoading] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const memberMap = useMemo(() => {
    const map = new Map<number, ProvisionMember>();

    members.forEach((member) => {
      map.set(member.partyMemberId, member);
    });

    return map;
  }, [members]);

  const hostReservationCount = reservations.filter(
    (reservation) => reservation.role === "HOST",
  ).length;
  const hasHostReservation = hostReservationCount > 0;

  const fetchSettings = useCallback(async () => {
    if (!partyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [reservationResult, provisionResult, settingsResult] =
        await Promise.allSettled([
          api.get(`/api/v1/party-leave/${partyId}/reservations`),
          api.get(`/api/v1/parties/${partyId}/provision`),
          api.get(`/api/v1/parties/${partyId}/settings`),
        ]);

      if (reservationResult.status === "rejected") {
        throw reservationResult.reason;
      }

      const reservationData = unwrapResponse<PartyLeaveReservation[]>(
        reservationResult.value.data,
      );
      setReservations(Array.isArray(reservationData) ? reservationData : []);

      if (provisionResult.status === "fulfilled") {
        const provisionData = unwrapResponse<PartyProvisionResponse>(
          provisionResult.value.data,
        );
        setMembers(provisionData?.members ?? []);
      } else {
        setMembers([]);
      }

      if (settingsResult.status === "fulfilled") {
        const settingsData = unwrapResponse<PartySettingsResponse>(
          settingsResult.value.data,
        );
        setPartySettings(settingsData);
      } else {
        setPartySettings(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("파티 설정 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [partyId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleLoadFeeDetail = async () => {
    if (!partyId || isFeeDetailLoading) return;

    try {
      setIsFeeDetailLoading(true);

      const response = await api.get(
        `/api/v1/parties/${partyId}/settings/fee-detail`,
      );
      const data = unwrapResponse<PartyFeeDetailResponse>(response.data);

      if (!data) {
        toast.error("정산 상세 내역을 확인할 수 없습니다.");
        return;
      }

      setFeeDetail(data);
      setIsFeeDetailModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("정산 상세 내역을 불러오지 못했습니다.");
    } finally {
      setIsFeeDetailLoading(false);
    }
  };

  const handleReserveHostLeave = async () => {
    if (!partyId || isSubmitting || hasHostReservation) return;

    try {
      setIsSubmitting(true);

      const response = await api.post(`/api/v1/party-leave/${partyId}/reserve`);
      const data = unwrapResponse<PartyLeaveReserveResponse>(response.data);

      if (!data) {
        toast.error("해지 예약 결과를 확인할 수 없습니다.");
        return;
      }

      const nextReservation: PartyLeaveReservation = {
        partyMemberId: data.partyMemberId,
        userId: data.userId,
        role: data.role,
        status: data.status,
        leaveReservedAt: data.leaveReservedAt,
      };

      setReservations((current) => {
        const existingIndex = current.findIndex(
          (reservation) =>
            reservation.partyMemberId === nextReservation.partyMemberId,
        );

        if (existingIndex === -1) return [nextReservation, ...current];

        return current.map((reservation, index) =>
          index === existingIndex ? nextReservation : reservation,
        );
      });
      setIsLeaveConfirmOpen(false);
      toast.success(data.message || "파티 탈퇴가 예약되었습니다.");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "파티 해지 예약에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-96 w-full max-w-[720px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-blue-900"
            />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              파티 설정을 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[720px]">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/myparty/${partyId}/provision/dashboard`)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            aria-label="파티장 대시보드로 이동"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
            <Icon icon="solar:settings-bold" className="h-4 w-4" />
            파티 설정
          </span>
        </header>

        {partySettings && (
          <>
            <SettlementSection
              settings={partySettings}
              isLoading={isFeeDetailLoading}
              onLoadDetail={handleLoadFeeDetail}
            />
            <SettlementAccountSection settings={partySettings} />
          </>
        )}

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-amber-700">LEAVE RESERVED</p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                다음 회차 결원 예정
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                다음 결제일에 탈퇴가 반영될 멤버 목록입니다.
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <Icon icon="solar:user-cross-bold" className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            {reservations.length > 0 ? (
              <div className="divide-y divide-slate-100 bg-white">
                {reservations.map((reservation) => (
                  <LeaveReservationItem
                    key={`${reservation.partyMemberId}-${reservation.userId}`}
                    reservation={reservation}
                    member={memberMap.get(reservation.partyMemberId)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#F8FAFC] px-5 py-8 text-center">
                <Icon
                  icon="solar:user-check-bold"
                  className="mx-auto h-10 w-10 text-slate-300"
                />
                <p className="mt-3 text-sm font-bold text-slate-500">
                  현재 해지 예약된 멤버가 없습니다.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-rose-100 bg-white px-4 py-4 shadow-[0_14px_46px_-42px_rgba(15,23,42,0.24)] sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <Icon icon="solar:logout-3-bold" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-950">
                파티 해지하기
              </h2>
              <p className="mt-1 text-sm font-normal leading-6 text-slate-500">
                다음 결제일에 탈퇴가 반영됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLeaveConfirmOpen(true)}
              disabled={isSubmitting || hasHostReservation}
              className={`flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-3 text-xs font-semibold ring-1 transition disabled:cursor-not-allowed ${
                hasHostReservation
                  ? "bg-[#EEF4FF] text-[#1E3A8A] ring-[#D9E6FF]"
                  : "bg-rose-50 text-rose-600 ring-rose-100 hover:bg-rose-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200"
              }`}
            >
              <Icon
                icon={
                  isSubmitting
                    ? "solar:refresh-circle-bold"
                    : hasHostReservation
                      ? "solar:check-circle-bold"
                      : "solar:logout-3-bold"
                }
                className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`}
              />
              {isSubmitting
                ? "해지 중"
                : hasHostReservation
                  ? "해지 예약됨"
                  : "해지"}
            </button>
          </div>
        </section>
      </div>

      {feeDetail && isFeeDetailModalOpen && (
        <FeeDetailModal
          detail={feeDetail}
          onClose={() => setIsFeeDetailModalOpen(false)}
        />
      )}
      {isLeaveConfirmOpen && (
        <LeaveReserveConfirmModal
          isSubmitting={isSubmitting}
          title="파티 해지하기"
          description="즉시 탈퇴되지는 않으며, 다음 결제일에 새 이용 주기가 시작될 때 파티장 탈퇴가 반영됩니다."
          onClose={() => setIsLeaveConfirmOpen(false)}
          onConfirm={handleReserveHostLeave}
        />
      )}
    </div>
  );
}

function SettlementSection({
  settings,
  isLoading,
  onLoadDetail,
}: {
  settings: PartySettingsResponse;
  isLoading: boolean;
  onLoadDetail: () => void;
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)]">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1E3A8A]">SETTLEMENT</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">정산 정보</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              파티 운영 정산 계좌와 예정 금액을 확인합니다.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1E3A8A] ring-1 ring-[#D9E6FF]">
            <Icon icon="solar:wallet-money-bold" className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-[#F8FAFC] px-5 py-5 sm:px-6">
        <div className="grid gap-2 sm:grid-cols-2">
          <SettlementTile
            icon="solar:calendar-date-bold"
            label="정산일"
            value={formatDayOfMonth(settings.settlementDayOfMonth)}
          />
          <SettlementTile
            icon="solar:wallet-money-bold"
            label="월 정산 금액"
            value={formatWon(settings.monthlySettlementAmount)}
          />
        </div>

        <button
          type="button"
          onClick={onLoadDetail}
          disabled={isLoading}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#EEF4FF] text-sm font-bold text-[#1E3A8A] ring-1 ring-[#D9E6FF] transition hover:bg-[#E0EAFF] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200"
        >
          <Icon
            icon={
              isLoading
                ? "solar:refresh-circle-bold"
                : "solar:document-text-bold"
            }
            className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "조회 중" : "정산 내역 자세히 보기"}
        </button>
      </div>
    </section>
  );
}

function SettlementAccountSection({
  settings,
}: {
  settings: PartySettingsResponse;
}) {
  return (
    <section className="mt-5 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.28)] sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#1E3A8A]">ACCOUNT</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">정산 계좌</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            정산금을 입금받을 계좌 정보입니다.
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1E3A8A] ring-1 ring-[#D9E6FF]">
          <Icon icon="solar:banknote-bold" className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <SettlementTile
          icon="solar:banknote-bold"
          label="정산 은행"
          value={settings.settlementBankName || "미등록"}
        />
        <SettlementTile
          icon="solar:card-bold"
          label="계좌번호"
          value={settings.settlementAccountMasked || "미등록"}
        />
      </div>
    </section>
  );
}

function SettlementTile({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1E3A8A] ring-1 ring-[#D9E6FF]">
        <Icon icon={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function FeeDetailModal({
  detail,
  onClose,
}: {
  detail: PartyFeeDetailResponse;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:items-center sm:py-8"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        className="no-scrollbar max-h-[86vh] w-full max-w-[560px] overflow-y-auto rounded-[30px] bg-white shadow-[0_28px_90px_-34px_rgba(15,23,42,0.7)]"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fee-detail-title"
      >
        <div className="px-5 py-6 sm:px-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold text-[#1E3A8A]">SETTLEMENT</p>
              <h2
                id="fee-detail-title"
                className="mt-1 text-2xl font-bold text-slate-950"
              >
                정산 내역 자세히 보기
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                파티원 분담금에서 플랫폼 수수료를 제외한 정산 예정 금액입니다.
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1E3A8A] ring-1 ring-[#D9E6FF]">
              <Icon icon="solar:chart-square-bold" className="h-6 w-6" />
            </div>
          </div>

          <FeeFlowChart detail={detail} />

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <FeeDetailCard
              label="파티원 수"
              value={`${detail.memberCount ?? 0}명`}
            />
            <FeeDetailCard
              label="분담금 합계"
              value={formatWon(detail.membersShareAmount)}
            />
            <FeeDetailCard
              label="다음 정산일"
              value={formatDate(detail.nextSettlementDate)}
            />
          </div>

          <div className="mt-3 rounded-2xl border border-blue-100 bg-[#EEF4FF] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#1E3A8A]">
                  매달 정산 금액
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {formatWon(detail.monthlySettlementAmount)}
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1E3A8A] ring-1 ring-blue-100">
                <Icon icon="solar:wallet-money-bold" className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#F8FAFC] px-4 py-3 ring-1 ring-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-400">
                정산 보장제
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {detail.isSettlementGuaranteeApplied ? "적용" : "미적용"}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${
                detail.isSettlementGuaranteeApplied
                  ? "bg-blue-50 text-blue-700 ring-blue-100"
                  : "bg-slate-100 text-slate-600 ring-slate-200"
              }`}
            >
              {detail.isSettlementGuaranteeApplied ? "보장 적용" : "일반 정산"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeeFlowChart({ detail }: { detail: PartyFeeDetailResponse }) {
  const shareAmount = detail.membersShareAmount ?? 0;
  const platformFee = detail.platformFee ?? 0;
  const settlementAmount = detail.monthlySettlementAmount ?? 0;
  const baseAmount = Math.max(shareAmount, 1);
  const settlementPercent = Math.min(
    100,
    Math.max(0, (settlementAmount / baseAmount) * 100),
  );
  const feePercent = Math.min(
    100,
    Math.max(0, (platformFee / baseAmount) * 100),
  );

  return (
    <div className="mt-6 rounded-[24px] bg-[#F8FAFC] p-4 ring-1 ring-slate-200">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-400">정산 흐름</p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {formatWon(shareAmount)}
          </p>
        </div>
      </div>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-[#60A5FA]"
            style={{ width: `${settlementPercent}%` }}
          />
          <div
            className="h-full bg-amber-400"
            style={{ width: `${feePercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#60A5FA]" />
            <p className="text-xs font-semibold text-slate-400">정산 예정</p>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatWon(settlementAmount)}
          </p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <p className="text-xs font-semibold text-slate-400">
              플랫폼 수수료
            </p>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatWon(platformFee)}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeeDetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#F8FAFC] px-4 py-4 ring-1 ring-slate-200">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function LeaveReserveConfirmModal({
  title,
  description,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:items-center sm:py-8"
      onMouseDown={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        className="w-full max-w-[420px] rounded-[28px] bg-white px-5 py-5 shadow-[0_28px_90px_-34px_rgba(15,23,42,0.7)] sm:px-6"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-confirm-title"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <Icon icon="solar:logout-3-bold" className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="leave-confirm-title"
              className="text-lg font-semibold text-slate-950"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm font-normal leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center rounded-2xl bg-[#F8FAFC] text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-50 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200"
          >
            <Icon
              icon={
                isSubmitting
                  ? "solar:refresh-circle-bold"
                  : "solar:logout-3-bold"
              }
              className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`}
            />
            {isSubmitting ? "해지 중" : "해지"}
          </button>
        </div>
      </section>
    </div>
  );
}

function LeaveReservationItem({
  reservation,
  member,
}: {
  reservation: PartyLeaveReservation;
  member?: ProvisionMember;
}) {
  const displayName =
    member?.nickname ||
    `${getRoleLabel(reservation.role)} #${reservation.partyMemberId}`;

  return (
    <article className="px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
          <Icon icon="solar:user-cross-bold" className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">
                {displayName}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {getRoleLabel(reservation.role)} · 예약 시각{" "}
                {formatDateTime(reservation.leaveReservedAt)}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
              {getStatusLabel(reservation.status)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
