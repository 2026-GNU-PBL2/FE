import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { getApiErrorMessage } from "@/utils/api-error";

type SettlementAccountType = "SETTLEMENT";

type BankAccountResponse = {
  id: number;
  fintechUseNum: string | null;
  bankName: string | null;
  accountAlias: string | null;
  accountNumMasked: string | null;
  accountType: string | null;
  isPrimary: boolean;
  verificationStatus: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountHolderName?: string | null;
  accountHolderBirthDate?: string | null;
};

type SaveSettlementAccountRequest = {
  fintechUseNum: string;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  accountHolderBirthDate: string;
  accountType: SettlementAccountType;
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

function getAccountLabel(account: BankAccountResponse) {
  const bankName = account.bankName || "은행 정보 없음";
  const masked = account.accountNumMasked || "계좌번호 미확인";
  const alias = account.accountAlias ? ` · ${account.accountAlias}` : "";

  return `${bankName} · ${masked}${alias}`;
}

export default function MyPageAccountRegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const bankAuthSuccess = searchParams.get("bankAuthSuccess");
  const bankAuthMessage = searchParams.get("message");

  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [bankCode, setBankCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountHolderBirthDate, setAccountHolderBirthDate] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const selectedAccount = useMemo(() => {
    return (
      accounts.find((account) => String(account.id) === selectedAccountId) ??
      null
    );
  }, [accounts, selectedAccountId]);

  const selectedBankName = useMemo(() => {
    return bankOptions.find((bank) => bank.code === bankCode)?.label ?? "";
  }, [bankCode]);

  const isFormValid = useMemo(() => {
    return (
      Boolean(selectedAccount?.fintechUseNum?.trim()) &&
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
    selectedAccount,
  ]);

  useEffect(() => {
    if (bankAuthSuccess === "false") {
      toast.error(bankAuthMessage || "본인인증 또는 계좌연결에 실패했습니다.");
      navigate("/mypage/money", { replace: true });
      return;
    }

    if (bankAuthSuccess && bankAuthSuccess !== "true") {
      toast.error("계좌 인증 결과를 확인할 수 없습니다.");
      navigate("/mypage/money", { replace: true });
      return;
    }

    if (bankAuthSuccess === "true") {
      const cleanUrl = window.location.pathname;
      window.history.replaceState(window.history.state, "", cleanUrl);
      if (bankAuthMessage) {
        toast.success(bankAuthMessage);
      }
    }
  }, [bankAuthMessage, bankAuthSuccess, navigate]);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setIsAccountsLoading(true);

        const response = await api.get<
          BankAccountResponse[] | ApiEnvelope<BankAccountResponse[]>
        >("/api/v1/bank/accounts");

        const payload = unwrapResponse<BankAccountResponse[]>(response.data);
        const nextAccounts = Array.isArray(payload)
          ? payload.filter((account) => Boolean(account.fintechUseNum?.trim()))
          : [];

        setAccounts(nextAccounts);

        const activeSettlementAccount = nextAccounts.find(
          (account) =>
            account.accountType === "SETTLEMENT" && account.isPrimary === true,
        );
        const firstSelectableAccount =
          activeSettlementAccount ?? nextAccounts[0] ?? null;

        if (firstSelectableAccount) {
          setSelectedAccountId(String(firstSelectableAccount.id));
          setBankCode(firstSelectableAccount.bankCode ?? "");
          setAccountHolderName(firstSelectableAccount.accountHolderName ?? "");
          setAccountHolderBirthDate(
            formatBirthDate(firstSelectableAccount.accountHolderBirthDate ?? ""),
          );
          setAccountNumber(
            normalizeNumber(firstSelectableAccount.accountNumber ?? ""),
          );
        }
      } catch (error) {
        console.error(error);
        toast.error("연결 계좌 정보를 불러오지 못했습니다.");
      } finally {
        setIsAccountsLoading(false);
      }
    };

    void fetchBankAccounts();
  }, []);

  const handleSelectedAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);

    const account = accounts.find((item) => String(item.id) === accountId);
    if (!account) return;

    setBankCode(account.bankCode ?? "");
    setAccountHolderName(account.accountHolderName ?? "");
    setAccountHolderBirthDate(
      formatBirthDate(account.accountHolderBirthDate ?? ""),
    );
    setAccountNumber(normalizeNumber(account.accountNumber ?? ""));
  };

  const handleSubmit = async () => {
    if (!selectedAccount?.fintechUseNum) {
      toast.error("선택된 연결 계좌 정보가 없습니다.");
      return;
    }

    if (!isFormValid) {
      toast.error("정산 계좌 정보를 정확히 입력해주세요.");
      return;
    }

    const requestBody: SaveSettlementAccountRequest = {
      fintechUseNum: selectedAccount.fintechUseNum.trim(),
      bankCode,
      accountNumber: normalizeNumber(accountNumber),
      accountHolderName: accountHolderName.trim(),
      accountHolderBirthDate: normalizeNumber(accountHolderBirthDate),
      accountType: "SETTLEMENT",
    };

    try {
      setIsSaving(true);

      const response = await api.post<
        | SaveSettlementAccountResponse
        | ApiEnvelope<SaveSettlementAccountResponse>
      >("/api/v1/bank/settlement", requestBody);

      const payload = unwrapResponse<SaveSettlementAccountResponse>(
        response.data,
      );

      if (payload?.success === false) {
        toast.error(payload.message || "정산 계좌 설정에 실패했습니다.");
        return;
      }

      toast.success(payload?.message || "정산 계좌 설정이 완료되었습니다.");
      navigate("/mypage/money", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "정산 계좌 설정에 실패했습니다."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-brand-bg px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <section className="mx-auto w-full max-w-3xl rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900">
            SETTLEMENT ACCOUNT
          </div>
          <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
            MY PAGE
          </div>
        </div>

        <div className="mt-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            정산 계좌를 설정해 주세요
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            인증된 연결 계좌 중 정산에 사용할 계좌를 선택하고 필요한 정보를
            입력합니다.
          </p>
        </div>

        <div className="mt-6 rounded-[22px] bg-slate-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-900 ring-1 ring-slate-200">
              <Icon icon="solar:banknote-bold" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">
                정산계좌 설정 안내
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                선택한 계좌는 파티 운영 수익을 지급받는 대표 정산계좌로
                사용됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900">
              연결 계좌
            </label>
            <select
              value={selectedAccountId}
              onChange={(event) =>
                handleSelectedAccountChange(event.target.value)
              }
              disabled={isAccountsLoading || accounts.length === 0}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-900 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {isAccountsLoading
                  ? "연결 계좌를 불러오는 중입니다"
                  : "연결 계좌를 선택해주세요"}
              </option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {getAccountLabel(account)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900">
              핀테크 이용번호
            </label>
            <input
              type="text"
              value={selectedAccount?.fintechUseNum ?? ""}
              readOnly
              placeholder="연결 계좌를 선택해주세요"
              className="h-14 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900">
              은행명
            </label>
            <select
              value={bankCode}
              onChange={(event) => setBankCode(event.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-900"
            >
              <option value="">은행을 선택해주세요</option>
              {bankOptions.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.label} ({bank.code})
                </option>
              ))}
            </select>
            {selectedBankName ? (
              <p className="mt-2 text-xs text-slate-400">
                선택된 은행: {selectedBankName}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900">
              예금주명
            </label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(event) => setAccountHolderName(event.target.value)}
              placeholder="예금주명을 입력해주세요"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900">
              생년월일
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={accountHolderBirthDate}
              onChange={(event) =>
                setAccountHolderBirthDate(formatBirthDate(event.target.value))
              }
              placeholder="YYYY/MM/DD"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900">
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
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-900"
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/mypage/money")}
            className="inline-flex h-13 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isSaving || isAccountsLoading}
            className={[
              "inline-flex h-13 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold transition sm:min-w-52",
              !isFormValid || isSaving || isAccountsLoading
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-blue-900 text-white shadow-[0_20px_46px_-24px_rgba(30,58,138,0.42)] hover:bg-blue-800",
            ].join(" ")}
          >
            {isSaving ? "저장 중..." : "정산 계좌 저장하기"}
            <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
