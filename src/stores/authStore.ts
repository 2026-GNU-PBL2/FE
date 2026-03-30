import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "CUSTOMER" | "ADMIN";
export type UserStatus = "PENDING_SIGNUP" | "ACTIVE" | "SUSPENDED";
export type AuthSocialProvider = "kakao" | "naver" | "google" | null;

export interface AuthUser {
  id: number;
  nickname: string | null;
  submateEmail: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  socialProvider: AuthSocialProvider;
  isAuthenticated: boolean;
  setAuth: (payload: {
    accessToken: string;
    user: AuthUser;
    socialProvider: Exclude<AuthSocialProvider, null>;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      socialProvider: null,
      isAuthenticated: false,

      setAuth: ({ accessToken, user, socialProvider }) => {
        set({
          accessToken,
          user,
          socialProvider,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          user: null,
          socialProvider: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "submate-auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
