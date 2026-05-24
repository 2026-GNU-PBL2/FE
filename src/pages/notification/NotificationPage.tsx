import { Icon } from "@iconify/react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { getApiErrorMessage, resolveConcurrentIssue } from "@/api/concurrent";

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
  | "CONCURRENT_WARNING_1"
  | "LEADER_ACTION_REQUIRED_24H"
  | "DEVICE_ALERT"
  | "DEVICE_CHECK_REQUEST"
  | "CREDENTIALS_UPDATED"
  | "PARTY_DISSOLVING"
  | "PARTY_DISSOLVED_FINAL"
  | string;

type NotificationPayload = {
  type?: NotificationType;
  partyId?: string | number;
  party_id?: string | number;
  partyID?: string | number;
  partyName?: string;
  incidentId?: string;
  alertId?: string | number;
  deviceAlertId?: string | number;
  device_alert_id?: string | number;
  deviceAlertID?: string | number;
  deviceDetectionAlertId?: string | number;
  deviceDetectionId?: string | number;
  targetId?: string | number;
  target_id?: string | number;
  referenceId?: string | number;
  reference_id?: string | number;
  dissolutionDate?: string;
  faqUrl?: string;
  ottProviderType?: string;
  detectedDevice?: string;
  detectedLocation?: string;
  detectedAt?: string;
  expiresAt?: string;
  [key: string]: unknown;
};

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
  partyName?: string | null;
  incidentId?: string | null;
  alertId?: string | number | null;
  deviceAlertId?: string | number | null;
  device_alert_id?: string | number | null;
  deviceAlertID?: string | number | null;
  deviceDetectionAlertId?: string | number | null;
  deviceDetectionId?: string | number | null;
  targetId?: string | number | null;
  target_id?: string | number | null;
  referenceId?: string | number | null;
  reference_id?: string | number | null;
  dissolutionDate?: string | null;
  faqUrl?: string | null;
  ottProviderType?: string | null;
  detectedDevice?: string | null;
  detectedLocation?: string | null;
  detectedAt?: string | null;
  expiresAt?: string | null;
  payload?: NotificationPayload | string | null;
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

function getNotificationPayload(
  notification: NotificationItem,
): NotificationPayload {
  if (!notification.payload) return {};

  if (typeof notification.payload === "string") {
    try {
      const parsed = JSON.parse(notification.payload) as NotificationPayload;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  return notification.payload;
}

function getNotificationPartyId(notification: NotificationItem) {
  const payload = getNotificationPayload(notification);
  return (
    notification.partyId ??
    payload.partyId ??
    payload.party_id ??
    payload.partyID ??
    null
  );
}

function getNotificationField<K extends keyof NotificationPayload>(
  notification: NotificationItem,
  key: K,
): NotificationPayload[K] | undefined {
  const topLevelValue = notification[key as keyof NotificationItem];

  if (topLevelValue !== undefined && topLevelValue !== null) {
    return topLevelValue as NotificationPayload[K];
  }

  return getNotificationPayload(notification)[key];
}

function stringifyRouteValue(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function findRouteValueByKeys(value: unknown, keys: string[]): string | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const routeValue = stringifyRouteValue(record[key]);

    if (routeValue) return routeValue;
  }

  for (const nestedValue of Object.values(record)) {
    const routeValue: string | null = findRouteValueByKeys(nestedValue, keys);

    if (routeValue) return routeValue;
  }

  return null;
}

function getDeviceAlertId(notification: NotificationItem) {
  const payload = getNotificationPayload(notification);
  const topLevel = notification as NotificationItem & Record<string, unknown>;
  const loosePayload = payload as NotificationPayload & Record<string, unknown>;
  const alertIdKeys = [
    "alertId",
    "alert_id",
    "deviceAlertId",
    "device_alert_id",
    "deviceAlertID",
    "deviceDetectionAlertId",
    "device_detection_alert_id",
    "deviceDetectionId",
    "device_detection_id",
    "targetId",
    "target_id",
    "referenceId",
    "reference_id",
  ];
  const value =
    notification.alertId ??
    notification.deviceAlertId ??
    notification.device_alert_id ??
    notification.deviceAlertID ??
    notification.deviceDetectionAlertId ??
    notification.deviceDetectionId ??
    notification.targetId ??
    notification.target_id ??
    notification.referenceId ??
    notification.reference_id ??
    payload.alertId ??
    payload.deviceAlertId ??
    payload.device_alert_id ??
    payload.deviceAlertID ??
    payload.deviceDetectionAlertId ??
    payload.deviceDetectionId ??
    payload.targetId ??
    payload.target_id ??
    payload.referenceId ??
    payload.reference_id ??
    topLevel.alert_id ??
    topLevel.device_detection_alert_id ??
    topLevel.device_detection_id ??
    topLevel.target_id ??
    topLevel.reference_id ??
    loosePayload.alert_id ??
    loosePayload.device_detection_alert_id ??
    loosePayload.device_detection_id ??
    loosePayload.target_id ??
    loosePayload.reference_id ??
    findRouteValueByKeys(payload, alertIdKeys) ??
    findRouteValueByKeys(topLevel, alertIdKeys) ??
    (notification.type === "DEVICE_CHECK_REQUEST" ? notification.id : null);

  return stringifyRouteValue(value);
}

function getDeviceAlertTextInfo(notification: NotificationItem) {
  const content = notification.webContent || notification.content || "";
  const inlineMatch = content.match(/낯선 기기\(([^)]+)\)가\s+(.+?)에서 감지/);
  const labeledMatch = content.match(/기기:\s*([^/\n]+)\s*\/\s*위치:\s*([^\n]+)/);

  return {
    detectedDevice: inlineMatch?.[1]?.trim() || labeledMatch?.[1]?.trim(),
    detectedLocation: inlineMatch?.[2]?.trim() || labeledMatch?.[2]?.trim(),
  };
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

    case "CONCURRENT_WARNING_1":
    case "LEADER_ACTION_REQUIRED_24H":
      return {
        label: "동시접속 경고",
        icon: "solar:danger-triangle-bold",
        badgeClassName: "bg-amber-50 text-amber-700 ring-amber-100",
        iconClassName: "bg-amber-50 text-amber-600",
      };

    case "DEVICE_ALERT":
    case "DEVICE_CHECK_REQUEST":
      return {
        label: "새 기기 감지",
        icon: "solar:smartphone-bold",
        badgeClassName: "bg-orange-50 text-orange-700 ring-orange-100",
        iconClassName: "bg-orange-50 text-orange-600",
      };

    case "CREDENTIALS_UPDATED":
      return {
        label: "이용정보 변경",
        icon: "solar:lock-password-bold",
        badgeClassName: "bg-sky-50 text-sky-700 ring-sky-100",
        iconClassName: "bg-sky-50 text-sky-600",
      };

    case "PARTY_DISSOLVING":
      return {
        label: "해체 예정",
        icon: "solar:shield-warning-bold",
        badgeClassName: "bg-rose-50 text-rose-700 ring-rose-100",
        iconClassName: "bg-rose-50 text-rose-600",
      };

    case "PARTY_DISSOLVED_FINAL":
      return {
        label: "파티 해체",
        icon: "solar:logout-3-bold",
        badgeClassName: "bg-slate-100 text-slate-700 ring-slate-200",
        iconClassName: "bg-slate-100 text-slate-500",
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

function isDeviceAlertNotification(notification: NotificationItem) {
  const title = notification.title || "";
  const content = notification.webContent || notification.content || "";

  return (
    notification.type === "DEVICE_ALERT" ||
    notification.type === "DEVICE_CHECK_REQUEST" ||
    notification.type.includes("DEVICE_ALERT") ||
    Boolean(getDeviceAlertId(notification)) ||
    Boolean(getNotificationField(notification, "detectedDevice")) ||
    title.includes("기기 확인 요청") ||
    content.includes("본인 기기인지 확인")
  );
}

function isLeaderActionRequiredNotification(notification: NotificationItem) {
  const title = notification.title || "";
  const content = notification.webContent || notification.content || "";

  return (
    notification.type === "LEADER_ACTION_REQUIRED_24H" ||
    title.includes("파티장 조치 요청") ||
    content.includes("비밀번호를 변경하고 이용 정보를 재공유")
  );
}

function getNotificationTargetPath(notification: NotificationItem) {
  const partyId = getNotificationPartyId(notification);
  const partyPath = partyId ? `/myparty/${partyId}` : "/myparty";

  if (isDeviceAlertNotification(notification)) {
    const alertId = getDeviceAlertId(notification);

    if (!alertId) return "/notification";

    return partyId
      ? `/myparty/${partyId}/device-alert/${alertId}`
      : `/device-alert/${alertId}`;
  }

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
      return partyId ? `/myparty/${partyId}/provision/confirm` : "/myparty";

    case "CREDENTIALS_UPDATED":
      return partyId ? `/myparty/${partyId}/provision/confirm` : "/myparty";

    case "CONCURRENT_WARNING_1":
      return (
        getNotificationField(notification, "faqUrl") ||
        "/support?category=동시접속"
      );

    case "LEADER_ACTION_REQUIRED_24H":
      return partyId ? `/myparty/${partyId}/provision/dashboard` : "/myparty";

    case "PARTY_DISSOLVING":
    case "PARTY_DISSOLVED_FINAL":
      return "/parties";

    case "PAYMENT_FAILED":
      return partyId
        ? `/myparty/${partyId}/provision/member-settings`
        : "/mypage/payment-method";

    case "PAYMENT_SUCCEEDED":
      return "/mypage/payment-method";

    case "SETTLEMENT_COMPLETED":
      return "/mypage/money";

    case "PARTY_TERMINATED":
    case "HOST_PROVISION_TIMEOUT_TERMINATED":
    case "MEMBER_AUTO_REMATCH_STARTED":
    case "MEMBER_PROVISION_TIMEOUT_NOTICE":
      return "/myparty";

    default:
      if (isLeaderActionRequiredNotification(notification)) {
        return partyId ? `/myparty/${partyId}/provision/dashboard` : "/myparty";
      }

      return partyId ? partyPath : "/myparty";
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
  const [resolvingIncidentIds, setResolvingIncidentIds] = useState<Set<string>>(
    new Set(),
  );

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

  const getDeviceAlertTargetPath = (notification: NotificationItem) => {
    const partyId = getNotificationPartyId(notification);
    const alertId = getDeviceAlertId(notification);

    if (!alertId) return "/notification";

    return partyId
      ? `/myparty/${partyId}/device-alert/${alertId}`
      : `/device-alert/${alertId}`;
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    const readSuccess = await markNotificationRead(notification);

    if (!readSuccess) return;

    if (isDeviceAlertNotification(notification)) {
      if (!getDeviceAlertId(notification)) {
        console.error(
          "Device alert notification is missing alert id",
          notification,
        );
        toast.error("기기 확인 알림 정보를 찾을 수 없습니다.");
        return;
      }

      const textInfo = getDeviceAlertTextInfo(notification);

      navigate(getDeviceAlertTargetPath(notification), {
        state: {
          ottProviderType:
            getNotificationField(notification, "ottProviderType") || "OTT",
          detectedDevice:
            getNotificationField(notification, "detectedDevice") ||
            textInfo.detectedDevice ||
            "확인 필요",
          detectedLocation:
            getNotificationField(notification, "detectedLocation") ||
            textInfo.detectedLocation ||
            "확인 필요",
          detectedAt:
            getNotificationField(notification, "detectedAt") ||
            notification.createdAt,
          expiresAt:
            getNotificationField(notification, "expiresAt") ||
            notification.createdAt,
        },
      });
      return;
    }

    navigate(getNotificationTargetPath(notification));
  };

  const handleReportConcurrentIssue = async (
    notification: NotificationItem,
  ) => {
    const readSuccess = await markNotificationRead(notification);
    if (!readSuccess) return;
    const partyId = getNotificationPartyId(notification);

    if (!partyId) {
      toast.info("파티 정보를 확인할 수 없습니다.");
      return;
    }

    navigate(`/myparty/${partyId}`, {
      state: {
        openConcurrentIssueModal: true,
      },
    });
  };

  const handleResolveIncident = async (notification: NotificationItem) => {
    const partyId = getNotificationPartyId(notification);
    const incidentId = getNotificationField(notification, "incidentId");

    if (!partyId || !incidentId) {
      toast.info("처리할 경고 정보를 확인할 수 없습니다.");
      return;
    }

    if (resolvingIncidentIds.has(incidentId)) return;

    setResolvingIncidentIds((prev) => {
      const next = new Set(prev);
      next.add(incidentId);
      return next;
    });

    try {
      await resolveConcurrentIssue(partyId, {
        incidentId: Number(incidentId),
      });
      toast.success("파티장 조치 완료로 처리했습니다.");
      await markNotificationRead(notification);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "조치 완료 처리에 실패했습니다."));
    } finally {
      setResolvingIncidentIds((prev) => {
        const next = new Set(prev);
        next.delete(incidentId);
        return next;
      });
    }
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
                  <article
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleNotificationClick(notification);
                      }
                    }}
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

                        <NotificationActions
                          notification={notification}
                          isResolving={
                            getNotificationField(notification, "incidentId")
                              ? resolvingIncidentIds.has(
                                  getNotificationField(
                                    notification,
                                    "incidentId",
                                  ) as string,
                                )
                              : false
                          }
                          onFaq={() => navigate("/support?category=동시접속")}
                          onReport={() =>
                            handleReportConcurrentIssue(notification)
                          }
                          onResolve={() => handleResolveIncident(notification)}
                          onFindParty={() => navigate("/parties")}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function NotificationActions({
  notification,
  isResolving,
  onFaq,
  onReport,
  onResolve,
  onFindParty,
}: {
  notification: NotificationItem;
  isResolving: boolean;
  onFaq: () => void;
  onReport: () => void;
  onResolve: () => void;
  onFindParty: () => void;
}) {
  const stop = (handler: () => void) => {
    return (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handler();
    };
  };

  if (notification.type === "CONCURRENT_WARNING_1") {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={stop(onFaq)}
          className="inline-flex h-9 items-center justify-center rounded-full bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          FAQ 확인하기
        </button>
        <button
          type="button"
          onClick={stop(onReport)}
          className="inline-flex h-9 items-center justify-center rounded-full bg-amber-50 px-3 text-xs font-bold text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100"
        >
          문제 신고하기
        </button>
      </div>
    );
  }

  if (notification.type === "LEADER_ACTION_REQUIRED_24H") {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={stop(onResolve)}
          disabled={isResolving}
          className="inline-flex h-9 items-center justify-center rounded-full bg-brand-main px-3 text-xs font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isResolving ? "처리 중" : "조치 완료"}
        </button>
      </div>
    );
  }

  if (
    notification.type === "PARTY_DISSOLVING" ||
    notification.type === "PARTY_DISSOLVED_FINAL"
  ) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={stop(onFindParty)}
          className="inline-flex h-9 items-center justify-center rounded-full bg-rose-50 px-3 text-xs font-bold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
        >
          새 파티 찾기
        </button>
      </div>
    );
  }

  return null;
}
