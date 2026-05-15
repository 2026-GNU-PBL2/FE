import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SetupShell from "./SetupShell";
import { useSetupStore } from "@/stores/setupStore";

type PinMode = "create" | "confirm";

type KeypadItem =
  | { type: "digit"; value: string; id: string }
  | { type: "empty"; id: string }
  | { type: "delete"; id: string };

const PIN_LENGTH = 4;

export default function SetupSecurityPage() {
  const navigate = useNavigate();
  const { submateEmail, nickname, phoneNumber, isPhoneVerified, setSecurity } =
    useSetupStore();

  const [mode, setMode] = useState<PinMode>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [pressedKeyIds, setPressedKeyIds] = useState<string[]>([]);
  const [visibleDigitIndex, setVisibleDigitIndex] = useState<number | null>(
    null,
  );
  const [visibleDigitValue, setVisibleDigitValue] = useState<string | null>(
    null,
  );

  const revealTimerRef = useRef<number | null>(null);
  const stageTimerRef = useRef<number | null>(null);
  const pressEffectTimerRef = useRef<number | null>(null);

  const keypad = useMemo(() => {
    return createRandomKeypad();
  }, []);

  useEffect(() => {
    if (!submateEmail || !nickname) {
      toast.error("계정 정보를 먼저 설정해 주세요.");
      navigate("/setup/profile", { replace: true });
      return;
    }

    if (!phoneNumber || !isPhoneVerified) {
      toast.error("휴대폰 인증을 먼저 완료해 주세요.");
      navigate("/setup/phone", { replace: true });
    }
  }, [isPhoneVerified, navigate, nickname, phoneNumber, submateEmail]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }

      if (stageTimerRef.current) {
        window.clearTimeout(stageTimerRef.current);
      }

      if (pressEffectTimerRef.current) {
        window.clearTimeout(pressEffectTimerRef.current);
      }
    };
  }, []);

  const activePin = mode === "create" ? pin : confirmPin;

  const handleDigitPress = (digit: string, keyId: string) => {
    if (activePin.length >= PIN_LENGTH) return;

    setErrorMessage("");

    const decoyKeyId = getRandomDecoyKeyId(keypad, keyId);
    setPressedKeyIds(decoyKeyId ? [keyId, decoyKeyId] : [keyId]);

    const nextValue = activePin + digit;
    const nextIndex = activePin.length;

    setVisibleDigitIndex(nextIndex);
    setVisibleDigitValue(digit);

    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
    }

    revealTimerRef.current = window.setTimeout(() => {
      setVisibleDigitIndex(null);
      setVisibleDigitValue(null);
    }, 220);

    if (mode === "create") {
      setPin(nextValue);
    } else {
      setConfirmPin(nextValue);
    }

    if (pressEffectTimerRef.current) {
      window.clearTimeout(pressEffectTimerRef.current);
    }

    pressEffectTimerRef.current = window.setTimeout(() => {
      setPressedKeyIds([]);
    }, 120);

    if (nextValue.length === PIN_LENGTH) {
      if (stageTimerRef.current) {
        window.clearTimeout(stageTimerRef.current);
      }

      stageTimerRef.current = window.setTimeout(() => {
        if (mode === "create") {
          setFirstPin(nextValue);
          setPin(nextValue);
          setConfirmPin("");
          setMode("confirm");
          setVisibleDigitIndex(null);
          setVisibleDigitValue(null);
          setPressedKeyIds([]);
          return;
        }

        if (nextValue === firstPin) {
          setSecurity({
            pinNumber: firstPin,
            pinNumberConfirm: nextValue,
          });

          navigate("/setup/complete");
          return;
        }

        setShakeKey((prev) => prev + 1);
        setErrorMessage("입력한 번호가 일치하지 않습니다. 다시 설정해 주세요.");
        setMode("create");
        setPin("");
        setConfirmPin("");
        setFirstPin("");
        setVisibleDigitIndex(null);
        setVisibleDigitValue(null);
        setPressedKeyIds([]);

        if (navigator.vibrate) {
          navigator.vibrate(120);
        }
      }, 220);
    }
  };

  const handleDelete = () => {
    setErrorMessage("");
    setVisibleDigitIndex(null);
    setVisibleDigitValue(null);
    setPressedKeyIds([]);

    if (mode === "create") {
      setPin((prev) => prev.slice(0, -1));
      return;
    }

    setConfirmPin((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setErrorMessage("");
    setMode("create");
    setPin("");
    setConfirmPin("");
    setFirstPin("");
    setVisibleDigitIndex(null);
    setVisibleDigitValue(null);
    setPressedKeyIds([]);
    setShakeKey((prev) => prev + 1);
  };

  return (
    <SetupShell
      step={4}
      totalSteps={5}
      badge="보안 설정"
      title={
        <>
          {mode === "create" ? (
            <>
              간편 비밀번호를
              <br />
              <span className="text-brand-main">설정해 주세요</span>
            </>
          ) : (
            <>
              같은 번호를 한 번 더
              <br />
              <span className="text-brand-main">입력해 주세요</span>
            </>
          )}
        </>
      }
      description={
        <>
          {mode === "create"
            ? "숫자 4자리를 입력해 주세요."
            : "확인을 위해 동일한 숫자 4자리를 다시 입력해 주세요."}
        </>
      }
      rightCardClassName="relative mx-auto w-full max-w-[400px] rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.07)] sm:p-5"
      rightContent={
        <div className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-brand-main">
                  {mode === "create" ? "1단계" : "2단계"}
                </p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">
                  {mode === "create" ? "4자리 숫자 입력" : "비밀번호 다시 입력"}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {mode === "create"
                    ? "완료되면 확인 단계로 자동 이동합니다."
                    : "입력한 번호가 일치하면 마지막 확인 화면으로 이동합니다."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
              >
                <Icon
                  icon="solar:refresh-bold-duotone"
                  width="16"
                  height="16"
                />
                다시 입력
              </button>
            </div>

            <div>
              <PinDisplay
                value={activePin}
                visibleDigitIndex={visibleDigitIndex}
                visibleDigitValue={visibleDigitValue}
                shakeKey={shakeKey}
              />
            </div>

            {errorMessage ? (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-500">
                <Icon icon="solar:danger-circle-bold" width="18" height="18" />
                <p>{errorMessage}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl bg-slate-50 p-2">
            <div className="grid grid-cols-3 gap-1.5">
              {keypad.map((item) => {
                if (item.type === "empty") {
                  return (
                    <div
                      key={item.id}
                      className="h-12 rounded-2xl bg-transparent sm:h-[52px]"
                      aria-hidden="true"
                    />
                  );
                }

                if (item.type === "delete") {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={handleDelete}
                      className="inline-flex h-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] ring-1 ring-slate-100 transition hover:bg-slate-100 active:scale-95 sm:h-[52px]"
                    >
                      <Icon
                        icon="solar:backspace-bold-duotone"
                        width="20"
                        height="20"
                      />
                    </button>
                  );
                }

                const isPressed = pressedKeyIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDigitPress(item.value, item.id)}
                    className={[
                      "inline-flex h-12 items-center justify-center rounded-2xl text-lg font-extrabold transition active:scale-95 sm:h-[52px]",
                      isPressed
                        ? "bg-brand-main text-white shadow-[0_8px_20px_rgba(30,58,138,0.18)]"
                        : "bg-white text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.04)] ring-1 ring-slate-100 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    {item.value}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2.5 rounded-2xl bg-blue-50 px-3.5 py-3 text-blue-900">
            <Icon
              icon="solar:shield-keyhole-bold-duotone"
              width="20"
              height="20"
              className="mt-0.5 shrink-0"
            />
            <p className="text-xs leading-5">
              로그인과 주요 인증에 사용돼요. 생일이나 연속된 숫자는 피하는
              것이 좋습니다.
            </p>
          </div>
        </div>
      }
    />
  );
}

function PinDisplay({
  value,
  visibleDigitIndex,
  visibleDigitValue,
  shakeKey,
}: {
  value: string;
  visibleDigitIndex: number | null;
  visibleDigitValue: string | null;
  shakeKey: number;
}) {
  return (
    <div
      key={shakeKey}
      className={[
        "grid grid-cols-4 gap-1.5",
        shakeKey > 0 ? "animate-[pin-shake_0.32s_ease-in-out]" : "",
      ].join(" ")}
    >
      {Array.from({ length: PIN_LENGTH }).map((_, index) => {
        const filled = index < value.length;
        const showDigit =
          visibleDigitIndex === index && visibleDigitValue !== null;

        return (
          <div
            key={index}
            className={[
              "flex h-11 items-center justify-center rounded-2xl text-base font-bold transition sm:h-12",
              filled
                ? "bg-brand-main/10 text-brand-main ring-1 ring-brand-main/15"
                : "bg-slate-50 text-slate-300 ring-1 ring-slate-100",
            ].join(" ")}
          >
            {filled ? (
              showDigit ? (
                <span>{visibleDigitValue}</span>
              ) : (
                <span className="text-xl leading-none">●</span>
              )
            ) : (
              <span className="text-xl leading-none text-slate-300">○</span>
            )}
          </div>
        );
      })}

      <style>
        {`
          @keyframes pin-shake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}

function createRandomKeypad(): KeypadItem[] {
  const digits = shuffleArray([
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ]);

  return [
    { type: "digit", value: digits[0], id: "k0" },
    { type: "digit", value: digits[1], id: "k1" },
    { type: "digit", value: digits[2], id: "k2" },
    { type: "digit", value: digits[3], id: "k3" },
    { type: "digit", value: digits[4], id: "k4" },
    { type: "digit", value: digits[5], id: "k5" },
    { type: "digit", value: digits[6], id: "k6" },
    { type: "digit", value: digits[7], id: "k7" },
    { type: "digit", value: digits[8], id: "k8" },
    { type: "empty", id: "empty" },
    { type: "digit", value: digits[9], id: "k10" },
    { type: "delete", id: "delete" },
  ];
}

function getRandomDecoyKeyId(keypad: KeypadItem[], pressedKeyId: string) {
  const digitIds = keypad
    .filter((item): item is Extract<KeypadItem, { type: "digit" }> => {
      return item.type === "digit";
    })
    .map((item) => item.id)
    .filter((id) => id !== pressedKeyId);

  if (digitIds.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * digitIds.length);
  return digitIds[randomIndex];
}

function shuffleArray<T>(array: T[]) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}
