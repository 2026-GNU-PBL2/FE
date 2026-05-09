import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SetupProvider = "google" | "kakao" | "naver" | null;

type SetupStore = {
  provider: SetupProvider;
  socialEmail: string;

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

  submateEmail: "",
  nickname: "",

  phoneNumber: "",
  verificationCode: "",
  isPhoneVerified: false,

  pinNumber: "",
  pinNumberConfirm: "",
};

export const useSetupStore = create<SetupStore>()(
  persist(
    (set) => ({
      ...initialState,

      setProviderInfo: ({ provider, socialEmail }) =>
        set({
          provider,
          socialEmail,
        }),

      setProfile: ({ submateEmail, nickname }) =>
        set({
          submateEmail,
          nickname,
          phoneNumber: "",
          verificationCode: "",
          isPhoneVerified: false,
          pinNumber: "",
          pinNumberConfirm: "",
        }),

      setPhone: ({ phoneNumber, verificationCode }) =>
        set({
          phoneNumber,
          verificationCode,
          pinNumber: "",
          pinNumberConfirm: "",
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
    }),
    {
      name: "submate-setup-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        provider: state.provider,
        socialEmail: state.socialEmail,
        submateEmail: state.submateEmail,
        nickname: state.nickname,
        phoneNumber: state.phoneNumber,
        isPhoneVerified: state.isPhoneVerified,
      }),
    },
  ),
);
