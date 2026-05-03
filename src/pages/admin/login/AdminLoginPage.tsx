import { Icon } from "@iconify/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuthStore();

  const [adminId, setAdminId] = useState("admin");
  const [password, setPassword] = useState("submate123!");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    const result = login({ adminId, password });

    if (result.success) {
      toast.success(result.message);

      const nextPath =
        typeof location.state?.from === "string"
          ? location.state.from
          : "/admin/dashboard";

      navigate(nextPath, { replace: true });
      setIsSubmitting(false);
      return;
    }

    toast.error(result.message);
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-[-120px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-60px] h-[260px] w-[260px] rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute left-[-80px] top-[30%] h-[220px] w-[220px] rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-[460px]">
          <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="border-b border-slate-100 px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-linear-to-br from-blue-900 via-blue-800 to-cyan-400 text-white shadow-lg shadow-blue-900/15">
                <Icon
                  icon="solar:shield-user-bold-duotone"
                  className="h-7 w-7"
                />
              </div>

              <div className="mt-5 text-center">
                <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[30px]">
                  관리자 로그인
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Submate 운영 콘솔에 접근하려면
                  <br className="sm:hidden" /> 관리자 계정으로 로그인해 주세요.
                </p>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="adminId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    관리자 아이디
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <Icon
                        icon="solar:user-id-bold-duotone"
                        className="h-5 w-5"
                      />
                    </div>

                    <input
                      id="adminId"
                      type="text"
                      autoComplete="username"
                      value={adminId}
                      onChange={(event) => setAdminId(event.target.value)}
                      placeholder="아이디를 입력하세요"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-12 pr-4 text-[15px] text-slate-900 transition outline-hidden placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    비밀번호
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <Icon
                        icon="solar:lock-keyhole-bold-duotone"
                        className="h-5 w-5"
                      />
                    </div>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-12 pr-12 text-[15px] text-slate-900 transition outline-hidden placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                      aria-label={
                        showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                      }
                    >
                      <Icon
                        icon={
                          showPassword
                            ? "solar:eye-closed-bold"
                            : "solar:eye-bold"
                        }
                        className="h-5 w-5"
                      />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                      <Icon
                        icon="solar:key-minimalistic-bold-duotone"
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700">
                        데모 계정
                      </p>
                      <p className="mt-1 break-all text-sm text-slate-500">
                        아이디{" "}
                        <span className="font-semibold text-slate-800">
                          admin
                        </span>
                        <span className="mx-1 text-slate-300">/</span>
                        비밀번호{" "}
                        <span className="font-semibold text-slate-800">
                          submate123!
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Icon icon="svg-spinners:90-ring" className="h-5 w-5" />
                      로그인 중
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="solar:login-2-bold-duotone"
                        className="h-5 w-5"
                      />
                      관리자 콘솔 입장
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-400 sm:text-sm">
            관리자 전용 페이지입니다. 승인된 운영 계정만 접근할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
