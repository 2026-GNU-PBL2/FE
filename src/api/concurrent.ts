import { api } from "@/api/axios";

export type PartyMemberDevice = {
  deviceId: number;
  partyId: number;
  deviceType: string;
  os: string;
  browser: string | null;
  registrationMethod: string;
  registeredAt: string;
};

export type CreatePartyMemberDeviceRequest = {
  deviceType: string;
  os: string;
  browser?: string | null;
};

export type DeviceAlertReportRequest = {
  detectedDevice: string;
  detectedLocation: string;
};

export type DeviceAlertReportResponse = {
  alertId: number;
  partyId: number;
  notifiedCount: number;
  expiresAt: string;
  registeredDevices: Array<{
    userId: number;
    deviceType: string;
    os: string;
    browser: string | null;
  }>;
};

export type DeviceAlertRespondRequest = {
  isMyDevice: boolean;
};

export type DeviceAlertRespondResponse = {
  alertId: number;
  status: "PENDING" | "CONFIRMED_MINE" | "REPORTED_UNKNOWN" | "EXPIRED" | string;
  mineCount: number;
  unknownCount: number;
  responseCount: number;
};

export type ConcurrentIssueReportRequest = {
  reportType: string;
};

export type ConcurrentIssueReportResponse = {
  incidentId: number;
  partyId: number;
  warningLevel: "FIRST" | "SECOND" | string;
  status: "FIRST_WARNING_SENT" | "DISSOLUTION_SCHEDULED" | string;
  hostDeadline: string | null;
  dissolutionDate: string | null;
};

export type ConcurrentIssueResolveRequest = {
  incidentId: number;
};

export type ConcurrentIssueResolveResponse = {
  incidentId: number;
  status: string;
};

export type ViolationRecord = {
  recordId: number;
  partyId: number;
  violationType:
    | "FIRST_WARNING"
    | "PARTY_DISSOLVED"
    | "DEVICE_ALERT_NO_RESPONSE"
    | string;
  weight: number;
  createdAt: string;
};

export type OttServicePlan = {
  serviceName?: string;
  ottProviderType?: string;
  planName: string;
  concurrentLimit: number;
  resolution?: string | null;
};

export type SharedCredentialResponse = {
  sharedAccountEmail: string;
  sharedAccountPassword: string;
};

export type ConcurrentIssueHistoryItem = {
  incidentId: number;
  status:
    | "OPEN"
    | "FIRST_WARNING_SENT"
    | "DISSOLUTION_SCHEDULED"
    | "RESOLVED"
    | "PARTY_DISSOLVED"
    | string;
  detectionSource: "MEMBER_REPORT" | string;
  firstWarnedAt: string | null;
  hostDeadline: string | null;
  dissolutionDate: string | null;
  resolvedAt: string | null;
  createdAt: string | null;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

export function unwrapResponse<T>(
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

export function getApiErrorMessage(error: unknown, fallback: string) {
  const responseData = (
    error as {
      response?: {
        data?: { message?: string; error?: string; code?: string };
        status?: number;
      };
    }
  ).response?.data;

  return responseData?.message || responseData?.error || fallback;
}

export async function createPartyMemberDevice(
  partyId: string | number,
  body: CreatePartyMemberDeviceRequest,
) {
  const response = await api.post(`/api/v1/party-member-devices/${partyId}`, {
    ...body,
    browser: body.browser?.trim() || null,
  });
  return unwrapResponse<PartyMemberDevice>(response.data);
}

export async function reportDeviceAlert(
  partyId: string | number,
  body: DeviceAlertReportRequest,
) {
  const response = await api.post(`/api/v1/device-alerts/${partyId}/report`, body);
  return unwrapResponse<DeviceAlertReportResponse>(response.data);
}

export async function respondDeviceAlert(
  alertId: string | number,
  body: DeviceAlertRespondRequest,
) {
  const response = await api.post(`/api/v1/device-alerts/${alertId}/respond`, body);
  return unwrapResponse<DeviceAlertRespondResponse>(response.data);
}

export async function notifyCredentialUpdate(partyId: string | number) {
  await api.post(`/api/v1/credentials/${partyId}/notify-update`);
}

export async function reportConcurrentIssue(
  partyId: string | number,
  body: ConcurrentIssueReportRequest = { reportType: "동시접속 위반 의심" },
) {
  const response = await api.post(`/api/v1/concurrent-issues/${partyId}`, body);
  return unwrapResponse<ConcurrentIssueReportResponse>(response.data);
}

export async function resolveConcurrentIssue(
  partyId: string | number,
  body: ConcurrentIssueResolveRequest,
) {
  const response = await api.post(
    `/api/v1/concurrent-issues/${partyId}/resolve`,
    body,
  );
  return unwrapResponse<ConcurrentIssueResolveResponse>(response.data);
}

export async function getMyViolations() {
  const response = await api.get("/api/v1/violations/me");
  return unwrapResponse<ViolationRecord[]>(response.data) ?? [];
}

export async function getOttServicePlans() {
  const response = await api.get("/api/v1/ott-service-plans");
  return unwrapResponse<OttServicePlan[]>(response.data) ?? [];
}

export async function getSharedCredentials(partyId: string | number) {
  const response = await api.get(`/api/v1/credentials/${partyId}`);
  return unwrapResponse<SharedCredentialResponse>(response.data);
}

export async function getConcurrentIssueHistory(partyId: string | number) {
  const response = await api.get(`/api/v1/concurrent-issues/${partyId}/history`);
  return unwrapResponse<ConcurrentIssueHistoryItem[]>(response.data) ?? [];
}
