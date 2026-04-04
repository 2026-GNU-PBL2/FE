import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import { useAuthStore } from "@/stores/authStore";

type UpdateUserRequest = {
  phoneNumber: string;
  submateEmail: string;
  nickname: string;
  pinNumber: string;
};

type UpdateUserResponse = {
  id: number;
  nickname: string;
  submateEmail: string;
  phoneNumber: string;
  status: string;
};

const SUBMATE_EMAIL_DOMAIN = "@submate.cloud";

function extractEmailId(value: string | null | undefined) {
  const normalizedValue = (value ?? "").trim().replace(/\s/g, "");

  if (!normalizedValue) {
    return "";
  }

  const lowerCasedValue = normalizedValue.toLowerCase();
  const lowerCasedDomain = SUBMATE_EMAIL_DOMAIN.toLowerCase();

  if (lowerCasedValue.endsWith(lowerCasedDomain)) {
    return normalizedValue.slice(
      0,
      normalizedValue.length - SUBMATE_EMAIL_DOMAIN.length,
    );
  }

  if (normalizedValue.includes("@")) {
    return normalizedValue.split("@")[0];
  }

  return normalizedValue;
}

function buildDisplayEmail(value: string | null | undefined) {
  const emailId = extractEmailId(value);

  if (!emailId) {
    return "이메일 미등록";
  }

  return `${emailId}${SUBMATE_EMAIL_DOMAIN}`;
}

export default function ProfileManagePage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [nickname, setNickname] = useState("");
  const [submateEmailId, setSubmateEmailId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pinNumber, setPinNumber] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawSubmitting, setIsWithdrawSubmitting] = useState(false);
  const [savedProfile, setSavedProfile] = useState<UpdateUserResponse | null>(
    null,
  );

  useEffect(() => {
    if (!user) return;

    setNickname(user.nickname?.trim() ?? "");
    setSubmateEmailId(extractEmailId(user.submateEmail));
    setPhoneNumber(user.phoneNumber?.trim() ?? "");
    setPinNumber("");
  }, [user]);

  if (!user) {
    return null;
  }

  const baseNickname =
    savedProfile?.nickname?.trim() ?? user.nickname?.trim() ?? "";
  const baseEmailId = extractEmailId(
    savedProfile?.submateEmail ?? user.submateEmail,
  );
  const basePhoneNumber =
    savedProfile?.phoneNumber?.trim() ?? user.phoneNumber?.trim() ?? "";

  const displayNickname = nickname.trim() || baseNickname || "닉네임 미설정";
  const displayEmail = buildDisplayEmail(submateEmailId || baseEmailId);
  const displayPhone =
    phoneNumber.trim() || basePhoneNumber || "전화번호 미등록";

  const maskedPin =
    pinNumber.trim().length > 0 ? "•".repeat(pinNumber.trim().length) : "••••";

  const isFormChanged =
    nickname.trim() !== baseNickname ||
    submateEmailId.trim() !== baseEmailId ||
    phoneNumber.trim() !== basePhoneNumber ||
    pinNumber.trim().length > 0;

  const handleCancelEdit = () => {
    setNickname(baseNickname);
    setSubmateEmailId(baseEmailId);
    setPhoneNumber(basePhoneNumber);
    setPinNumber("");
    setIsEditMode(false);
  };

  const handlePhoneNumberChange = (value: string) => {
    const onlyNumber = value.replace(/\D/g, "").slice(0, 11);
    setPhoneNumber(onlyNumber);
  };

  const handleSubmateEmailChange = (value: string) => {
    const normalizedValue = value.replace(/\s/g, "");
    const extractedEmailId = extractEmailId(normalizedValue);
    const safeEmailId = extractedEmailId.replace(/[^a-zA-Z0-9._-]/g, "");
    setSubmateEmailId(safeEmailId);
  };

  const handlePinNumberChange = (value: string) => {
    const onlyNumber = value.replace(/\D/g, "").slice(0, 4);
    setPinNumber(onlyNumber);
  };

  const validateForm = () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 입력해 주세요.");
      return false;
    }

    if (!submateEmailId.trim()) {
      toast.error("Submate 이메일 아이디를 입력해 주세요.");
      return false;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(submateEmailId.trim())) {
      toast.error(
        "이메일 아이디는 영문, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다.",
      );
      return false;
    }

    if (!phoneNumber.trim()) {
      toast.error("전화번호를 입력해 주세요.");
      return false;
    }

    if (!/^010\d{8}$/.test(phoneNumber.trim())) {
      toast.error("전화번호는 010으로 시작하는 11자리 숫자로 입력해 주세요.");
      return false;
    }

    if (pinNumber.trim().length > 0 && !/^\d{4}$/.test(pinNumber.trim())) {
      toast.error("PIN 번호는 4자리 숫자로 입력해 주세요.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const requestBody: UpdateUserRequest = {
        nickname: nickname.trim(),
        submateEmail: submateEmailId.trim(),
        phoneNumber: phoneNumber.trim(),
        pinNumber: pinNumber.trim(),
      };

      const response = await api.patch<UpdateUserResponse>(
        "/api/v1/user",
        requestBody,
      );

      setSavedProfile(response.data);
      setNickname(response.data.nickname?.trim() ?? "");
      setSubmateEmailId(extractEmailId(response.data.submateEmail));
      setPhoneNumber(response.data.phoneNumber?.trim() ?? "");
      setPinNumber("");
      setIsEditMode(false);

      toast.success("회원 정보가 수정되었습니다.");
    } catch (error) {
      toast.error("회원 정보 수정에 실패했습니다. 다시 시도해 주세요.");
      console.error("[ProfileManagePage] 회원 정보 수정 실패", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWithdrawModal = () => {
    if (isSubmitting || isWithdrawSubmitting) return;
    setIsWithdrawModalOpen(true);
  };

  const handleCloseWithdrawModal = () => {
    if (isWithdrawSubmitting) return;
    setIsWithdrawModalOpen(false);
  };

  const handleWithdraw = async () => {
    if (isWithdrawSubmitting) return;

    setIsWithdrawSubmitting(true);

    try {
      const response = await api.delete("/api/v1/user");

      console.log("[ProfileManagePage] 회원 탈퇴 성공", {
        status: response.status,
        statusText: response.statusText,
      });

      clearAuth();
      setIsWithdrawModalOpen(false);

      toast.success("회원탈퇴가 완료되었습니다.");

      navigate("/", { replace: true });
    } catch (error) {
      toast.error("회원 탈퇴에 실패했습니다. 다시 시도해 주세요.");
      console.error("[ProfileManagePage] 회원 탈퇴 실패", error);
    } finally {
      setIsWithdrawSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-base font-semibold text-slate-900">
                회원 정보 관리
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                지금 보이는 정보 영역에서 바로 수정할 수 있습니다.
              </p>
            </div>

            {!isEditMode ? (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[18px] bg-[#1E3A8A] px-5 text-sm font-semibold text-white transition hover:bg-[#1E40AF]"
              >
                <Icon icon="solar:pen-new-square-bold" className="h-5 w-5" />
                정보 수정
              </button>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex h-11 items-center justify-center rounded-[18px] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !isFormChanged}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[#1E3A8A] px-5 text-sm font-semibold text-white transition hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Icon icon="solar:diskette-bold" className="h-5 w-5" />
                  {isSubmitting ? "저장 중..." : "저장하기"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4">
            <EditableInfoCard
              label="닉네임"
              icon="solar:user-bold"
              isEditMode={isEditMode}
              displayValue={displayNickname}
              editSlot={
                <input
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="닉네임을 입력해 주세요"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#38BDF8] focus:ring-4 focus:ring-sky-100"
                />
              }
            />

            <EditableInfoCard
              label="Submate 이메일"
              icon="solar:letter-bold"
              isEditMode={isEditMode}
              displayValue={displayEmail}
              editSlot={
                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-[#38BDF8] focus-within:ring-4 focus-within:ring-sky-100">
                  <input
                    type="text"
                    value={submateEmailId}
                    onChange={(event) =>
                      handleSubmateEmailChange(event.target.value)
                    }
                    placeholder="이메일 아이디 입력"
                    className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-slate-900 outline-none"
                  />
                  <div className="flex h-12 shrink-0 items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500">
                    {SUBMATE_EMAIL_DOMAIN}
                  </div>
                </div>
              }
            />

            <EditableInfoCard
              label="전화번호"
              icon="solar:phone-bold"
              isEditMode={isEditMode}
              displayValue={displayPhone}
              editSlot={
                <input
                  type="text"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(event) =>
                    handlePhoneNumberChange(event.target.value)
                  }
                  placeholder="01012345678"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#38BDF8] focus:ring-4 focus:ring-sky-100"
                />
              }
            />

            <EditableInfoCard
              label="PIN 번호"
              icon="solar:lock-password-bold"
              isEditMode={isEditMode}
              displayValue={maskedPin}
              editSlot={
                <input
                  type="password"
                  inputMode="numeric"
                  value={pinNumber}
                  onChange={(event) =>
                    handlePinNumberChange(event.target.value)
                  }
                  placeholder="변경 시 4자리 숫자 입력"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#38BDF8] focus:ring-4 focus:ring-sky-100"
                />
              }
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-rose-200 bg-linear-to-br from-rose-50 via-white to-orange-50 shadow-sm">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100">
                  <Icon
                    icon="solar:trash-bin-trash-bold"
                    className="h-6 w-6 text-rose-600"
                  />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    회원탈퇴
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    탈퇴 후에는 계정을 복구하기 어려울 수 있으니 신중하게 진행해
                    주세요.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenWithdrawModal}
              disabled={isWithdrawSubmitting}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[18px] border border-rose-200 bg-white px-5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon icon="solar:shield-warning-bold" className="h-5 w-5" />
              회원탈퇴하기
            </button>
          </div>
        </div>
      </form>

      {isWithdrawModalOpen && (
        <WithdrawConfirmModal
          isSubmitting={isWithdrawSubmitting}
          onClose={handleCloseWithdrawModal}
          onConfirm={handleWithdraw}
        />
      )}
    </>
  );
}

function EditableInfoCard({
  label,
  displayValue,
  icon,
  isEditMode,
  editSlot,
}: {
  label: string;
  displayValue: string;
  icon: string;
  isEditMode: boolean;
  editSlot: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon icon={icon} className="h-5 w-5 text-slate-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          {!isEditMode ? (
            <p className="mt-2 break-all text-[15px] font-semibold text-slate-900">
              {displayValue}
            </p>
          ) : (
            <div className="mt-3">{editSlot}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function WithdrawConfirmModal({
  isSubmitting,
  onClose,
  onConfirm,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 pb-5 pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100">
              <Icon
                icon="solar:danger-triangle-bold"
                className="h-7 w-7 text-rose-600"
              />
            </div>

            <div className="min-w-0">
              <p className="text-lg font-semibold text-slate-900">
                회원탈퇴를 진행할까요?
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                탈퇴를 진행하면 계정 정보가 삭제될 수 있으며, 되돌리기 어려울 수
                있습니다.
                <br />
                정말로 회원탈퇴를 진행하시겠습니까?
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4">
          <div className="rounded-2xl border border-rose-100 bg-white px-4 py-3">
            <div className="flex items-start gap-3">
              <Icon
                icon="solar:info-circle-bold"
                className="mt-0.5 h-5 w-5 shrink-0 text-rose-500"
              />
              <div className="text-sm leading-6 text-slate-600">
                탈퇴 후에는 계정을 복구하기 어려우며, 서비스 이용 정보가 더 이상
                유지되지 않을 수 있습니다.
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
            >
              <Icon icon="solar:trash-bin-trash-bold" className="h-5 w-5" />
              {isSubmitting ? "탈퇴 처리 중..." : "회원탈퇴 진행"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
