// http://localhost:5173/login/callback?accessToken=xxx&id=1&email=test@test.com&nickname=하진&provider=google&profileImage=https://...

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type SocialProvider } from "@/stores/authStore";

export default function SocialLoginCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const accessToken = searchParams.get("accessToken");
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const nickname = searchParams.get("nickname");
    const provider = searchParams.get("provider") as SocialProvider | null;
    const profileImage = searchParams.get("profileImage") ?? "";

    if (!accessToken || !id || !email || !nickname || !provider) {
      navigate("/log-in", { replace: true });
      return;
    }

    setAuth({
      accessToken,
      user: {
        id,
        email,
        nickname,
        provider,
        profileImage,
      },
    });

    navigate("/mypage", { replace: true });
  }, [navigate, setAuth]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
      <div className="rounded-4xl border border-slate-200 bg-white px-8 py-10 text-center shadow-lg shadow-slate-900/5">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900" />
        <p className="mt-5 text-base font-bold text-slate-900">
          로그인 정보를 확인하고 있습니다
        </p>
        <p className="mt-2 text-sm text-slate-500">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
