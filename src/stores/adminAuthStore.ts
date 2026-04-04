import { create } from "zustand";
import { persist } from "zustand/middleware";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "OPERATOR";
};

type AdminLoginPayload = {
  adminId: string;
  password: string;
};

type AdminAuthState = {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  login: (payload: AdminLoginPayload) => {
    success: boolean;
    message: string;
  };
  logout: () => void;
};

const MOCK_ADMIN_ID = "admin";
const MOCK_ADMIN_PASSWORD = "submate123!";

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAdminAuthenticated: false,
      adminUser: null,

      login: ({ adminId, password }) => {
        const normalizedId = adminId.trim();

        if (
          normalizedId === MOCK_ADMIN_ID &&
          password === MOCK_ADMIN_PASSWORD
        ) {
          set({
            isAdminAuthenticated: true,
            adminUser: {
              id: "ADMIN-001",
              name: "Submate Admin",
              email: "admin@submate.com",
              role: "SUPER_ADMIN",
            },
          });

          return {
            success: true,
            message: "관리자 로그인에 성공했습니다.",
          };
        }

        return {
          success: false,
          message: "아이디 또는 비밀번호가 올바르지 않습니다.",
        };
      },

      logout: () => {
        set({
          isAdminAuthenticated: false,
          adminUser: null,
        });
      },
    }),
    {
      name: "submate-admin-auth",
    },
  ),
);
