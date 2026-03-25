import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function MyPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  if (!isAuthenticated || !user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          <div className="bg-linear-to-r from-blue-900 via-blue-800 to-sky-500 px-6 py-8 text-white sm:px-8">
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.nickname}
                  className="h-16 w-16 rounded-full border-2 border-white/60 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
                  <Icon icon="solar:user-bold" className="h-8 w-8" />
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-blue-100">마이페이지</p>
                <h1 className="mt-1 text-2xl font-extrabold">
                  {user.nickname}
                </h1>
                <p className="mt-1 text-sm text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:px-8 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 px-5 py-5">
              <p className="text-xs font-medium text-slate-400">로그인 방식</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                {user.provider}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 px-5 py-5">
              <p className="text-xs font-medium text-slate-400">회원 상태</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                로그인 완료
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-8">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-12 items-center justify-center rounded-3xl bg-blue-900 px-6 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
