import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { api } from "@/api/axios";

type MailListItem = {
  id: number;
  sender: string;
  subject: string;
  receivedAt: string;
};

type MailDetail = {
  id: number;
  sender: string;
  subject: string;
  body: string;
  receivedAt: string;
};

type MailDetailState = {
  mailId: number | null;
  data: MailDetail | null;
};

export default function MailboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedMailId = useMemo(() => {
    const value = searchParams.get("mailId");
    if (!value) return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }, [searchParams]);

  const [mailList, setMailList] = useState<MailListItem[]>([]);
  const [detailState, setDetailState] = useState<MailDetailState>({
    mailId: null,
    data: null,
  });

  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMailList = async () => {
      setIsListLoading(true);
      setListError("");

      try {
        const response = await api.get<MailListItem[]>("/api/v1/mails");

        console.log("메일 목록 API 응답:", response);
        console.log("메일 목록 데이터:", response.data);

        if (!isMounted) return;

        const sortedList = [...response.data].sort((a, b) => {
          return (
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
          );
        });

        setMailList(sortedList);
        console.log("state 저장된 메일 리스트:", sortedList);

        if (!selectedMailId && sortedList.length > 0) {
          setSearchParams(
            { mailId: String(sortedList[0].id) },
            { replace: true },
          );
        }
      } catch {
        if (!isMounted) return;

        setListError("메일 목록을 불러오지 못했습니다.");
        toast.error("메일 목록 조회에 실패했습니다.");
      }

      if (isMounted) {
        setIsListLoading(false);
      }
    };

    fetchMailList();

    return () => {
      isMounted = false;
    };
  }, [selectedMailId, setSearchParams]);

  useEffect(() => {
    if (!selectedMailId) {
      return;
    }

    let isMounted = true;

    const fetchMailDetail = async () => {
      setIsDetailLoading(true);
      setDetailError("");

      try {
        const response = await api.get<MailDetail>(
          `/api/v1/mails/${selectedMailId}`,
        );

        console.log("메일 상세 응답:", response);
        console.log("메일 상세 데이터:", response.data);

        if (!isMounted) return;

        setDetailState({
          mailId: selectedMailId,
          data: response.data,
        });
      } catch {
        if (!isMounted) return;

        setDetailError("메일 상세 내용을 불러오지 못했습니다.");
        toast.error("메일 상세 조회에 실패했습니다.");
      }

      if (isMounted) {
        setIsDetailLoading(false);
      }
    };

    fetchMailDetail();

    return () => {
      isMounted = false;
    };
  }, [selectedMailId]);

  const handleSelectMail = (mailId: number) => {
    setDetailState({
      mailId: null,
      data: null,
    });
    setDetailError("");
    setSearchParams({ mailId: String(mailId) });
  };

  const handleBackToList = () => {
    setDetailState({
      mailId: null,
      data: null,
    });
    setDetailError("");
    setSearchParams({});
  };

  const selectedSummary = mailList.find((mail) => mail.id === selectedMailId);

  const selectedMail =
    detailState.mailId === selectedMailId ? detailState.data : null;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-blue-50 via-slate-50 to-cyan-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1E3A8A] shadow-lg shadow-blue-900/10">
            <Icon icon="solar:inbox-bold" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
              SUBMATE MAILBOX
            </p>
            <h4 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
              메일함
            </h4>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              인증 메일, 안내 메일, 시스템 알림 메일을 한곳에서 확인할 수
              있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section
          className={[
            "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5",
            selectedMailId ? "hidden xl:block" : "block",
          ].join(" ")}
        >
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                  LIST
                </p>
                <h5 className="mt-1 text-base font-bold text-slate-900">
                  받은 메일
                </h5>
              </div>

              <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-slate-100 px-3 text-sm font-semibold text-slate-700">
                {mailList.length}
              </div>
            </div>
          </div>

          <div className="max-h-180 overflow-y-auto">
            {isListLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <MailListSkeleton key={index} />
                ))}
              </div>
            ) : listError ? (
              <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <Icon icon="solar:danger-triangle-bold" className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  메일을 불러오지 못했습니다
                </p>
                <p className="mt-2 text-sm text-slate-500">{listError}</p>
              </div>
            ) : mailList.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Icon icon="solar:inbox-line-bold" className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  받은 메일이 없습니다
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  새로운 시스템 메일이 오면 여기에 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="p-3">
                {mailList.map((mail) => {
                  const isActive = mail.id === selectedMailId;

                  return (
                    <button
                      key={mail.id}
                      type="button"
                      onClick={() => handleSelectMail(mail.id)}
                      className={[
                        "mb-2 flex w-full flex-col rounded-2xl border p-4 text-left transition-all last:mb-0",
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/15"
                          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className={[
                              "truncate text-sm font-semibold",
                              isActive ? "text-white/90" : "text-slate-500",
                            ].join(" ")}
                          >
                            {mail.sender}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm font-bold leading-6">
                            {mail.subject || "제목 없음"}
                          </p>
                        </div>

                        <div
                          className={[
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                            isActive
                              ? "bg-white/10 text-white"
                              : "bg-slate-100 text-slate-700",
                          ].join(" ")}
                        >
                          <Icon icon="solar:letter-bold" className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Icon
                          icon="solar:calendar-mark-bold"
                          className={[
                            "h-4 w-4",
                            isActive ? "text-white/70" : "text-slate-400",
                          ].join(" ")}
                        />
                        <span
                          className={[
                            "text-xs font-medium",
                            isActive ? "text-white/75" : "text-slate-500",
                          ].join(" ")}
                        >
                          {formatDateTime(mail.receivedAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section
          className={[
            "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5",
            selectedMailId ? "block" : "hidden xl:block",
          ].join(" ")}
        >
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                  DETAIL
                </p>
                <h5 className="mt-1 truncate text-base font-bold text-slate-900 sm:text-lg">
                  {selectedMail?.subject ||
                    selectedSummary?.subject ||
                    "메일 상세"}
                </h5>
              </div>

              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 xl:hidden"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
              </button>
            </div>
          </div>

          {isDetailLoading ? (
            <div className="space-y-4 p-4 sm:p-5">
              <MailDetailSkeleton />
            </div>
          ) : detailError ? (
            <div className="flex min-h-96 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <Icon icon="solar:danger-triangle-bold" className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-900">
                메일 내용을 불러오지 못했습니다
              </p>
              <p className="mt-2 text-sm text-slate-500">{detailError}</p>
            </div>
          ) : selectedMail ? (
            <div className="p-4 sm:p-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-100 to-teal-100 text-[#1E3A8A]">
                    <Icon icon="solar:letter-bold" className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                      FROM
                    </p>
                    <p className="mt-1 wrap-break-word text-sm font-semibold leading-6 text-slate-700">
                      {selectedMail.sender}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoField
                        label="제목"
                        value={selectedMail.subject || "제목 없음"}
                      />
                      <InfoField
                        label="수신일시"
                        value={formatDateTime(selectedMail.receivedAt)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Icon icon="solar:document-text-bold" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                      BODY
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      메일 본문
                    </p>
                  </div>
                </div>

                <div className="min-h-80 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="wrap-break-word whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {selectedMail.body || "본문이 없습니다."}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-96 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Icon icon="solar:letter-opened-bold" className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-900">
                메일을 선택해주세요
              </p>
              <p className="mt-2 text-sm text-slate-500">
                왼쪽 목록에서 확인할 메일을 선택하면 상세 내용을 볼 수 있습니다.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-sm font-semibold leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function MailListSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-5 w-full animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

function MailDetailSkeleton() {
  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-80 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
