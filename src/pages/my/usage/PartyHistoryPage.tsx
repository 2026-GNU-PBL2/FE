import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type PartyRole = "HOST" | "MEMBER" | string;
type PartyHistoryStatus = "USING" | "ENDED" | string;

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

function getDateRange(startAt: string | null, endAt: string | null) {
  const start = formatDate(startAt);
  const end = formatDate(endAt);

  if (!start) return "이용 기간 정보 없음";
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
  if (status === "ENDED") return "종료";
  return status;
}

function getRoleClassName(role: PartyRole) {
  if (role === "HOST") {
    return "bg-[#1E3A8A]/10 text-[#1E3A8A] ring-[#1E3A8A]/15";
  }

  return "bg-[#38BDF8]/10 text-[#0369A1] ring-[#38BDF8]/20";
}

function getStatusClassName(status: PartyHistoryStatus) {
  if (status === "USING") {
    return "bg-[#2DD4BF]/10 text-[#0F766E] ring-[#2DD4BF]/20";
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
        console.log(data);
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
            className="h-28 animate-pulse rounded-[24px] border border-slate-200 bg-white"
          />
        ))}
      </div>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mt-1 text-sm text-slate-500">
            공동구독 파티 이용 내역을 확인할 수 있어요.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          <Icon icon="solar:history-2-linear" className="h-4 w-4" />총{" "}
          {sortedHistories.length}개
        </span>
      </div>

      {sortedHistories.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-[#F8FAFC] px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-200">
            <Icon icon="solar:folder-open-linear" className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-800">
            아직 참여한 파티가 없습니다.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            파티에 참여하면 이곳에 이용 내역이 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHistories.map((item) => (
            <article
              key={item.partyId}
              className="rounded-[24px] border border-slate-200 bg-[#F8FAFC] p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getRoleClassName(
                        item.role,
                      )}`}
                    >
                      {getRoleLabel(item.role)}
                    </span>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClassName(
                        item.status,
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <h3 className="mt-3 truncate text-lg font-bold text-slate-900">
                    {item.productName || "상품명 없음"}
                  </h3>
                </div>

                <div className="grid gap-2 text-sm text-slate-500 sm:min-w-[260px]">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon
                      icon="solar:ticket-linear"
                      className="h-4 w-4 shrink-0 text-[#38BDF8]"
                    />
                    <span className="truncate">
                      {item.displayPartyId || `PTY-${item.partyId}`}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-center gap-2">
                    <Icon
                      icon="solar:calendar-linear"
                      className="h-4 w-4 shrink-0 text-[#2DD4BF]"
                    />
                    <span className="truncate">
                      {getDateRange(item.startAt, item.endAt)}
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
