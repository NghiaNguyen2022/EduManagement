const rawBaseUrl = import.meta.env.BASE_URL || "/";

export const appBaseUrl = rawBaseUrl.endsWith("/")
  ? rawBaseUrl
  : `${rawBaseUrl}/`;

export const routerBasename =
  appBaseUrl === "/" ? "/" : appBaseUrl.slice(0, -1);

function isAbsoluteOrSpecialUrl(value: string) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value);
}

export function appUrl(value: string) {
  if (!value || isAbsoluteOrSpecialUrl(value)) {
    return value;
  }

  return `${appBaseUrl}${value.replace(/^\/+/, "")}`;
}

export function fetchApp(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  return fetch(
    typeof input === "string" ? appUrl(input) : input,
    init,
  );
}

export function openAppWindow(
  url: string,
  target?: string,
  features?: string,
) {
  return window.open(appUrl(url), target, features);
}
