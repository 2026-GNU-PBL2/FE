export function validateSubmateEmail(value: string) {
  return /^[a-zA-Z0-9._-]{4,20}$/.test(value);
}

export function validateNickname(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 12;
}

export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length < 4) {
    return digits;
  }

  if (digits.length < 8) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export function toPhoneNumberDigits(value: string) {
  return value.replace(/\D/g, "");
}
