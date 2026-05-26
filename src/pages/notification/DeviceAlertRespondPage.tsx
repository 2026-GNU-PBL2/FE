import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  respondDeviceAlert,
  type DeviceAlertRespondResponse,
} from "@/api/concurrent";

type DeviceAlertLocationState = {
  ottProviderType?: string;
  detectedDevice?: string;
  detectedLocation?: string;
  detectedAt?: string;
  expiresAt?: string;
};

function getProviderDisplayName(providerType?: string) {
  const normalized = (providerType || "").trim().toUpperCase();

  if (normalized === "NETFLIX") return "Netflix";
  if (normalized === "TVING") return "Tving";
  if (normalized === "WAVVE" || normalized === "WAVE") return "Wavve";
  if (normalized === "WATCHA") return "Watcha";
  if (normalized === "DISNEY_PLUS" || normalized === "DISNEYPLUS")
    return "Disney+";
  if (normalized === "YOUTUBE") return "YouTube";
  if (normalized === "APPLE_TV" || normalized === "APPLETV") return "Apple TV+";
  if (normalized === "LAFTEL") return "Laftel";

  return providerType || "OTT";
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

function getStatusLabel(status: string) {
  if (status === "PENDING") return "응답 집계 중";
  if (status === "CONFIRMED_MINE") return "파티원 기기로 확인";
  if (status === "REPORTED_UNKNOWN") return "알 수 없는 기기로 확인";
  if (status === "EXPIRED") return "응답 만료";
  return status;
}

function isPastDate(value?: string | null) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  return date.getTime() <= Date.now();
}

function getResultMessage(result: DeviceAlertRespondResponse) {
  if (result.status === "CONFIRMED_MINE") {
    return "파티원 기기로 확인되었습니다.";
  }

  if (result.status === "REPORTED_UNKNOWN") {
    return "알 수 없는 기기로 확인되어 동시접속 위반 신고가 접수되었습니다.";
  }

  if (result.status === "EXPIRED") {
    return "응답 기한이 만료된 기기 확인 요청입니다.";
  }

  return "응답이 완료됐습니다.";
}

export default function DeviceAlertRespondPage() {
  const navigate = useNavigate();
  const { partyId, alertId } = useParams<{
    partyId?: string;
    alertId: string;
  }>();
  const state = window.history.state?.usr as DeviceAlertLocationState | null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [respondResult, setRespondResult] =
    useState<DeviceAlertRespondResponse | null>(null);

  const providerName = getProviderDisplayName(state?.ottProviderType);
  const isExpired = isPastDate(state?.expiresAt);

  const handleRespond = async (isMyDevice: boolean) => {
    if (!alertId || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const result = await respondDeviceAlert(alertId, {
        isMyDevice,
      });
      setRespondResult(result);
      toast.success(
        isMyDevice ? "내 기기로 응답했습니다." : "모르는 기기로 신고했습니다.",
      );
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(error, "기기 감지 응답을 처리하지 못했습니다."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-96px)] items-center justify-center bg-brand-bg px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="w-full max-w-[560px] overflow-hidden rounded-[30px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
        <div className="border-b border-slate-100 px-5 py-6 sm:px-7">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <Icon icon="solar:smartphone-bold" className="h-7 w-7" />
            </div>
            <p className="mt-4 text-xs font-bold text-amber-700">
              DEVICE CHECK
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-[28px]">
              새 기기 로그인을 확인해주세요
            </h1>
            <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">
              {providerName}에서 감지된 기기가 본인 기기인지 응답해주세요.
            </p>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-7">
          <div className="space-y-2 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
            <InfoRow label="기기" value={state?.detectedDevice || "-"} />
            <InfoRow label="위치" value={state?.detectedLocation || "-"} />
            <InfoRow label="감지 시각" value={formatDateTime(state?.detectedAt)} />
            <InfoRow label="응답 기한" value={formatDateTime(state?.expiresAt)} />
          </div>

          {respondResult ? (
            <div className="mt-5">
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-center ring-1 ring-[#A9E6C9]">
                <p className="text-sm font-bold text-[#00875A]">
                  {getResultMessage(respondResult)}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#00875A]">
                  현재 {respondResult.responseCount}명이 응답했습니다.
                </p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <ResultTile label="내 기기" value={`${respondResult.mineCount}`} />
                <ResultTile
                  label="모름"
                  value={`${respondResult.unknownCount}`}
                />
                <ResultTile
                  label="상태"
                  value={getStatusLabel(respondResult.status)}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    partyId
                      ? `/myparty/${partyId}/provision/member-dashboard`
                      : "/myparty",
                  )
                }
                className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                파티 대시보드로 이동
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleRespond(true)}
                  disabled={isSubmitting || !alertId || isExpired}
                  className="flex h-12 items-center justify-center rounded-2xl bg-brand-main text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? "처리 중" : "내 기기입니다"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRespond(false)}
                  disabled={isSubmitting || !alertId || isExpired}
                  className="flex h-12 items-center justify-center rounded-2xl bg-rose-50 text-sm font-bold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  모르는 기기입니다
                </button>
              </div>
              <p className="mt-3 text-center text-xs font-semibold text-slate-400">
                {isExpired
                  ? "응답 기한이 지난 알림입니다."
                  : "응답 기한이 지난 알림에는 응답할 수 없습니다."}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 text-sm">
      <span className="font-bold text-slate-400">{label}</span>
      <span className="min-w-0 truncate font-extrabold text-slate-800">
        {value}
      </span>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 px-3 py-3 text-center ring-1 ring-slate-100">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}
