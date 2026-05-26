import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type PartyRole = "HOST" | "MEMBER" | string;
type PartyHistoryStatus = "USING" | "SCHEDULED" | "ENDED" | string;

type PartyHistoryItem = {
  partyId: number;
  displayPartyId: string;
  productId: string;
  productName: string;
  role: PartyRole;
  status: PartyHistoryStatus;
  startAt: string | null;
  endAt: string | null;
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
    const envelope = value as ApiEnvelope<T>;

    if (envelope.data) return envelope.data;
    if (envelope.result) return envelope.result;
    if (envelope.payload) return envelope.payload;
  }

  return value as T;
}

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getDateRange(
  startAt: string | null,
  endAt: string | null,
  status: PartyHistoryStatus,
) {
  const start = formatDate(startAt);
  const end = formatDate(endAt);

  if (!start) return "이용 기간 정보 없음";
  if (status === "SCHEDULED") return `${start}부터 이용 예정`;
  if (!end) return `${start} ~ 이용 중`;

  return `${start} ~ ${end}`;
}

function getRoleLabel(role: PartyRole) {
  if (role === "HOST") return "파티장";
  if (role === "MEMBER") return "파티원";
  return role;
}

function getStatusLabel(status: PartyHistoryStatus) {
  if (status === "USING") return "이용 중";
  if (status === "SCHEDULED") return "이용 예정";
  if (status === "ENDED") return "종료";
  return status;
}

function getRoleClassName(role: PartyRole) {
  if (role === "HOST") {
    return "bg-blue-50 text-brand-main ring-blue-100";
  }

  if (role === "MEMBER") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function getStatusClassName(status: PartyHistoryStatus) {
  if (status === "USING") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "SCHEDULED") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function PartyHistoryPage() {
  const [histories, setHistories] = useState<PartyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartyHistories = async () => {
      try {
        const response = await api.get("/api/v1/me/party-history");
        const data = unwrapResponse<PartyHistoryItem[]>(response.data);
        setHistories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("파티 히스토리를 불러오지 못했습니다.");
        setHistories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartyHistories();
  }, []);

  const sortedHistories = useMemo(() => {
    return [...histories].sort((a, b) => {
      if (a.status === "USING" && b.status !== "USING") return -1;
      if (a.status !== "USING" && b.status === "USING") return 1;
      if (a.status === "SCHEDULED" && b.status !== "SCHEDULED") return -1;
      if (a.status !== "SCHEDULED" && b.status === "SCHEDULED") return 1;

      const aTime = a.startAt ? new Date(a.startAt).getTime() : 0;
      const bTime = b.startAt ? new Date(b.startAt).getTime() : 0;

      return bTime - aTime;
    });
  }, [histories]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-[24px] bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold leading-6 text-slate-500">
            공동구독 파티 이용 내역을 확인할 수 있어요.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
          <Icon icon="solar:history-2-linear" className="h-4 w-4" />총{" "}
          {sortedHistories.length}개
        </span>
        </div>
      </div>

      {sortedHistories.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
            <Icon icon="solar:folder-open-linear" className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-extrabold text-slate-900">
            아직 참여한 파티가 없습니다.
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            파티에 참여하면 이곳에 이용 내역이 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sortedHistories.map((item) => (
            <article
              key={item.partyId}
              className="px-5 py-5 transition hover:bg-slate-50"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-100">
                  <Icon icon="solar:users-group-rounded-bold" className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getRoleClassName(
                        item.role,
                      )}`}
                    >
                      {getRoleLabel(item.role)}
                    </span>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getStatusClassName(
                        item.status,
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <h3 className="mt-3 truncate text-lg font-extrabold text-slate-950">
                    {item.productName || "상품명 없음"}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Icon
                        icon="solar:ticket-linear"
                        className="h-4 w-4 shrink-0 text-slate-400"
                      />
                      <span className="truncate">
                        {item.displayPartyId || `PTY-${item.partyId}`}
                      </span>
                    </span>

                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Icon
                        icon="solar:calendar-linear"
                        className="h-4 w-4 shrink-0 text-slate-400"
                      />
                      <span className="truncate">
                        {getDateRange(item.startAt, item.endAt, item.status)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
