type TossPaymentsInstance = {
  payment: (params: { customerKey: string }) => {
    requestBillingAuth: (params: {
      method: "CARD";
      successUrl: string;
      failUrl: string;
      customerEmail?: string;
      customerName?: string;
    }) => Promise<void>;
  };
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

let tossPaymentsScriptPromise: Promise<void> | null = null;

export function loadTossPaymentsScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저 환경에서만 사용할 수 있습니다."));
  }

  if (typeof window.TossPayments === "function") {
    return Promise.resolve();
  }

  if (tossPaymentsScriptPromise) {
    return tossPaymentsScriptPromise;
  }

  tossPaymentsScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.tosspayments.com/v2/standard"]',
    );

    if (existingScript) {
      if (typeof window.TossPayments === "function") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("토스페이먼츠 SDK 로드에 실패했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v2/standard";
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("토스페이먼츠 SDK 로드에 실패했습니다."));

    document.head.appendChild(script);
  });

  return tossPaymentsScriptPromise;
}
