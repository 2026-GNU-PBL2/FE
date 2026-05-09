import axios from "axios";

type ErrorPayload = {
  message?: unknown;
  error?: unknown;
  data?: unknown;
  result?: unknown;
  payload?: unknown;
};

function readMessage(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const message = value.trim();
    return message || null;
  }

  if (typeof value !== "object") return null;

  const payload = value as ErrorPayload;

  const directMessage = readMessage(payload.message);
  if (directMessage) return directMessage;

  const errorMessage = readMessage(payload.error);
  if (errorMessage) return errorMessage;

  const dataMessage = readMessage(payload.data);
  if (dataMessage) return dataMessage;

  const resultMessage = readMessage(payload.result);
  if (resultMessage) return resultMessage;

  return readMessage(payload.payload);
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    return readMessage(error.response?.data) ?? fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}

export function isExpectedClientError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 400;
}
