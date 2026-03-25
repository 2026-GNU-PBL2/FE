import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import SetupShell from "./SetupShell";
import { validateNickname, validateUserId } from "./setupUtils";
import { useSetupStore } from "@/stores/setupStore";

export default function SetupProfilePage() {
  const navigate = useNavigate();
  const { userId, nickname, setProfile } = useSetupStore();

  const [localUserId, setLocalUserId] = useState(userId);
  const [localNickname, setLocalNickname] = useState(nickname);
  const [submitted, setSubmitted] = useState(false);

  const [isUserIdChecked, setIsUserIdChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  let userIdError = "";
  let nicknameError = "";

  if (submitted || localUserId.length > 0) {
    if (!localUserId.trim()) {
      userIdError = "아이디를 입력해 주세요.";
    } else if (!validateUserId(localUserId)) {
      userIdError =
        "아이디는 4~20자의 영문, 숫자, ., _, - 만 사용할 수 있습니다.";
    }
  }

  if (submitted || localNickname.length > 0) {
    if (!localNickname.trim()) {
      nicknameError = "닉네임을 입력해 주세요.";
    } else if (!validateNickname(localNickname)) {
      nicknameError = "닉네임은 2자 이상 12자 이하로 입력해 주세요.";
    }
  }

  const isValid =
    !userIdError && !nicknameError && isUserIdChecked && isNicknameChecked;

  const handleCheckUserId = () => {
    if (userIdError || !localUserId.trim()) return;

    // TODO: 아이디 중복확인 API 연결
    setIsUserIdChecked(true);
  };

  const handleCheckNickname = () => {
    if (nicknameError || !localNickname.trim()) return;

    // TODO: 닉네임 중복확인 API 연결
    setIsNicknameChecked(true);
  };

  const handleNext = () => {
    setSubmitted(true);

    if (!isValid) return;

    setProfile({
      userId: localUserId.trim(),
      nickname: localNickname.trim(),
    });

    navigate("/setup/phone");
  };

  return (
    <SetupShell
      step={2}
      totalSteps={5}
      badge="프로필 설정"
      title={
        <>
          사용할 계정을
          <br />
          <span className="text-brand-main">간단히 설정해 주세요</span>
        </>
      }
      description={<>아이디와 닉네임은 다른 사용자와 겹칠 수 없습니다.</>}
      rightContent={
        <div className="space-y-6">
          <Field
            label="아이디"
            subLabel="로그인에 사용됩니다"
            value={localUserId}
            onChange={(value) => {
              setLocalUserId(value);
              setIsUserIdChecked(false);
            }}
            placeholder="submate.user"
            icon="solar:user-id-bold-duotone"
            error={userIdError}
            checked={isUserIdChecked}
            onCheck={handleCheckUserId}
          />

          <Field
            label="닉네임"
            subLabel="서비스에 표시됩니다"
            value={localNickname}
            onChange={(value) => {
              setLocalNickname(value);
              setIsNicknameChecked(false);
            }}
            placeholder="서브메이트"
            icon="solar:smile-circle-bold-duotone"
            error={nicknameError}
            checked={isNicknameChecked}
            onCheck={handleCheckNickname}
          />

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-main px-5 py-4 text-base font-semibold text-white transition hover:opacity-95 active:scale-95"
          >
            다음으로
          </button>
        </div>
      }
    />
  );
}

function Field({
  label,
  subLabel,
  value,
  onChange,
  placeholder,
  icon,
  error,
  checked,
  onCheck,
}: {
  label: string;
  subLabel: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: string;
  error: string;
  checked: boolean;
  onCheck: () => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-xs font-semibold text-slate-400">{subLabel}</p>
      </div>

      <div
        className={[
          "flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition",
          error
            ? "border-rose-300"
            : "border-slate-200 focus-within:border-brand-main",
        ].join(" ")}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-main/10 text-brand-main">
          <Icon icon={icon} width="20" height="20" />
        </div>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={onCheck}
          disabled={!!error || !value.trim() || checked}
          className={[
            "whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition",
            checked
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {checked ? "확인됨" : "중복확인"}
        </button>
      </div>

      {error ? (
        <p className="text-sm font-medium text-rose-500">{error}</p>
      ) : null}
    </div>
  );
}
