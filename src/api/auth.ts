// src/api/auth.ts

import { api } from "@/api/axios";

export type LoginProvider = "kakao" | "naver" | "google";
export type SocialProvider = "KAKAO" | "NAVER" | "GOOGLE";

export interface OauthLoginRequest {
  code: string;
  socialProvider: SocialProvider;
}

export interface OauthLoginResponse {
  accessToken: string;
}

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID ?? "";
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID ?? "";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const KAKAO_REDIRECT_URI =
  import.meta.env.VITE_KAKAO_REDIRECT_URI ??
  `${window.location.origin}/oauth/kakao/callback`;

const NAVER_REDIRECT_URI =
  import.meta.env.VITE_NAVER_REDIRECT_URI ??
  `${window.location.origin}/oauth/naver/callback`;

const GOOGLE_REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ??
  `${window.location.origin}/oauth/google/callback`;

const OAUTH_STATE_STORAGE_KEY = "submate-oauth-state";

function createOauthState(provider: LoginProvider) {
  const state = `${provider}-${crypto.randomUUID()}`;
  sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);
  return state;
}

export function getSavedOauthState() {
  return sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);
}

export function clearSavedOauthState() {
  sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);
}

function buildKakaoLoginUrl() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URI,
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

function buildNaverLoginUrl() {
  const state = createOauthState("naver");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: NAVER_CLIENT_ID,
    redirect_uri: NAVER_REDIRECT_URI,
    state,
  });

  return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
}

function buildGoogleLoginUrl() {
  const state = createOauthState("google");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getSocialAuthorizeUrl(provider: LoginProvider) {
  if (provider === "kakao") {
    return buildKakaoLoginUrl();
  }

  if (provider === "naver") {
    return buildNaverLoginUrl();
  }

  return buildGoogleLoginUrl();
}

export function toSocialProvider(provider: LoginProvider): SocialProvider {
  if (provider === "kakao") return "KAKAO";
  if (provider === "naver") return "NAVER";
  return "GOOGLE";
}

export function parseSocialProvider(
  provider: string | null | undefined,
): SocialProvider | null {
  if (!provider) return null;

  const normalized = provider.trim().toUpperCase();

  if (normalized === "KAKAO") return "KAKAO";
  if (normalized === "NAVER") return "NAVER";
  if (normalized === "GOOGLE") return "GOOGLE";

  return null;
}

export async function loginWithOauthCode(
  request: OauthLoginRequest,
): Promise<OauthLoginResponse> {
  const response = await api.post<OauthLoginResponse>(
    "/api/v1/auth/login",
    request,
  );

  return response.data;
}
