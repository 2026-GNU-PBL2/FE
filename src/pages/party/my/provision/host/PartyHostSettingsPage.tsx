import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import {
  getApiErrorMessage,
  isExpectedClientError,
} from "@/utils/api-error";

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
  const [isLeaveCancelConfirmOpen, setIsLeaveCancelConfirmOpen] =
    useState(false);

  const memberMap = useMemo(() => {
    const map = new Map<number, ProvisionMember>();

    members.forEach((member) => {
      map.set(member.partyMemberId, member);
    });

    return map;
  }, [members]);

  const activeReservations = useMemo(
    () =>
      reservations.filter(
        (reservation) => reservation.status === "LEAVE_RESERVED",
      ),
    [reservations],
  );
  const hostReservation = activeReservations.find(
    (reservation) => reservation.role === "HOST",
  );
  const hasHostReservation = Boolean(hostReservation);

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
      if (!isExpectedClientError(error)) {
        console.error(error);
      }
      toast.error(
        getApiErrorMessage(error, "파티 해지 예약에 실패했습니다."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelHostLeave = async () => {
    if (!partyId || isSubmitting || !hasHostReservation) return;

    try {
      setIsSubmitting(true);

      await api.delete(`/api/v1/party-leave/${partyId}/reserve`);

      setReservations((current) =>
        current.map((reservation) =>
          reservation.role === "HOST" &&
          reservation.status === "LEAVE_RESERVED"
            ? {
                ...reservation,
                status: "ACTIVE",
                leaveReservedAt: null,
              }
            : reservation,
        ),
      );
      setIsLeaveCancelConfirmOpen(false);
      toast.success("파티 해지가 취소되었습니다.");
    } catch (error) {
      if (!isExpectedClientError(error)) {
        console.error(error);
      }
      toast.error(
        getApiErrorMessage(error, "파티 해지 취소에 실패했습니다."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-3xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-brand-main"
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
    <div className="min-h-screen bg-brand-bg px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/myparty/${partyId}/provision/dashboard`)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50 hover:text-brand-main"
            aria-label="파티장 대시보드로 이동"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-main shadow-sm ring-1 ring-blue-100">
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

        <section className="mt-5 rounded-[28px] bg-white px-5 py-5 shadow-xl shadow-slate-900/6 ring-1 ring-slate-100 sm:px-6">
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

          <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-100">
            {activeReservations.length > 0 ? (
              <div className="divide-y divide-slate-100 bg-white">
                {activeReservations.map((reservation) => (
                  <LeaveReservationItem
                    key={`${reservation.partyMemberId}-${reservation.userId}`}
                    reservation={reservation}
                    member={memberMap.get(reservation.partyMemberId)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 px-5 py-8 text-center">
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

        <section
          className={`mt-5 rounded-[24px] bg-white px-4 py-4 shadow-lg shadow-slate-900/5 ring-1 sm:px-5 ${
            hasHostReservation ? "ring-teal-100" : "ring-rose-100"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${
                hasHostReservation
                  ? "bg-teal-50 text-teal-700 ring-teal-100"
                  : "bg-rose-50 text-rose-600 ring-rose-100"
              }`}
            >
              <Icon
                icon={
                  hasHostReservation
                    ? "solar:refresh-bold"
                    : "solar:logout-3-bold"
                }
                className="h-5 w-5"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold text-slate-950">
                {hasHostReservation ? "파티 해지 취소" : "파티 해지하기"}
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                {hasHostReservation
                  ? "등록한 해지를 취소하고 기존 이용 상태로 되돌립니다."
                  : "다음 결제일에 탈퇴가 반영됩니다."}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                hasHostReservation
                  ? setIsLeaveCancelConfirmOpen(true)
                  : setIsLeaveConfirmOpen(true)
              }
              disabled={isSubmitting}
              className={`flex h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold ring-1 transition disabled:cursor-not-allowed sm:w-auto ${
                hasHostReservation
                  ? "bg-teal-50 text-teal-700 ring-teal-100 hover:bg-teal-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200"
                  : "bg-rose-50 text-rose-600 ring-rose-100 hover:bg-rose-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200"
              }`}
            >
              <Icon
                icon={
                  isSubmitting
                    ? "solar:refresh-circle-bold"
                    : hasHostReservation
                      ? "solar:refresh-bold"
                      : "solar:logout-3-bold"
                }
                className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`}
              />
              {isSubmitting
                ? "처리 중"
                : hasHostReservation
                  ? "해지 취소"
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
          confirmLabel="해지"
          submittingLabel="해지 중"
          onClose={() => setIsLeaveConfirmOpen(false)}
          onConfirm={handleReserveHostLeave}
        />
      )}
      {isLeaveCancelConfirmOpen && (
        <LeaveReserveConfirmModal
          isSubmitting={isSubmitting}
          title="파티 해지를 취소할까요?"
          description="등록한 해지 예약을 취소하고 기존 이용 상태로 되돌립니다."
          confirmLabel="해지 취소"
          submittingLabel="취소 중"
          variant="success"
          onClose={() => setIsLeaveCancelConfirmOpen(false)}
          onConfirm={handleCancelHostLeave}
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
    <section className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-brand-main">SETTLEMENT</p>
            <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-slate-950">
              정산 정보
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              파티 운영 정산 계좌와 예정 금액을 확인합니다.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
            <Icon icon="solar:wallet-money-bold" className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 sm:px-6">
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
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-bold text-brand-main ring-1 ring-blue-100 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200"
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
    <section className="mt-5 rounded-[28px] bg-white px-5 py-5 shadow-xl shadow-slate-900/6 ring-1 ring-slate-100 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold text-brand-main">ACCOUNT</p>
          <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-slate-950">
            정산 계좌
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            정산금을 입금받을 계좌 정보입니다.
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
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
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
        <Icon icon={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
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
        className="no-scrollbar max-h-[86vh] w-full max-w-[560px] overflow-y-auto rounded-[30px] bg-white shadow-[0_28px_90px_-34px_rgba(15,23,42,0.7)] ring-1 ring-slate-100"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fee-detail-title"
      >
        <div className="px-5 py-6 sm:px-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-extrabold text-brand-main">SETTLEMENT</p>
              <h2
                id="fee-detail-title"
                className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950"
              >
                정산 내역 자세히 보기
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                파티원 분담금에서 플랫폼 수수료를 제외한 정산 예정 금액입니다.
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
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

          <div className="mt-3 rounded-2xl bg-blue-50 px-5 py-4 ring-1 ring-blue-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-brand-main">
                  매달 정산 금액
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">
                  {formatWon(detail.monthlySettlementAmount)}
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-main ring-1 ring-blue-100">
                <Icon icon="solar:wallet-money-bold" className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400">
                정산 보장제
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
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
    <div className="mt-6 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">정산 흐름</p>
          <p className="mt-1 text-lg font-extrabold text-slate-950">
            {formatWon(shareAmount)}
          </p>
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-brand-main"
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
            <span className="h-2.5 w-2.5 rounded-full bg-brand-main" />
            <p className="text-xs font-bold text-slate-400">정산 예정</p>
          </div>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {formatWon(settlementAmount)}
          </p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <p className="text-xs font-bold text-slate-400">
              플랫폼 수수료
            </p>
          </div>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {formatWon(platformFee)}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeeDetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function LeaveReserveConfirmModal({
  title,
  description,
  confirmLabel,
  submittingLabel,
  variant = "danger",
  isSubmitting,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  submittingLabel: string;
  variant?: "danger" | "success";
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isSuccess = variant === "success";
  const iconClassName = isSuccess
    ? "bg-teal-50 text-teal-700 ring-teal-100"
    : "bg-rose-50 text-rose-600 ring-rose-100";
  const buttonClassName = isSuccess
    ? "bg-teal-50 text-teal-700 ring-teal-100 hover:bg-teal-100"
    : "bg-rose-50 text-rose-600 ring-rose-100 hover:bg-rose-100";
  const icon = isSuccess ? "solar:refresh-bold" : "solar:logout-3-bold";

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
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${iconClassName}`}
          >
            <Icon icon={icon} className="h-6 w-6" />
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
            className="flex h-11 items-center justify-center rounded-full bg-slate-50 text-sm font-bold text-slate-600 ring-1 ring-slate-100 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm font-bold ring-1 transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:ring-slate-200 ${buttonClassName}`}
          >
            <Icon
              icon={
                isSubmitting
                  ? "solar:refresh-circle-bold"
                  : icon
              }
              className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`}
            />
            {isSubmitting ? submittingLabel : confirmLabel}
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
