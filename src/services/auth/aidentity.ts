const PORTAL_URL = import.meta.env.VITE_AUTH_PORTAL_URL || "";
const AUTH_HOST_SUFFIX = import.meta.env.VITE_AUTH_HOST_SUFFIX || "";

function isAuthHostname(hostname: string) {
  if (!AUTH_HOST_SUFFIX) return false;
  return hostname === AUTH_HOST_SUFFIX.replace(/^\./, "") || hostname.endsWith(AUTH_HOST_SUFFIX);
}

export function shouldRequireAIdentityAuth() {
  if (typeof window === "undefined") {
    return false;
  }

  return isAuthHostname(window.location.hostname);
}

export function buildPortalLoginUrl() {
  const portalUrl = new URL(PORTAL_URL);

  if (typeof window === "undefined") {
    return portalUrl.toString();
  }

  try {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.protocol === "https:" && isAuthHostname(currentUrl.hostname)) {
      portalUrl.searchParams.set("redirect", currentUrl.toString());
    }
  } catch {
    return portalUrl.toString();
  }

  return portalUrl.toString();
}
