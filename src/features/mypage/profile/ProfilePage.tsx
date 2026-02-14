// src/features/mypage/profile/ProfilePage.tsx
import { useEffect, useMemo, useState } from "react";
import { Mail, User, Check } from "lucide-react";

type FormState = {
  name: string;
  email: string;
};

export default function ProfilePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // TODO: 실제 유저 데이터로 교체
  const initial = useMemo<FormState>(
    () => ({
      name: "사용자",
      email: "user@subfolio.app",
    }),
    [],
  );

  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);

  const changed =
    form.name.trim() !== initial.name.trim() ||
    form.email.trim() !== initial.email.trim();

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    if (!changed) return;
    setSaving(true);
    try {
      // TODO: API 연결
      await new Promise((r) => setTimeout(r, 400));
      alert("TODO: 프로필 저장 API 연결");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg font-sans text-slate-900">
      {/* Soft Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-brand-sub/10 blur-3xl" />
        <div className="absolute -bottom-50 -right-45 h-130 w-130 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -left-50 top-45 h-105 w-105 rounded-full bg-brand-main/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Title */}
        <div>
          <div className="text-xs font-semibold text-slate-500">Account</div>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
            내 정보 관리
          </h1>
          <div className="mt-2 text-sm text-slate-600">
            이름과 이메일을 수정할 수 있어요.
          </div>
        </div>

        {/* Form */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <div className="mb-2 text-xs font-semibold text-slate-500">
                이름
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                  <User className="h-5 w-5" />
                </span>

                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="h-10 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="mb-2 text-xs font-semibold text-slate-500">
                이메일
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                  <Mail className="h-5 w-5" />
                </span>

                <input
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="h-10 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="이메일을 입력하세요"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <div className="mt-2 text-xs text-slate-500">
                로그인 방식에 따라 이메일 변경이 제한될 수 있어요.
              </div>
            </div>
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-10">
          <button
            type="button"
            onClick={onSave}
            disabled={!changed || saving}
            className={[
              "flex w-full items-center justify-center gap-2 rounded-3xl px-4 py-4 text-sm font-extrabold shadow-sm transition",
              !changed || saving
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-brand-main text-white hover:-translate-y-0.5 hover:shadow-md",
            ].join(" ")}
          >
            <Check className="h-4 w-4" />
            {saving ? "저장 중…" : "변경사항 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
