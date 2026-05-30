import { Icon } from "@iconify/react";
import type { MouseEvent } from "react";
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
  | "CONCURRENT_WARNING_1"
  | "HOST_ACTION_REQUIRED_24H"
  | "HOST_RENOTIFY"
  | "DEVICE_ALERT"
  | "DEVICE_CHECK_REQUEST"
  | "DEVICE_CONFIRMED_MINE"
  | "CREDENTIALS_UPDATED"
  | "PARTY_DISSOLVING"
  | "HOST_URGENT_PASSWORD_CHANGE"
  | "PARTY_DISSOLVED_FINAL"
  | "LEADER_ACTION_REQUIRED_24H"
  | string;

type NotificationPayload = {
  type?: NotificationType;
  partyId?: string | number;
  party_id?: string | number;
  partyID?: string | number;
  partyName?: string;
  role?: string;
  partyRole?: string;
  memberRole?: string;
  userRole?: string;
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
  role?: string | null;
  partyRole?: string | null;
  memberRole?: string | null;
  userRole?: string | null;
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

type PartyHistoryRoleItem = {
  partyId: number;
  role?: string | null;
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

function parseIsoLikeDate(value: string) {
  const normalized = value.replace(
    /\.(\d{3})\d+(?=Z|[+-]\d{2}:?\d{2}|$)/,
    ".$1",
  );
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatInlineDateTime(value: string) {
  const date = parseIsoLikeDate(value);

  if (!date) return value;

  const parts = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const dayPeriod = part("dayPeriod");
  const localizedDayPeriod =
    dayPeriod === "AM" ? "오전" : dayPeriod === "PM" ? "오후" : dayPeriod;

  return `${part("month")} ${part("day")}일 ${localizedDayPeriod} ${part(
    "hour",
  )}:${part("minute")}`;
}

function formatNotificationContent(value: string) {
  return value.replace(
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})?)\s*까지/g,
    (_, dateText: string) => `${formatInlineDateTime(dateText)}까지`,
  );
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

function normalizeRole(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if (normalized === "HOST" || normalized === "LEADER") return "HOST";
  if (normalized === "MEMBER") return "MEMBER";

  return null;
}

function getNotificationRole(notification: NotificationItem) {
  const payload = getNotificationPayload(notification);
  const topLevel = notification as NotificationItem & Record<string, unknown>;
  const loosePayload = payload as NotificationPayload & Record<string, unknown>;

  return normalizeRole(
    notification.role ??
      notification.partyRole ??
      notification.memberRole ??
      notification.userRole ??
      payload.role ??
      payload.partyRole ??
      payload.memberRole ??
      payload.userRole ??
      topLevel.party_role ??
      topLevel.member_role ??
      topLevel.user_role ??
      loosePayload.party_role ??
      loosePayload.member_role ??
      loosePayload.user_role,
  );
}

function getDashboardPathByRole(partyId: string | number, role: string | null) {
  if (role === "HOST") return `/myparty/${partyId}/provision/dashboard`;
  if (role === "MEMBER") return `/myparty/${partyId}/provision/member-dashboard`;

  return `/myparty/${partyId}`;
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
  const referenceIdKeys = ["referenceId", "reference_id"];
  const referenceId =
    notification.referenceId ??
    notification.reference_id ??
    payload.referenceId ??
    payload.reference_id ??
    topLevel.reference_id ??
    loosePayload.reference_id ??
    findRouteValueByKeys(payload, referenceIdKeys) ??
    findRouteValueByKeys(topLevel, referenceIdKeys);

  if (notification.type === "DEVICE_CHECK_REQUEST") {
    return stringifyRouteValue(referenceId);
  }

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
    findRouteValueByKeys(topLevel, alertIdKeys);

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

const notificationTone = {
  info: {
    badgeClassName: "bg-blue-50 text-blue-700 ring-blue-100",
    iconClassName: "bg-blue-50 text-brand-main",
  },
  success: {
    badgeClassName: "bg-emerald-50 text-[#00875A] ring-[#A9E6C9]",
    iconClassName: "bg-emerald-50 text-[#00875A]",
  },
  warning: {
    badgeClassName: "bg-[#FFF4CC] text-[#B77900] ring-[#FFE29A]",
    iconClassName: "bg-[#FFF4CC] text-[#D99A00]",
  },
  danger: {
    badgeClassName: "bg-rose-50 text-rose-700 ring-rose-100",
    iconClassName: "bg-rose-50 text-rose-600",
  },
  neutral: {
    badgeClassName: "bg-slate-100 text-slate-700 ring-slate-200",
    iconClassName: "bg-slate-100 text-slate-500",
  },
};

function getNotificationMeta(type: NotificationType) {
  switch (type) {
    case "PARTY_MATCHED":
      return {
        label: "파티 매칭",
        icon: "solar:users-group-rounded-bold",
        ...notificationTone.info,
      };

    case "HOST_PARTY_MATCHED":
      return {
        label: "모집 완료",
        icon: "solar:crown-star-bold",
        ...notificationTone.info,
      };

    case "HOST_PROVISION_REQUIRED":
    case "HOST_PROVISION_REMINDER":
    case "HOST_PROVISION_DELAYED_NOTICE":
      return {
        label: "이용 정보",
        icon: "solar:shield-keyhole-bold",
        ...notificationTone.info,
      };

    case "PROVISION_ACCOUNT_SHARED_REQUIRED":
    case "PROVISION_INVITE_CODE_REQUIRED":
    case "PROVISION_ACCOUNT_SHARED_REMINDER":
    case "PROVISION_INVITE_ACCEPT_REQUIRED":
    case "MEMBER_PROVISION_TIMEOUT_NOTICE":
      return {
        label: "이용 확인",
        icon: "solar:checklist-minimalistic-bold",
        ...notificationTone.info,
      };

    case "PAYMENT_FAILED":
      return {
        label: "결제 실패",
        icon: "solar:cardholder-bold",
        ...notificationTone.danger,
      };

    case "CONCURRENT_WARNING_1":
    case "HOST_ACTION_REQUIRED_24H":
    case "HOST_RENOTIFY":
    case "HOST_URGENT_PASSWORD_CHANGE":
    case "LEADER_ACTION_REQUIRED_24H":
      return {
        label: "동시접속 경고",
        icon: "solar:danger-triangle-bold",
        ...notificationTone.warning,
      };

    case "DEVICE_ALERT":
    case "DEVICE_CHECK_REQUEST":
      return {
        label: "새 기기 감지",
        icon: "solar:smartphone-bold",
        ...notificationTone.warning,
      };

    case "DEVICE_CONFIRMED_MINE":
      return {
        label: "기기 확인",
        icon: "solar:smartphone-update-bold",
        ...notificationTone.success,
      };

    case "CREDENTIALS_UPDATED":
      return {
        label: "이용정보 변경",
        icon: "solar:lock-password-bold",
        ...notificationTone.info,
      };

    case "PARTY_DISSOLVING":
      return {
        label: "해체 예정",
        icon: "solar:shield-warning-bold",
        ...notificationTone.danger,
      };

    case "PARTY_DISSOLVED_FINAL":
      return {
        label: "파티 해체",
        icon: "solar:logout-3-bold",
        ...notificationTone.neutral,
      };

    case "PAYMENT_SUCCEEDED":
      return {
        label: "결제 완료",
        icon: "solar:card-2-bold",
        ...notificationTone.success,
      };

    case "SETTLEMENT_COMPLETED":
      return {
        label: "정산 완료",
        icon: "solar:wallet-money-bold",
        ...notificationTone.success,
      };

    case "PARTY_TERMINATED":
    case "HOST_PROVISION_TIMEOUT_TERMINATED":
    case "MEMBER_AUTO_REMATCH_STARTED":
      return {
        label: "파티 해체",
        icon: "solar:logout-3-bold",
        ...notificationTone.neutral,
      };

    default:
      return {
        label: "알림",
        icon: "solar:bell-bing-bold",
        ...notificationTone.neutral,
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
    Boolean(getNotificationField(notification, "detectedDevice")) ||
    title.includes("기기 확인 요청") ||
    content.includes("본인 기기인지 확인")
  );
}

function isLeaderActionRequiredNotification(notification: NotificationItem) {
  const title = notification.title || "";
  const content = notification.webContent || notification.content || "";

  return (
    notification.type === "HOST_ACTION_REQUIRED_24H" ||
    notification.type === "HOST_RENOTIFY" ||
    notification.type === "HOST_URGENT_PASSWORD_CHANGE" ||
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

    case "HOST_ACTION_REQUIRED_24H":
    case "HOST_RENOTIFY":
    case "HOST_URGENT_PASSWORD_CHANGE":
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

  const resolvePartyDashboardPath = async (notification: NotificationItem) => {
    const partyId = getNotificationPartyId(notification);

    if (!partyId) return "/myparty";

    const notificationRole = getNotificationRole(notification);

    if (notificationRole) {
      return getDashboardPathByRole(partyId, notificationRole);
    }

    try {
      const response = await api.get("/api/v1/me/party-history");
      const data = unwrapResponse<PartyHistoryRoleItem[]>(response.data) ?? [];
      const party = Array.isArray(data)
        ? data.find((item) => String(item.partyId) === String(partyId))
        : null;

      return getDashboardPathByRole(partyId, normalizeRole(party?.role));
    } catch (error) {
      console.error(error);
      toast.info("내 파티 역할을 확인하지 못해 파티 상세로 이동합니다.");
      return `/myparty/${partyId}`;
    }
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
          expiresAt: getNotificationField(notification, "expiresAt"),
        },
      });
      return;
    }

    if (notification.type === "DEVICE_CONFIRMED_MINE") {
      navigate(await resolvePartyDashboardPath(notification));
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
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CC] text-[#D99A00] ring-1 ring-[#FFE29A]">
                  <Icon icon="solar:bell-bing-bold" className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-950">
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
            <div className="space-y-3 p-4 sm:p-5">
              {notifications.map((notification) => {
                const meta = getNotificationMeta(notification.type);
                const unread = isUnread(notification);
                const content =
                  notification.webContent ||
                  notification.content ||
                  "알림 내용을 확인해주세요.";
                const displayContent = formatNotificationContent(content);

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
                    className={`relative w-full overflow-hidden rounded-[26px] px-5 py-5 text-left ring-1 transition hover:bg-slate-50 sm:px-6 sm:py-6 ${
                      unread
                        ? "bg-amber-50/35 ring-amber-100"
                        : "bg-white ring-slate-100"
                    }`}
                  >
                    {unread && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-amber-400" />
                    )}
                    <div className="flex gap-4 sm:gap-5">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.iconClassName}`}
                      >
                        <Icon icon={meta.icon} className="h-6 w-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="flex min-w-0 items-start justify-between gap-3">
                            <h3
                              className={`line-clamp-1 text-base font-bold ${
                                unread ? "text-slate-950" : "text-slate-700"
                              }`}
                            >
                              {notification.title || "알림"}
                            </h3>

                            <div className="flex shrink-0 items-center gap-2">
                              {unread && (
                                <span className="h-2 w-2 rounded-full bg-amber-400" />
                              )}
                              <span className="text-xs font-medium text-slate-400">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-slate-500">
                            {displayContent}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
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
                          onFaq={() => navigate("/support?category=동시접속")}
                          onReport={() =>
                            handleReportConcurrentIssue(notification)
                          }
                          onHostAction={() =>
                            navigate(getNotificationTargetPath(notification))
                          }
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
  onFaq,
  onReport,
  onHostAction,
  onFindParty,
}: {
  notification: NotificationItem;
  onFaq: () => void;
  onReport: () => void;
  onHostAction: () => void;
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
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={stop(onFaq)}
          className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          FAQ 확인하기
        </button>
        <button
          type="button"
          onClick={stop(onReport)}
          className="inline-flex h-10 items-center justify-center rounded-full bg-amber-50 px-4 text-xs font-bold text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100"
        >
          문제 신고하기
        </button>
      </div>
    );
  }

  if (
    notification.type === "HOST_ACTION_REQUIRED_24H" ||
    notification.type === "HOST_RENOTIFY" ||
    notification.type === "HOST_URGENT_PASSWORD_CHANGE" ||
    notification.type === "LEADER_ACTION_REQUIRED_24H"
  ) {
    return (
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={stop(onHostAction)}
          className="inline-flex h-10 items-center justify-center rounded-full bg-brand-main px-4 text-xs font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          조치하러 가기
        </button>
      </div>
    );
  }

  if (
    notification.type === "PARTY_DISSOLVING" ||
    notification.type === "PARTY_DISSOLVED_FINAL"
  ) {
    return (
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={stop(onFindParty)}
          className="inline-flex h-10 items-center justify-center rounded-full bg-rose-50 px-4 text-xs font-bold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
        >
          새 파티 찾기
        </button>
      </div>
    );
  }

  return null;
}
