// src/stores/setupStore.ts

import { create } from "zustand";

export type SocialProvider = "google" | "kakao" | "naver";

interface SetupState {
  provider: SocialProvider | null;
  socialEmail: string;
  profileImage: string;
  userId: string;
  nickname: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  verificationCode: string;
  isPhoneVerified: boolean;
  setProviderInfo: (payload: {
    provider: SocialProvider;
    socialEmail?: string;
    profileImage?: string;
  }) => void;
  setProfile: (payload: { userId: string; nickname: string }) => void;
  setSecurity: (payload: { password: string; passwordConfirm: string }) => void;
  setPhone: (payload: { phone: string; verificationCode: string }) => void;
  setPhoneVerified: (value: boolean) => void;
  resetSetup: () => void;
}

const initialState = {
  provider: null,
  socialEmail: "",
  profileImage: "",
  userId: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
  phone: "",
  verificationCode: "",
  isPhoneVerified: false,
};

export const useSetupStore = create<SetupState>((set) => ({
  ...initialState,

  setProviderInfo: ({ provider, socialEmail = "", profileImage = "" }) =>
    set({
      provider,
      socialEmail,
      profileImage,
    }),

  setProfile: ({ userId, nickname }) =>
    set({
      userId,
      nickname,
    }),

  setSecurity: ({ password, passwordConfirm }) =>
    set({
      password,
      passwordConfirm,
    }),

  setPhone: ({ phone, verificationCode }) =>
    set({
      phone,
      verificationCode,
    }),

  setPhoneVerified: (value) =>
    set({
      isPhoneVerified: value,
    }),

  resetSetup: () =>
    set({
      ...initialState,
    }),
}));
