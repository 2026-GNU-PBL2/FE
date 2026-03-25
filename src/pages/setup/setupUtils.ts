export const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length < 4) {
    return numbers;
  }

  if (numbers.length < 8) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

export const validateUserId = (value: string) => {
  return /^[a-zA-Z0-9._-]{4,20}$/.test(value);
};

export const validateNickname = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 12;
};

export const validatePassword = (value: string) => {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/.test(value);
};

export const validatePhone = (value: string) => {
  return /^010-\d{4}-\d{4}$/.test(value);
};

export const validateVerificationCode = (value: string) => {
  return /^\d{6}$/.test(value);
};
