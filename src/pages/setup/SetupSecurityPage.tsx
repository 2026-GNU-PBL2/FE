import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
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
  const { setSecurity } = useSetupStore();

  const [mode, setMode] = useState<PinMode>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [pressedKeyId, setPressedKeyId] = useState<string | null>(null);
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
    void mode;
    void shakeKey;
    return createRandomKeypad();
  }, [mode, shakeKey]);

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
    setPressedKeyId(keyId);

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
      setPressedKeyId(null);
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
          return;
        }

        if (nextValue === firstPin) {
          setSecurity({
            password: firstPin,
            passwordConfirm: nextValue,
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
    setPressedKeyId(null);
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
      rightContent={
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {mode === "create" ? "1단계" : "2단계"}
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {mode === "create" ? "4자리 숫자 입력" : "비밀번호 다시 입력"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
              >
                <Icon
                  icon="solar:refresh-bold-duotone"
                  width="16"
                  height="16"
                />
                다시 입력
              </button>
            </div>

            <div className="mt-5">
              <PinDisplay
                value={activePin}
                visibleDigitIndex={visibleDigitIndex}
                visibleDigitValue={visibleDigitValue}
                shakeKey={shakeKey}
              />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-600">
                {mode === "create"
                  ? "입력 후 자동으로 확인 단계로 넘어갑니다."
                  : "입력 내용이 일치하면 가입이 완료됩니다."}
              </p>
            </div>

            {errorMessage ? (
              <p className="mt-4 text-sm font-semibold text-rose-500">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid grid-cols-3 gap-2.5">
              {keypad.map((item) => {
                if (item.type === "empty") {
                  return (
                    <div
                      key={item.id}
                      className="h-14 rounded-3xl bg-transparent"
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
                      className="inline-flex h-14 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 active:scale-95"
                    >
                      <Icon
                        icon="solar:backspace-bold-duotone"
                        width="22"
                        height="22"
                      />
                    </button>
                  );
                }

                const isPressed = pressedKeyId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDigitPress(item.value, item.id)}
                    className={[
                      "inline-flex h-14 items-center justify-center rounded-3xl border text-lg font-bold transition active:scale-95",
                      isPressed
                        ? "border-brand-main bg-brand-main text-white shadow-lg"
                        : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {item.value}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm leading-6 text-slate-600">
              간편 비밀번호는 로그인과 주요 인증에 사용됩니다.
              <br />
              생일, 연속된 숫자처럼 추측하기 쉬운 번호는 피하는 것이 좋습니다.
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
        "grid grid-cols-4 gap-2.5",
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
              "flex h-14 items-center justify-center rounded-3xl border text-lg font-bold transition",
              filled
                ? "border-brand-main bg-brand-main/5 text-brand-main"
                : "border-slate-200 bg-slate-50 text-slate-300",
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

function shuffleArray<T>(array: T[]) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}
