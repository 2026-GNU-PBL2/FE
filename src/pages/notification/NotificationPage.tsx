import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type NotificationStatus = "UNREAD" | "READ" | string;

type NotificationType =
  | "PARTY_MATCHED"
  | "HOST_PARTY_MATCHED"
  | "HOST_PROVISION_REQUIRED"
  | "HOST_PROVISION_REMINDER"
  | "PROVISION_ACCOUNT_SHARED_REQUIRED"
  | "PROVISION_INVITE_CODE_REQUIRED"
  | "PROVISION_ACCOUNT_SHARED_REMINDER"
  | "PROVISION_INVITE_ACCEPT_REQUIRED"
  | "PAYMENT_FAILED"
  | "PAYMENT_SUCCEEDED"
  | "SETTLEMENT_COMPLETED"
  | "PARTY_TERMINATED"
  | "HOST_PROVISION_DELAYED_NOTICE"
  | "HOST_PROVISION_TIMEOUT_TERMINATED"
  | "MEMBER_PROVISION_TIMEOUT_NOTICE"
  | "MEMBER_AUTO_REMATCH_STARTED"
  | string;

type NotificationItem = {
  id: number;
  partyId: number | null;
  type: NotificationType;
  title: string;
  content: string;
  webContent: string;
  status: NotificationStatus;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

type UnreadCountResponse = {
  count: number;
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

    if (maybeEnvelope.data !== undefined) return maybeEnvelope.data;
    if (maybeEnvelope.result !== undefined) return maybeEnvelope.result;
    if (maybeEnvelope.payload !== undefined) return maybeEnvelope.payload;
  }

  return value as T;
}

function isUnread(notification: NotificationItem) {
  return notification.status === "UNREAD" || notification.isRead === false;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeTime(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDateTime(value);
}

function getNotificationMeta(type: NotificationType) {
  switch (type) {
    case "PARTY_MATCHED":
      return {
        label: "파티 매칭",
        icon: "solar:users-group-rounded-bold",
        badgeClassName: "bg-sky-50 text-sky-700 ring-sky-100",
        iconClassName: "bg-sky-50 text-sky-500",
      };

    case "HOST_PARTY_MATCHED":
      return {
        label: "모집 완료",
        icon: "solar:crown-star-bold",
        badgeClassName: "bg-blue-50 text-blue-700 ring-blue-100",
        iconClassName: "bg-blue-50 text-blue-900",
      };

    case "HOST_PROVISION_REQUIRED":
    case "HOST_PROVISION_REMINDER":
    case "HOST_PROVISION_DELAYED_NOTICE":
      return {
        label: "이용 정보",
        icon: "solar:shield-keyhole-bold",
        badgeClassName: "bg-teal-50 text-teal-700 ring-teal-100",
        iconClassName: "bg-teal-50 text-teal-500",
      };

    case "PROVISION_ACCOUNT_SHARED_REQUIRED":
    case "PROVISION_INVITE_CODE_REQUIRED":
    case "PROVISION_ACCOUNT_SHARED_REMINDER":
    case "PROVISION_INVITE_ACCEPT_REQUIRED":
    case "MEMBER_PROVISION_TIMEOUT_NOTICE":
      return {
        label: "이용 확인",
        icon: "solar:checklist-minimalistic-bold",
        badgeClassName: "bg-cyan-50 text-cyan-700 ring-cyan-100",
        iconClassName: "bg-cyan-50 text-cyan-500",
      };

    case "PAYMENT_FAILED":
      return {
        label: "결제 실패",
        icon: "solar:cardholder-bold",
        badgeClassName: "bg-rose-50 text-rose-700 ring-rose-100",
        iconClassName: "bg-rose-50 text-rose-500",
      };

    case "PAYMENT_SUCCEEDED":
      return {
        label: "결제 완료",
        icon: "solar:card-2-bold",
        badgeClassName: "bg-teal-50 text-teal-700 ring-teal-100",
        iconClassName: "bg-teal-50 text-teal-500",
      };

    case "SETTLEMENT_COMPLETED":
      return {
        label: "정산 완료",
        icon: "solar:wallet-money-bold",
        badgeClassName: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        iconClassName: "bg-emerald-50 text-emerald-500",
      };

    case "PARTY_TERMINATED":
    case "HOST_PROVISION_TIMEOUT_TERMINATED":
    case "MEMBER_AUTO_REMATCH_STARTED":
      return {
        label: "파티 해체",
        icon: "solar:logout-3-bold",
        badgeClassName: "bg-slate-100 text-slate-700 ring-slate-200",
        iconClassName: "bg-slate-100 text-slate-500",
      };

    default:
      return {
        label: "알림",
        icon: "solar:bell-bing-bold",
        badgeClassName: "bg-slate-100 text-slate-700 ring-slate-200",
        iconClassName: "bg-slate-100 text-slate-500",
      };
  }
}

function getNotificationTargetPath(notification: NotificationItem) {
  const partyPath = notification.partyId
    ? `/myparty/${notification.partyId}`
    : "/myparty";

  switch (notification.type) {
    case "PARTY_MATCHED":
    case "HOST_PARTY_MATCHED":
      return partyPath;

    case "HOST_PROVISION_REQUIRED":
    case "HOST_PROVISION_REMINDER":
    case "HOST_PROVISION_DELAYED_NOTICE":
      return partyPath;

    case "PROVISION_ACCOUNT_SHARED_REQUIRED":
    case "PROVISION_INVITE_CODE_REQUIRED":
    case "PROVISION_ACCOUNT_SHARED_REMINDER":
    case "PROVISION_INVITE_ACCEPT_REQUIRED":
      return notification.partyId
        ? `/myparty/${notification.partyId}/provision/confirm`
        : "/myparty";

    case "PAYMENT_FAILED":
      return notification.partyId
        ? `/myparty/${notification.partyId}/provision/member-settings`
        : "/mypage/payment-method";

    case "PAYMENT_SUCCEEDED":
      return "/mypage/payment-method";

    case "SETTLEMENT_COMPLETED":
      return notification.partyId
        ? `/myparty/${notification.partyId}/provision/settings`
        : "/mypage/payment-method";

    case "PARTY_TERMINATED":
    case "HOST_PROVISION_TIMEOUT_TERMINATED":
    case "MEMBER_AUTO_REMATCH_STARTED":
    case "MEMBER_PROVISION_TIMEOUT_NOTICE":
      return "/myparty";

    default:
      return notification.partyId ? partyPath : "/myparty";
  }
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center ring-1 ring-slate-100">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [readingIds, setReadingIds] = useState<Set<number>>(new Set());

  const hasNotifications = notifications.length > 0;
  const totalCount = notifications.length;
  const readCount = notifications.filter(
    (notification) => !isUnread(notification),
  ).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/notifications");
      const data = unwrapResponse<NotificationItem[]>(response.data);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("알림 목록을 불러오지 못했습니다.");
      setNotifications([]);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/notifications/unread-count");
      const data = unwrapResponse<UnreadCountResponse>(response.data);

      setUnreadCount(typeof data?.count === "number" ? data.count : 0);
    } catch (error) {
      console.error(error);
      setUnreadCount(0);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);

    try {
      await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotifications, fetchUnreadCount]);

  const markNotificationRead = async (notification: NotificationItem) => {
    if (!isUnread(notification) || readingIds.has(notification.id)) return true;

    setReadingIds((prev) => {
      const next = new Set(prev);
      next.add(notification.id);
      return next;
    });

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              status: "READ",
              isRead: true,
              readAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));

    try {
      await api.patch(`/api/v1/notifications/${notification.id}/read`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("알림 읽음 처리에 실패했습니다.");
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      return false;
    } finally {
      setReadingIds((prev) => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    const readSuccess = await markNotificationRead(notification);

    if (!readSuccess) return;

    navigate(getNotificationTargetPath(notification));
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="px-5 py-6 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Icon icon="solar:bell-bing-bold" className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-amber-700">
                    NOTIFICATION
                  </p>
                  <h1 className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight text-slate-950">
                    알림
                  </h1>
                  <p className="mt-2 max-w-[500px] text-sm font-semibold leading-6 text-slate-500">
                    파티 매칭, 이용 정보, 결제와 정산 상태를 확인합니다.
                  </p>
                </div>
              </div>

              <div className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 text-right ring-1 ring-slate-100">
                <p className="text-xs font-bold text-slate-400">읽지 않음</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">
                  {unreadCount}
                  <span className="ml-1 text-sm font-bold text-slate-400">
                    개
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <SummaryTile label="전체" value={`${totalCount}개`} />
              <SummaryTile label="읽지 않음" value={`${unreadCount}개`} />
              <SummaryTile label="읽음" value={`${readCount}개`} />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-3xl bg-[#F8FAFC] p-4 ring-1 ring-slate-100"
                >
                  <div className="flex gap-4">
                    <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !hasNotifications ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <Icon icon="solar:bell-off-bold" className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                아직 받은 알림이 없습니다
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                파티 매칭, 결제 실패, 정산 완료 같은 주요 이벤트가 발생하면
                이곳에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const meta = getNotificationMeta(notification.type);
                const unread = isUnread(notification);
                const content =
                  notification.webContent ||
                  notification.content ||
                  "알림 내용을 확인해주세요.";

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`relative w-full px-5 py-5 text-left transition hover:bg-slate-50 ${
                      unread ? "bg-amber-50/35" : "bg-white"
                    }`}
                  >
                    {unread && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-amber-400" />
                    )}
                    <div className="flex gap-3 sm:gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.iconClassName}`}
                      >
                        <Icon icon={meta.icon} className="h-6 w-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${meta.badgeClassName}`}
                            >
                              {meta.label}
                            </span>

                            {unread && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                            )}
                          </div>

                          <span className="shrink-0 text-xs font-medium text-slate-400">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="min-w-0">
                            <h3
                              className={`line-clamp-1 text-base font-bold ${
                                unread ? "text-slate-950" : "text-slate-700"
                              }`}
                            >
                              {notification.title || "알림"}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                              {content}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Icon
                              icon="solar:calendar-mark-linear"
                              className="h-4 w-4"
                            />
                            {formatDateTime(notification.createdAt)}
                          </span>

                          <span className="inline-flex items-center gap-1 font-bold text-slate-500">
                            확인하기
                            <Icon
                              icon="solar:alt-arrow-right-linear"
                              className="h-4 w-4"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
