import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export type SocialProvider = "google" | "kakao" | "naver";

export interface AuthUser {
  id: number | string;
  email: string;
  nickname: string;
  profileImage?: string;
  provider: SocialProvider;
}

interface SetAuthPayload {
  accessToken: string;
  user: AuthUser;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (payload: SetAuthPayload) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        user: null,
        isAuthenticated: false,

        setAuth: ({ accessToken, user }) =>
          set(
            {
              accessToken,
              user,
              isAuthenticated: true,
            },
            false,
            "auth/setAuth",
          ),

        clearAuth: () =>
          set(
            {
              accessToken: null,
              user: null,
              isAuthenticated: false,
            },
            false,
            "auth/clearAuth",
          ),
      }),
      {
        name: "submate-auth-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          accessToken: state.accessToken,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    {
      name: "AuthStore",
    },
  ),
);
