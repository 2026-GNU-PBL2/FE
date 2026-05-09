import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SetupShell from "./SetupShell";
import { validateNickname, validateSubmateEmail } from "./setupUtils";
import { useSetupStore } from "@/stores/setupStore";
import { api } from "@/api/axios";

const SUBMATE_DOMAIN = "@submate.cloud";

type DuplicateCheckResponse = {
  available: boolean;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

function unwrapResponse<T>(
  value: T | ApiEnvelope<T> | undefined | null,
): T | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null) {
    const maybeEnvelope = value as ApiEnvelope<T>;

    if (maybeEnvelope.data) return maybeEnvelope.data;
    if (maybeEnvelope.result) return maybeEnvelope.result;
    if (maybeEnvelope.payload) return maybeEnvelope.payload;
  }

  return value as T;
}

export default function SetupProfilePage() {
  const navigate = useNavigate();
  const { submateEmail, nickname, setProfile } = useSetupStore();

  const [localSubmateEmail, setLocalSubmateEmail] = useState(submateEmail);
  const [localNickname, setLocalNickname] = useState(nickname);
  const [submitted, setSubmitted] = useState(false);

  const [isSubmateEmailChecked, setIsSubmateEmailChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  const [isCheckingSubmateEmail, setIsCheckingSubmateEmail] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  let submateEmailError = "";
  let nicknameError = "";

  const trimmedSubmateEmail = localSubmateEmail.trim();
  const trimmedNickname = localNickname.trim();

  if (submitted || localSubmateEmail.length > 0) {
    if (!trimmedSubmateEmail) {
      submateEmailError = "서브메이트 이메일 아이디를 입력해 주세요.";
    } else if (!validateSubmateEmail(trimmedSubmateEmail)) {
      submateEmailError = "4~20자의 영문, 숫자, ., _, - 만 사용할 수 있습니다.";
    }
  }

  if (submitted || localNickname.length > 0) {
    if (!trimmedNickname) {
      nicknameError = "닉네임을 입력해 주세요.";
    } else if (!validateNickname(trimmedNickname)) {
      nicknameError = "닉네임은 2자 이상 12자 이하로 입력해 주세요.";
    }
  }

  const previewEmail = useMemo(() => {
    if (!trimmedSubmateEmail) return `example${SUBMATE_DOMAIN}`;
    return `${trimmedSubmateEmail}${SUBMATE_DOMAIN}`;
  }, [trimmedSubmateEmail]);

  const isValid =
    !submateEmailError &&
    !nicknameError &&
    isSubmateEmailChecked &&
    isNicknameChecked;

  const handleCheckSubmateEmail = async () => {
    setSubmitted(true);

    if (submateEmailError || !trimmedSubmateEmail || isCheckingSubmateEmail) {
      return;
    }

    try {
      setIsCheckingSubmateEmail(true);

      const response = await api.get<
        DuplicateCheckResponse | ApiEnvelope<DuplicateCheckResponse>
      >("/api/v1/user/check/email", {
        params: {
          email: trimmedSubmateEmail,
        },
      });

      const result = unwrapResponse<DuplicateCheckResponse>(response.data);

      if (!result) {
        toast.error("이메일 중복확인 응답을 확인할 수 없습니다.");
        setIsSubmateEmailChecked(false);
        return;
      }

      if (result.available) {
        setIsSubmateEmailChecked(true);
        toast.success("사용 가능한 서브메이트 이메일입니다.");
      } else {
        setIsSubmateEmailChecked(false);
        toast.error("이미 사용 중인 서브메이트 이메일입니다.");
      }
    } catch (error) {
      console.error(error);
      setIsSubmateEmailChecked(false);
      toast.error("이메일 중복확인 중 오류가 발생했습니다.");
    } finally {
      setIsCheckingSubmateEmail(false);
    }
  };

  const handleCheckNickname = async () => {
    setSubmitted(true);

    if (nicknameError || !trimmedNickname || isCheckingNickname) {
      return;
    }

    try {
      setIsCheckingNickname(true);

      const response = await api.get<
        DuplicateCheckResponse | ApiEnvelope<DuplicateCheckResponse>
      >("/api/v1/user/check/nickname", {
        params: {
          nickname: trimmedNickname,
        },
      });

      const result = unwrapResponse<DuplicateCheckResponse>(response.data);

      if (!result) {
        toast.error("닉네임 중복확인 응답을 확인할 수 없습니다.");
        setIsNicknameChecked(false);
        return;
      }

      if (result.available) {
        setIsNicknameChecked(true);
        toast.success("사용 가능한 닉네임입니다.");
      } else {
        setIsNicknameChecked(false);
        toast.error("이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      console.error(error);
      setIsNicknameChecked(false);
      toast.error("닉네임 중복확인 중 오류가 발생했습니다.");
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleNext = () => {
    setSubmitted(true);

    if (submateEmailError || nicknameError) {
      return;
    }

    if (!isSubmateEmailChecked) {
      toast.error("서브메이트 이메일 중복확인을 완료해 주세요.");
      return;
    }

    if (!isNicknameChecked) {
      toast.error("닉네임 중복확인을 완료해 주세요.");
      return;
    }

    if (!isValid) return;

    setProfile({
      submateEmail: trimmedSubmateEmail,
      nickname: trimmedNickname,
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
          서비스에서 사용할
          <br />
          <span className="text-brand-main">계정 정보를 설정해 주세요</span>
        </>
      }
      description={
        <>서브메이트 이메일과 닉네임은 다른 사용자와 겹칠 수 없습니다.</>
      }
      rightContent={
        <div className="space-y-6">
          <Field
            label="서브메이트 이메일"
            subLabel={`${SUBMATE_DOMAIN} 형식으로 생성됩니다`}
            value={localSubmateEmail}
            onChange={(value) => {
              setLocalSubmateEmail(value);
              setIsSubmateEmailChecked(false);
            }}
            placeholder="hajin"
            icon="solar:letter-bold-duotone"
            error={submateEmailError}
            checked={isSubmateEmailChecked}
            isChecking={isCheckingSubmateEmail}
            onCheck={handleCheckSubmateEmail}
            suffix={SUBMATE_DOMAIN}
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold text-slate-500">
              생성될 서브메이트 이메일
            </p>
            <p className="mt-2 break-all text-sm font-bold text-slate-900">
              {previewEmail}
            </p>
          </div>

          <Field
            label="닉네임"
            subLabel="서비스 내 파티와 프로필에 표시됩니다"
            value={localNickname}
            onChange={(value) => {
              setLocalNickname(value);
              setIsNicknameChecked(false);
            }}
            placeholder="하진"
            icon="solar:smile-circle-bold-duotone"
            error={nicknameError}
            checked={isNicknameChecked}
            isChecking={isCheckingNickname}
            onCheck={handleCheckNickname}
          />

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-main px-5 py-4 text-base font-semibold text-white transition hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCheckingSubmateEmail || isCheckingNickname}
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
  isChecking,
  onCheck,
  suffix,
}: {
  label: string;
  subLabel: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: string;
  error: string;
  checked: boolean;
  isChecking: boolean;
  onCheck: () => void;
  suffix?: string;
}) {
  const isDisabled = !!error || !value.trim() || checked || isChecking;

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
            : checked
              ? "border-teal-300"
              : "border-slate-200 focus-within:border-brand-main",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            checked
              ? "bg-teal-50 text-teal-500"
              : "bg-brand-main/10 text-brand-main",
          ].join(" ")}
        >
          <Icon
            icon={checked ? "solar:check-circle-bold" : icon}
            width="20"
            height="20"
          />
        </div>

        <div className="flex h-12 min-w-0 flex-1 items-center gap-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />

          {suffix ? (
            <span className="shrink-0 text-sm font-semibold text-slate-500">
              {suffix}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onCheck}
          disabled={isDisabled}
          className={[
            "shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition",
            checked
              ? "bg-teal-100 text-teal-600"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {isChecking ? "확인 중" : checked ? "확인됨" : "중복확인"}
        </button>
      </div>

      {error ? (
        <p className="text-sm font-medium text-rose-500">{error}</p>
      ) : checked ? (
        <p className="text-sm font-medium text-teal-600">
          사용 가능한 {label}입니다.
        </p>
      ) : null}
    </div>
  );
}
