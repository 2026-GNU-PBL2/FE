import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SetupShell from "./SetupShell";
import { useSetupStore } from "@/stores/setupStore";
import { formatPhoneNumber, toPhoneNumberDigits } from "./setupUtils";
import { api } from "@/api/axios";

const PHONE_REGEX = /^010-\d{4}-\d{4}$/;
const CODE_REGEX = /^\d{6}$/;
const RESEND_SECONDS = 180;

export default function SetupPhonePage() {
  const navigate = useNavigate();
  const {
    submateEmail,
    nickname,
    phoneNumber,
    verificationCode,
    setPhone,
    setPhoneVerified,
  } = useSetupStore();

  const [localPhone, setLocalPhone] = useState(
    phoneNumber ? formatPhoneNumber(phoneNumber) : "",
  );
  const [localCode, setLocalCode] = useState(verificationCode);
  const [submitted, setSubmitted] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  useEffect(() => {
    if (!submateEmail || !nickname) {
      toast.error("계정 정보를 먼저 설정해 주세요.");
      navigate("/setup/profile", { replace: true });
    }
  }, [navigate, nickname, submateEmail]);

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

  const phoneNumberDigits = useMemo(() => {
    return toPhoneNumberDigits(localPhone.trim());
  }, [localPhone]);

  const timeText = useMemo(() => {
    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const handlePhoneChange = (value: string) => {
    setLocalPhone(formatPhoneNumber(value));
    setLocalCode("");
    setIsCodeSent(false);
    setIsVerified(false);
    setPhoneVerified(false);
    setSecondsLeft(RESEND_SECONDS);
  };

  const handleSendCode = async () => {
    setSubmitted(true);

    if (phoneError || !localPhone.trim() || isSendingCode) return;

    try {
      setIsSendingCode(true);

      await api.post("/api/v1/user/phone/verify/request", {
        phoneNumber: phoneNumberDigits,
      });

      setIsCodeSent(true);
      setIsVerified(false);
      setSecondsLeft(RESEND_SECONDS);
      setLocalCode("");
      setPhoneVerified(false);

      toast.success("인증번호를 발송했습니다.");
    } catch (error) {
      console.error(error);
      setIsCodeSent(false);
      setIsVerified(false);
      setPhoneVerified(false);
      toast.error("인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setSubmitted(true);

    if (!isCodeSent) {
      toast.error("먼저 인증번호를 요청해 주세요.");
      return;
    }

    if (secondsLeft <= 0) {
      toast.error("인증번호 유효시간이 만료되었습니다. 다시 요청해 주세요.");
      return;
    }

    if (codeError || !localCode.trim() || isVerifyingCode) return;

    try {
      setIsVerifyingCode(true);

      await api.post("/api/v1/user/phone/verify/confirm", {
        phoneNumber: phoneNumberDigits,
        code: localCode.trim(),
      });

      setIsVerified(true);
      setPhoneVerified(true);

      toast.success("휴대폰 인증이 완료되었습니다.");
    } catch (error) {
      console.error(error);
      setIsVerified(false);
      setPhoneVerified(false);
      toast.error("인증번호가 올바르지 않거나 만료되었습니다.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleNext = () => {
    setSubmitted(true);

    if (phoneError) return;

    if (!isCodeSent) {
      toast.error("휴대폰 인증번호를 요청해 주세요.");
      return;
    }

    if (!isVerified) {
      toast.error("휴대폰 인증을 완료해 주세요.");
      return;
    }

    setPhone({
      phoneNumber: phoneNumberDigits,
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
      description={
        <>본인 확인에 사용할 휴대폰 번호를 인증해 주세요.</>
      }
      rightContent={
        <div className="space-y-5">
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
                  : isCodeSent
                    ? "border-teal-300"
                    : "border-slate-200 focus-within:border-brand-main",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                  isCodeSent
                    ? "bg-teal-50 text-teal-500"
                    : "bg-brand-main/10 text-brand-main",
                ].join(" ")}
              >
                <Icon
                  icon={
                    isCodeSent
                      ? "solar:check-circle-bold"
                      : "solar:smartphone-bold-duotone"
                  }
                  width="20"
                  height="20"
                />
              </div>

              <input
                value={localPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="010-0000-0000"
                inputMode="numeric"
                disabled={isVerified}
                className="h-12 min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:text-slate-500"
              />

              <button
                type="button"
                onClick={handleSendCode}
                disabled={
                  !!phoneError ||
                  !localPhone.trim() ||
                  isSendingCode ||
                  isVerified
                }
                className="shrink-0 whitespace-nowrap rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSendingCode ? "발송 중" : isCodeSent ? "재전송" : "인증 요청"}
              </button>
            </div>

            {phoneError ? (
              <p className="text-sm font-medium text-rose-500">{phoneError}</p>
            ) : isCodeSent ? (
              <p className="text-sm font-medium text-teal-600">
                인증번호를 보냈습니다.
              </p>
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
                  : isVerified
                    ? "border-teal-300"
                    : "border-slate-200 focus-within:border-brand-main",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                  isVerified
                    ? "bg-teal-50 text-teal-500"
                    : "bg-brand-main/10 text-brand-main",
                ].join(" ")}
              >
                <Icon
                  icon={
                    isVerified
                      ? "solar:check-circle-bold"
                      : "solar:shield-keyhole-bold-duotone"
                  }
                  width="20"
                  height="20"
                />
              </div>

              <input
                value={localCode}
                onChange={(e) => {
                  setLocalCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setIsVerified(false);
                  setPhoneVerified(false);
                }}
                placeholder="6자리 인증번호"
                inputMode="numeric"
                disabled={!isCodeSent || isVerified}
                className="h-12 min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:text-slate-500"
              />

              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={
                  !isCodeSent ||
                  !!codeError ||
                  !localCode.trim() ||
                  isVerified ||
                  isVerifyingCode ||
                  secondsLeft <= 0
                }
                className="shrink-0 whitespace-nowrap rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifyingCode ? "확인 중" : isVerified ? "완료" : "확인"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              {codeError ? (
                <p className="text-sm font-medium text-rose-500">{codeError}</p>
              ) : isCodeSent ? (
                <p
                  className={[
                    "text-sm",
                    isVerified
                      ? "font-medium text-teal-600"
                      : secondsLeft <= 0 && isCodeSent
                        ? "font-medium text-rose-500"
                        : "text-slate-500",
                  ].join(" ")}
                >
                  {isVerified
                    ? "인증이 완료되었습니다."
                    : secondsLeft > 0
                      ? `남은 시간 ${timeText}`
                      : "인증 시간이 만료되었습니다."}
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  인증번호 요청 후 입력할 수 있습니다.
                </p>
              )}

              {isVerified ? (
                <span className="shrink-0 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-600">
                  인증 완료
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-sm leading-6 text-slate-600">
              인증된 번호는 본인 확인과 결제, 정산 안내에 사용됩니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSendingCode || isVerifyingCode}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-main px-5 py-4 text-base font-semibold text-white transition hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            다음으로
          </button>
        </div>
      }
    />
  );
}
