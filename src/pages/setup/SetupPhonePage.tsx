import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import SetupShell from "./SetupShell";
import { useSetupStore } from "@/stores/setupStore";
import { formatPhoneNumber, toPhoneNumberDigits } from "./setupUtils";

const PHONE_REGEX = /^010-\d{4}-\d{4}$/;
const CODE_REGEX = /^\d{6}$/;
const RESEND_SECONDS = 180;

export default function SetupPhonePage() {
  const navigate = useNavigate();
  const { phoneNumber, verificationCode, setPhone, setPhoneVerified } =
    useSetupStore();

  const [localPhone, setLocalPhone] = useState(
    phoneNumber ? formatPhoneNumber(phoneNumber) : "",
  );
  const [localCode, setLocalCode] = useState(verificationCode);
  const [submitted, setSubmitted] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!isCodeSent || isVerified) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isCodeSent, isVerified]);

  const phoneError =
    submitted || localPhone.length > 0
      ? !localPhone.trim()
        ? "휴대폰 번호를 입력해 주세요."
        : !PHONE_REGEX.test(localPhone)
          ? "휴대폰 번호는 010-0000-0000 형식으로 입력해 주세요."
          : ""
      : "";

  const codeError =
    submitted || localCode.length > 0
      ? !localCode.trim()
        ? "인증번호를 입력해 주세요."
        : !CODE_REGEX.test(localCode)
          ? "인증번호는 6자리 숫자로 입력해 주세요."
          : ""
      : "";

  const timeText = useMemo(() => {
    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const handlePhoneChange = (value: string) => {
    setLocalPhone(formatPhoneNumber(value));
  };

  const handleSendCode = () => {
    setSubmitted(true);

    if (phoneError || !localPhone.trim()) return;

    // TODO: 인증번호 발송 API 연결
    setIsCodeSent(true);
    setIsVerified(false);
    setSecondsLeft(RESEND_SECONDS);
    setLocalCode("");
    setPhoneVerified(false);
  };

  const handleVerifyCode = () => {
    setSubmitted(true);

    if (!isCodeSent || codeError || !localCode.trim()) return;

    // TODO: 인증번호 검증 API 연결
    setIsVerified(true);
    setPhoneVerified(true);
  };

  const handleNext = () => {
    setSubmitted(true);

    if (phoneError || !isVerified) return;

    setPhone({
      phoneNumber: toPhoneNumberDigits(localPhone.trim()),
      verificationCode: localCode.trim(),
    });

    navigate("/setup/security");
  };

  return (
    <SetupShell
      step={3}
      totalSteps={5}
      badge="휴대폰 인증"
      title={
        <>
          본인 확인을 위해
          <br />
          <span className="text-brand-main">휴대폰 인증</span>을 진행해 주세요
        </>
      }
      description={<>인증이 완료되면 마지막 보안 설정 단계로 넘어갑니다.</>}
      rightContent={
        <div className="space-y-6">
          <div className="space-y-2">
            <div>
              <p className="text-sm font-bold text-slate-900">휴대폰 번호</p>
              <p className="text-xs font-semibold text-slate-400">
                010-0000-0000 형식으로 입력해 주세요
              </p>
            </div>

            <div
              className={[
                "flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition",
                phoneError
                  ? "border-rose-300"
                  : "border-slate-200 focus-within:border-brand-main",
              ].join(" ")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-main/10 text-brand-main">
                <Icon
                  icon="solar:smartphone-bold-duotone"
                  width="20"
                  height="20"
                />
              </div>

              <input
                value={localPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="010-0000-0000"
                inputMode="numeric"
                className="h-12 w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={handleSendCode}
                className="whitespace-nowrap rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                {isCodeSent ? "재전송" : "인증요청"}
              </button>
            </div>

            {phoneError ? (
              <p className="text-sm font-medium text-rose-500">{phoneError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm font-bold text-slate-900">인증번호</p>
              <p className="text-xs font-semibold text-slate-400">
                문자로 받은 6자리 숫자를 입력해 주세요
              </p>
            </div>

            <div
              className={[
                "flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition",
                codeError
                  ? "border-rose-300"
                  : "border-slate-200 focus-within:border-brand-main",
              ].join(" ")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-main/10 text-brand-main">
                <Icon
                  icon="solar:shield-keyhole-bold-duotone"
                  width="20"
                  height="20"
                />
              </div>

              <input
                value={localCode}
                onChange={(e) =>
                  setLocalCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="6자리 인증번호"
                inputMode="numeric"
                className="h-12 w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={!isCodeSent}
                className="whitespace-nowrap rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                확인
              </button>
            </div>

            <div className="flex items-center justify-between">
              {codeError ? (
                <p className="text-sm font-medium text-rose-500">{codeError}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  {isVerified
                    ? "인증이 완료되었습니다."
                    : isCodeSent
                      ? `남은 시간 ${timeText}`
                      : "먼저 인증번호를 요청해 주세요."}
                </p>
              )}

              {isVerified ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                  인증 완료
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm leading-6 text-slate-600">
              인증된 번호는 본인 확인과 결제, 정산 관련 주요 안내에 사용됩니다.
            </p>
          </div>

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
