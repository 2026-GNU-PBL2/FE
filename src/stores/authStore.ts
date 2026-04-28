// src/stores/authStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "CUSTOMER" | "ADMIN";
export type UserStatus = "PENDING_SIGNUP" | "ACTIVE" | "SUSPENDED";
export type AuthSocialProvider = "kakao" | "naver" | "google" | null;
export type AuthStatus =
  | "idle"
  | "checking"
  | "authenticated"
  | "unauthenticated";

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
  authStatus: AuthStatus;
  setAuth: (payload: {
    accessToken: string;
    user: AuthUser;
    socialProvider: Exclude<AuthSocialProvider, null>;
  }) => void;
  setAuthChecking: () => void;
  setVerifiedUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      socialProvider: null,
      isAuthenticated: false,
      authStatus: "idle",

      setAuth: ({ accessToken, user, socialProvider }) => {
        set({
          accessToken,
          user,
          socialProvider,
          isAuthenticated: true,
          authStatus: "authenticated",
        });
      },

      setAuthChecking: () => {
        set({
          isAuthenticated: false,
          authStatus: "checking",
        });
      },

      setVerifiedUser: (user) => {
        set({
          user,
          isAuthenticated: true,
          authStatus: "authenticated",
        });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          user: null,
          socialProvider: null,
          isAuthenticated: false,
          authStatus: "unauthenticated",
        });
      },
    }),
    {
      name: "submate-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        socialProvider: state.socialProvider,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<AuthState>),
        isAuthenticated: false,
        authStatus: "idle",
      }),
    },
  ),
);
