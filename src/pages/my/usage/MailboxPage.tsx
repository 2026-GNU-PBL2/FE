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

const dummyMails: MailDetail[] = [
  {
    id: 9001,
    sender: "Submate 운영팀 <support@submate.cloud>",
    subject: "Netflix 파티 초대 안내 메일",
    body: "안녕하세요.\n\nNetflix 파티 이용을 위한 초대 안내입니다. 파티 상세 화면에서 이용 정보를 확인한 뒤 안내에 따라 계정을 활성화해 주세요.\n\n궁금한 점이 있으면 고객센터로 문의해 주세요.",
    receivedAt: "2026-05-15T09:20:00+09:00",
  },
  {
    id: 9002,
    sender: "Submate 결제팀 <billing@submate.cloud>",
    subject: "이번 달 자동결제 예정 안내",
    body: "이번 달 자동결제 예정 금액과 결제일을 안내드립니다.\n\n등록된 결제수단이 정상인지 미리 확인해 주세요. 결제 실패 시 파티 이용이 제한될 수 있습니다.",
    receivedAt: "2026-05-14T18:05:00+09:00",
  },
  {
    id: 9003,
    sender: "Submate 알림 <notice@submate.cloud>",
    subject: "파티 이용 확인 요청",
    body: "현재 참여 중인 파티의 이용 확인이 필요합니다.\n\n나의 파티 화면에서 이용 상태를 확인하고 필요한 작업을 완료해 주세요.",
    receivedAt: "2026-05-13T11:40:00+09:00",
  },
];

const dummyMailList: MailListItem[] = dummyMails.map(
  ({ id, sender, subject, receivedAt }) => ({
    id,
    sender,
    subject,
    receivedAt,
  }),
);

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

        if (!isMounted) return;

        const responseList = Array.isArray(response.data) ? response.data : [];
        const sourceList =
          responseList.length > 0 ? responseList : dummyMailList;
        const sortedList = [...sourceList].sort((a, b) => {
          return (
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
          );
        });

        setMailList(sortedList);
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
  }, []);

  useEffect(() => {
    if (!selectedMailId) {
      setIsDetailLoading(false);
      return;
    }

    let isMounted = true;

    const fetchMailDetail = async () => {
      setIsDetailLoading(true);
      setDetailError("");

      try {
        const dummyDetail = dummyMails.find(
          (mail) => mail.id === selectedMailId,
        );

        if (dummyDetail) {
          setDetailState({
            mailId: selectedMailId,
            data: dummyDetail,
          });
          return;
        }

        const response = await api.get<MailDetail>(
          `/api/v1/mails/${selectedMailId}`,
        );

        if (!isMounted) return;

        setDetailState({
          mailId: selectedMailId,
          data: response.data,
        });
      } catch {
        if (!isMounted) return;

        setDetailError("메일 상세 내용을 불러오지 못했습니다.");
        toast.error("메일 상세 조회에 실패했습니다.");
      } finally {
        if (isMounted) {
          setIsDetailLoading(false);
        }
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

  const selectedMail =
    detailState.mailId === selectedMailId ? detailState.data : null;

  return (
    <div className="space-y-4">
      {!selectedMailId ? (
        <section className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-extrabold text-slate-400">
                  LIST
                </p>
                <h5 className="mt-1 text-xl font-extrabold text-slate-950">
                  받은 메일
                </h5>
              </div>

              <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-slate-50 px-3 text-sm font-bold text-slate-700 ring-1 ring-slate-100">
                {mailList.length}개
              </div>
            </div>
          </div>

          <div>
            {isListLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
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
              <div className="divide-y divide-slate-100">
                {mailList.map((mail) => {
                  return (
                    <button
                      key={mail.id}
                      type="button"
                      onClick={() => handleSelectMail(mail.id)}
                      className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 ring-1 ring-slate-100">
                        <Icon icon="solar:letter-bold" className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-500">
                          {mail.sender}
                        </p>
                        <p className="mt-1 truncate text-base font-extrabold text-slate-950">
                          {mail.subject || "제목 없음"}
                        </p>
                        <p className="mt-1.5 text-xs font-semibold text-slate-400">
                          {formatDateTime(mail.receivedAt)}
                        </p>
                      </div>

                      <Icon
                        icon="solar:alt-arrow-right-linear"
                        className="h-5 w-5 shrink-0 text-slate-300"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-100 transition hover:bg-slate-100"
                aria-label="받은 메일 목록으로 돌아가기"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-950">
                  받은 메일
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                  메일 내용을 확인합니다
                </p>
              </div>
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
            <article className="px-5 py-6 sm:px-7 sm:py-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Icon icon="solar:letter-bold" className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-extrabold text-amber-700">
                    MAIL
                  </p>
                  <h5 className="mt-2 wrap-break-word text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[28px]">
                    {selectedMail.subject || "제목 없음"}
                  </h5>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-slate-600 ring-1 ring-slate-100">
                      <Icon
                        icon="solar:user-rounded-bold"
                        className="h-4 w-4 shrink-0 text-slate-400"
                      />
                      <span className="truncate">{selectedMail.sender}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-slate-600 ring-1 ring-slate-100">
                      <Icon
                        icon="solar:calendar-mark-bold"
                        className="h-4 w-4 text-slate-400"
                      />
                      {formatDateTime(selectedMail.receivedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="my-6 h-px bg-slate-100" />

              <div className="rounded-[24px] bg-slate-50 px-5 py-5 ring-1 ring-slate-100 sm:px-6 sm:py-6">
                <div className="wrap-break-word whitespace-pre-wrap text-[15px] font-medium leading-8 text-slate-700">
                  {selectedMail.body || "본문이 없습니다."}
                </div>
              </div>
            </article>
          ) : (
            <div className="flex min-h-96 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Icon icon="solar:letter-opened-bold" className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-900">
                메일을 선택해주세요
              </p>
              <p className="mt-2 text-sm text-slate-500">
                받은 메일 목록에서 확인할 메일을 선택하면 상세 내용을 볼 수
                있습니다.
              </p>
            </div>
          )}
        </section>
      )}
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
