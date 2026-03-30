import { create } from "zustand";

export type SetupProvider = "google" | "kakao" | "naver" | null;

type SetupStore = {
  provider: SetupProvider;
  socialEmail: string;
  profileImage: string;

  submateEmail: string;
  nickname: string;

  phoneNumber: string;
  verificationCode: string;
  isPhoneVerified: boolean;

  pinNumber: string;
  pinNumberConfirm: string;

  setProviderInfo: (payload: {
    provider: Exclude<SetupProvider, null>;
    socialEmail: string;
    profileImage: string;
  }) => void;

  setProfile: (payload: { submateEmail: string; nickname: string }) => void;

  setPhone: (payload: {
    phoneNumber: string;
    verificationCode: string;
  }) => void;

  setPhoneVerified: (verified: boolean) => void;

  setSecurity: (payload: {
    pinNumber: string;
    pinNumberConfirm: string;
  }) => void;

  resetSetup: () => void;
};

const initialState = {
  provider: null as SetupProvider,
  socialEmail: "",
  profileImage: "",

  submateEmail: "",
  nickname: "",

  phoneNumber: "",
  verificationCode: "",
  isPhoneVerified: false,

  pinNumber: "",
  pinNumberConfirm: "",
};

export const useSetupStore = create<SetupStore>((set) => ({
  ...initialState,

  setProviderInfo: ({ provider, socialEmail, profileImage }) =>
    set({
      provider,
      socialEmail,
      profileImage,
    }),

  setProfile: ({ submateEmail, nickname }) =>
    set({
      submateEmail,
      nickname,
    }),

  setPhone: ({ phoneNumber, verificationCode }) =>
    set({
      phoneNumber,
      verificationCode,
    }),

  setPhoneVerified: (verified) =>
    set({
      isPhoneVerified: verified,
    }),

  setSecurity: ({ pinNumber, pinNumberConfirm }) =>
    set({
      pinNumber,
      pinNumberConfirm,
    }),

  resetSetup: () => set(initialState),
}));
