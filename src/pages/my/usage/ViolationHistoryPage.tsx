import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getMyViolations,
  type ViolationRecord,
} from "@/api/concurrent";

function getViolationLabel(type: string) {
  if (type === "FIRST_WARNING") return "동시접속 1차 경고";
  if (type === "PARTY_DISSOLVED") return "동시접속 위반으로 파티 해체";
  if (type === "DEVICE_ALERT_NO_RESPONSE") return "기기 감지 알림 미응답";
  return type;
}

function formatDateTime(value: string | null | undefined) {
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

export default function ViolationHistoryPage() {
  const [records, setRecords] = useState<ViolationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setIsLoading(true);
        setRecords(await getMyViolations());
      } catch (error) {
        console.error(error);
        toast.error(getApiErrorMessage(error, "위반 이력을 불러오지 못했습니다."));
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchViolations();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-slate-50 px-5 py-10 text-center ring-1 ring-slate-100">
        <Icon
          icon="solar:refresh-circle-bold"
          className="mx-auto h-10 w-10 animate-spin text-brand-main"
        />
        <p className="mt-3 text-sm font-semibold text-slate-500">
          위반 이력을 불러오는 중입니다
        </p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-50 px-5 py-10 text-center ring-1 ring-slate-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-teal-600 ring-1 ring-teal-100">
          <Icon icon="solar:shield-check-bold" className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-slate-950">
          기록된 위반 이력이 없습니다
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          동시접속 경고나 기기 감지 미응답 이력이 있으면 이곳에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <article
          key={record.recordId}
          className="rounded-3xl bg-slate-50 px-4 py-4 ring-1 ring-slate-100 sm:px-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 ring-1 ring-amber-100">
              <Icon icon="solar:shield-warning-bold" className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-950">
                  {getViolationLabel(record.violationType)}
                </h2>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                  weight {record.weight}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                파티 #{record.partyId} · {formatDateTime(record.createdAt)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
