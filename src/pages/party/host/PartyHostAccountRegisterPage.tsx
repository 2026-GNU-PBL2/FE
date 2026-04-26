import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type SettlementAccountType = "SETTLEMENT" | "REFUND";

type BankAccountResponse = {
  id: number;
  fintechUseNum: string;
  bankName: string;
  accountAlias: string;
  accountNumMasked: string;
  accountType: string | null;
  isPrimary: boolean;
  verificationStatus: string;
};

type SaveSettlementAccountRequest = {
  fintechUseNum: string;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  accountHolderBirthDate: string;
  accountType: SettlementAccountType;
  isPrimary: boolean;
};

type SaveSettlementAccountResponse = {
  success?: boolean;
  message?: string;
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

function normalizeNumber(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function formatBirthDate(value: string) {
  const numbersOnly = normalizeNumber(value).slice(0, 8);

  if (numbersOnly.length <= 4) return numbersOnly;
  if (numbersOnly.length <= 6) {
    return `${numbersOnly.slice(0, 4)}/${numbersOnly.slice(4)}`;
  }

  return `${numbersOnly.slice(0, 4)}/${numbersOnly.slice(4, 6)}/${numbersOnly.slice(6)}`;
}

const bankOptions = [
  { label: "국민은행", code: "004" },
  { label: "신한은행", code: "088" },
  { label: "우리은행", code: "020" },
  { label: "하나은행", code: "081" },
  { label: "농협은행", code: "011" },
  { label: "기업은행", code: "003" },
  { label: "카카오뱅크", code: "090" },
  { label: "토스뱅크", code: "092" },
  { label: "케이뱅크", code: "089" },
  { label: "SC제일은행", code: "023" },
  { label: "부산은행", code: "032" },
  { label: "대구은행", code: "031" },
  { label: "광주은행", code: "034" },
  { label: "전북은행", code: "037" },
  { label: "경남은행", code: "039" },
  { label: "수협은행", code: "007" },
  { label: "우체국", code: "071" },
];

function getCreatePreviewPath(productId: string) {
  return `/party/create/${productId}/host/create-preview`;
}

function getAgreementPath(productId: string) {
  return `/party/create/${productId}/host/agreement`;
}

export default function PartyHostAccountRegisterPage() {
  const navigate = useNavigate();
  const { productId = "" } = useParams();
  const [searchParams] = useSearchParams();

  const bankAuthSuccess = searchParams.get("bankAuthSuccess");
  const bankAuthMessage = searchParams.get("message");

  const [isLoading, setIsLoading] = useState(false);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);

  const [fintechUseNum, setFintechUseNum] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountHolderBirthDate, setAccountHolderBirthDate] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const selectedBankName = useMemo(() => {
    return bankOptions.find((bank) => bank.code === bankCode)?.label ?? "";
  }, [bankCode]);

  const isFormValid = useMemo(() => {
    return (
      fintechUseNum.trim().length > 0 &&
      bankCode.trim().length > 0 &&
      accountHolderName.trim().length > 0 &&
      normalizeNumber(accountHolderBirthDate).length === 8 &&
      normalizeNumber(accountNumber).length >= 10
    );
  }, [
    accountHolderBirthDate,
    accountHolderName,
    accountNumber,
    bankCode,
    fintechUseNum,
  ]);

  useEffect(() => {
    if (!productId) {
      toast.error("상품 정보가 올바르지 않습니다.");
      navigate("/parties", { replace: true });
      return;
    }

    if (bankAuthSuccess === "false") {
      toast.error(bankAuthMessage || "본인인증 또는 계좌연결에 실패했습니다.");
      navigate(getAgreementPath(productId), { replace: true });
      return;
    }

    if (bankAuthSuccess !== "true") {
      toast.error("계좌 인증 결과를 확인할 수 없습니다.");
      navigate(getAgreementPath(productId), { replace: true });
    }
  }, [bankAuthMessage, bankAuthSuccess, navigate, productId]);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setIsAccountsLoading(true);

        const response = await api.get<
          BankAccountResponse[] | ApiEnvelope<BankAccountResponse[]>
        >("/api/v1/bank/accounts");

        const accounts = unwrapResponse<BankAccountResponse[]>(response.data);

        console.log("bank accounts response:", accounts);

        const firstAccount = accounts?.[7];

        if (!firstAccount?.fintechUseNum) {
          toast.error("연결된 계좌 정보를 찾을 수 없습니다.");
          return;
        }

        setFintechUseNum(firstAccount.fintechUseNum);
      } catch (error) {
        console.error("bank accounts error:", error);
        toast.error("연결 계좌 정보를 불러오지 못했습니다.");
      } finally {
        setIsAccountsLoading(false);
      }
    };

    fetchBankAccounts();
  }, []);

  const handleSubmit = async () => {
    if (!productId) {
      toast.error("상품 정보가 없습니다.");
      return;
    }

    if (!isFormValid) {
      toast.error("정산 계좌 정보를 정확히 입력해주세요.");
      return;
    }

    const requestBody: SaveSettlementAccountRequest = {
      fintechUseNum: fintechUseNum.trim(),
      bankCode,
      accountNumber: normalizeNumber(accountNumber),
      accountHolderName: accountHolderName.trim(),
      accountHolderBirthDate: normalizeNumber(accountHolderBirthDate),
      accountType: "SETTLEMENT",
      isPrimary: true,
    };

    try {
      setIsLoading(true);

      const response = await api.post<
        | SaveSettlementAccountResponse
        | ApiEnvelope<SaveSettlementAccountResponse>
      >("/api/v1/bank/settlement", requestBody);

      const payload = unwrapResponse<SaveSettlementAccountResponse>(
        response.data,
      );

      if (payload?.success === false) {
        toast.error(payload.message || "정산 계좌 등록에 실패했습니다.");
        return;
      }

      toast.success(payload?.message || "정산 계좌 등록이 완료되었습니다.");
      navigate(getCreatePreviewPath(productId));
    } catch (error) {
      console.error(error);
      toast.error("정산 계좌 등록 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (!productId) {
      navigate("/parties");
      return;
    }

    navigate(getAgreementPath(productId));
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-[32px] bg-white px-5 py-7 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.18)] sm:px-8 sm:py-9">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full bg-[#EEF4FF] px-3 py-1.5 text-[12px] font-semibold text-[#1E3A8A]">
              SETTLEMENT ACCOUNT
            </div>
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-500">
              HOST ACCOUNT
            </div>
          </div>

          <div className="mt-5">
            <h1 className="text-[30px] font-semibold tracking-tight text-slate-950 sm:text-[36px]">
              정산 계좌를 등록해 주세요
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-slate-500">
              본인인증과 계좌연결이 완료되었습니다.
              <br className="hidden sm:block" />
              파티 운영 수익을 정산받을 계좌 정보를 입력해 주세요.
            </p>
          </div>

          <div className="mt-7 rounded-[28px] bg-slate-50 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1E3A8A] shadow-[0_10px_30px_-20px_rgba(30,58,138,0.45)]">
                <Icon icon="solar:wallet-money-bold" className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold tracking-tight text-slate-950">
                  정산계좌 메타데이터를 저장합니다
                </p>
                <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                  연결된 계좌의 fintech use num을 기준으로 정산계좌 정보를
                  저장하고, 실명검증 상태를 반영합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.14)] sm:px-6 sm:py-6">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-500">
                ACCOUNT FORM
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-slate-900">
                  핀테크 이용번호
                </label>
                <input
                  type="text"
                  value={
                    isAccountsLoading
                      ? "연결 계좌 정보를 불러오는 중입니다..."
                      : fintechUseNum
                  }
                  readOnly
                  placeholder="오픈뱅킹 fintechUseNum"
                  className="h-14 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-500 outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-slate-900">
                  은행명
                </label>

                <select
                  value={bankCode}
                  onChange={(event) => setBankCode(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-[#1E3A8A]"
                >
                  <option value="">은행을 선택해주세요</option>
                  {bankOptions.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.label} ({bank.code})
                    </option>
                  ))}
                </select>

                {selectedBankName ? (
                  <p className="mt-2 text-[13px] text-slate-400">
                    선택된 은행: {selectedBankName}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-slate-900">
                  예금주명
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(event) => setAccountHolderName(event.target.value)}
                  placeholder="예금주명을 입력해주세요"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-slate-900">
                  생년월일
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={accountHolderBirthDate}
                  onChange={(event) =>
                    setAccountHolderBirthDate(
                      formatBirthDate(event.target.value),
                    )
                  }
                  placeholder="YYYY/MM/DD"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-slate-900">
                  계좌번호
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(normalizeNumber(event.target.value))
                  }
                  placeholder="숫자만 입력해주세요"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E3A8A]"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] bg-[#F8FAFC] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500">
                <Icon icon="solar:info-circle-linear" className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[15px] font-semibold text-slate-900">안내</p>
                <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                  등록된 계좌는 파티원 결제 금액 정산을 위한 지급 계좌로
                  사용됩니다. 실제 지급 시점과 수수료 정책은 서비스 정책을
                  따릅니다.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.14)] sm:px-6 sm:py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-slate-400">
                  등록 준비 상태
                </p>
                <p className="mt-1 text-[17px] font-semibold tracking-tight text-slate-950">
                  {isFormValid ? "저장 가능" : "입력 확인 필요"}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  이전으로
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid || isLoading || isAccountsLoading}
                  className={[
                    "inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-6 text-[15px] font-semibold transition sm:min-w-[220px]",
                    !isFormValid || isLoading || isAccountsLoading
                      ? "cursor-not-allowed bg-slate-200 text-slate-400"
                      : "bg-[#1E3A8A] text-white shadow-[0_20px_46px_-24px_rgba(30,58,138,0.42)] hover:bg-[#1D4ED8]",
                  ].join(" ")}
                >
                  {isLoading ? "정산 계좌 등록 중..." : "정산 계좌 저장하기"}
                  <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
