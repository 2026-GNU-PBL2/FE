import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { bankOptions } from "@/constants/banks";
import {
  clearSavedVacancyRedirect,
  getRedirectFromSearchParams,
  getSavedVacancyRedirect,
  withRedirect,
} from "@/pages/party/vacancy/vacancyFlow";

type SettlementAccountType = "SETTLEMENT" | "REFUND";

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
  const redirectPath =
    getRedirectFromSearchParams(searchParams) ||
    getSavedVacancyRedirect(productId);

  const [isLoading, setIsLoading] = useState(false);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);

  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
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
    if (!productId) {
      toast.error("상품 정보가 올바르지 않습니다.");
      navigate("/parties", { replace: true });
      return;
    }

    if (bankAuthSuccess === "false") {
      toast.error(bankAuthMessage || "본인인증 또는 계좌연결에 실패했습니다.");
      navigate(withRedirect(getAgreementPath(productId), redirectPath), {
        replace: true,
      });
      return;
    }

    if (bankAuthSuccess !== "true") {
      toast.error("계좌 인증 결과를 확인할 수 없습니다.");
      navigate(withRedirect(getAgreementPath(productId), redirectPath), {
        replace: true,
      });
    }
  }, [bankAuthMessage, bankAuthSuccess, navigate, productId, redirectPath]);

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

        if (!firstSelectableAccount?.fintechUseNum) {
          toast.error("연결된 계좌 정보를 찾을 수 없습니다.");
          return;
        }

        setSelectedAccountId(String(firstSelectableAccount.id));
        setBankCode(firstSelectableAccount.bankCode ?? "");
        setAccountHolderName(firstSelectableAccount.accountHolderName ?? "");
        setAccountHolderBirthDate(
          formatBirthDate(firstSelectableAccount.accountHolderBirthDate ?? ""),
        );
        setAccountNumber(
          normalizeNumber(firstSelectableAccount.accountNumber ?? ""),
        );
      } catch (error) {
        console.error("bank accounts error:", error);
        toast.error("계좌 정보를 불러오지 못했습니다.");
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
      fintechUseNum: selectedAccount?.fintechUseNum?.trim() ?? "",
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
      if (redirectPath) {
        clearSavedVacancyRedirect(productId);
      }
      navigate(redirectPath || getCreatePreviewPath(productId));
    } catch (error) {
      console.error(error);
      toast.error("정산 계좌 등록 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-linear-to-br from-blue-50 via-white to-sky-50 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-brand-main shadow-sm ring-1 ring-blue-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                  정산 계좌 등록
                </div>

                <h1 className="mt-5 text-[30px] font-extrabold tracking-tight text-slate-950 sm:text-[38px]">
                  정산받을 계좌를 확인해 주세요
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-500">
                  본인인증과 계좌 연결이 완료되었습니다. 파티 운영 수익을
                  정산받을 계좌 정보만 확인하면 됩니다.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-main px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-900/20">
                <Icon icon="solar:wallet-money-bold" className="h-4 w-4" />
                안전한 정산 등록
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-10 lg:py-10">
            <div className="min-w-0">
              <div className="rounded-[28px] bg-slate-50 px-5 py-5 ring-1 ring-slate-100 sm:px-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-main shadow-sm">
                    <Icon icon="solar:shield-check-bold" className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-extrabold tracking-tight text-slate-950">
                      인증된 계좌 정보를 불러왔어요
                    </p>
                    <p className="mt-2 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                      은행명, 예금주명, 생년월일, 계좌번호를 확인한 뒤 정산
                      계좌로 등록해 주세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[32px] bg-white px-5 py-5 shadow-xl shadow-slate-900/6 ring-1 ring-slate-100 sm:px-6 sm:py-6">
                <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-brand-main">
                  계좌 정보
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-[14px] font-bold text-slate-950">
                      은행명
                    </label>

                    <select
                      value={bankCode}
                      onChange={(event) => setBankCode(event.target.value)}
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[15px] font-semibold text-slate-950 outline-none transition focus:border-brand-main focus:bg-white"
                    >
                      <option value="">은행을 선택해주세요</option>
                      {bankOptions.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.label}
                        </option>
                      ))}
                    </select>

                    {selectedBankName ? (
                      <p className="mt-2 text-[13px] font-medium text-slate-400">
                        선택된 은행: {selectedBankName}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-bold text-slate-950">
                      예금주명
                    </label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(event) =>
                        setAccountHolderName(event.target.value)
                      }
                      placeholder="예금주명을 입력해주세요"
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[15px] font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-main focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-bold text-slate-950">
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
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[15px] font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-main focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-[14px] font-bold text-slate-950">
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
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[15px] font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-main focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-900/6 ring-1 ring-slate-100 lg:sticky lg:top-8">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
                등록 상태
              </h2>

              <div className="mt-5 rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-500">
                  등록 준비 상태
                </p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                  {isFormValid ? "저장 가능" : "입력 확인 필요"}
                </p>
              </div>

              <div className="mt-5 rounded-[24px] bg-blue-50/60 p-5 ring-1 ring-blue-100/70">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-main shadow-sm">
                  <Icon icon="solar:info-circle-linear" className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[15px] font-extrabold text-slate-950">
                  안내
                </p>
                <p className="mt-2 text-[14px] leading-6 text-slate-600">
                  등록된 계좌는 파티원 결제 금액 정산을 위한 지급 계좌로
                  사용됩니다.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading || isAccountsLoading}
                className={[
                  "mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition",
                  !isFormValid || isLoading || isAccountsLoading
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-brand-main text-white shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 hover:bg-blue-800",
                ].join(" ")}
              >
                {isLoading ? "정산 계좌 등록 중..." : "정산 계좌 저장하기"}
                <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
              </button>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
