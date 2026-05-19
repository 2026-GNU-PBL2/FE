export type VacancyRouteType = "hosts" | "members";

const vacancyRedirectPrefix = "submate:vacancy-redirect:";

export function isSafeRedirectPath(value?: string | null) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export function getRedirectFromSearchParams(searchParams: URLSearchParams) {
  const redirect = searchParams.get("redirect");
  return isSafeRedirectPath(redirect) ? redirect : "";
}

export function withRedirect(path: string, redirectPath?: string | null) {
  if (!isSafeRedirectPath(redirectPath)) return path;

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}redirect=${encodeURIComponent(redirectPath ?? "")}`;
}

export function getVacancyConfirmPath(
  type: VacancyRouteType,
  partyId: string | number,
) {
  return `/parties/${type}/${partyId}/confirm`;
}

export function saveVacancyRedirect(productId: string, redirectPath: string) {
  if (!productId || !isSafeRedirectPath(redirectPath)) return;
  sessionStorage.setItem(`${vacancyRedirectPrefix}${productId}`, redirectPath);
}

export function getSavedVacancyRedirect(productId: string) {
  if (!productId) return "";

  const redirectPath = sessionStorage.getItem(
    `${vacancyRedirectPrefix}${productId}`,
  );

  return isSafeRedirectPath(redirectPath) ? redirectPath : "";
}

export function clearSavedVacancyRedirect(productId: string) {
  if (!productId) return;
  sessionStorage.removeItem(`${vacancyRedirectPrefix}${productId}`);
}
