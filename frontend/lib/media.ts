/**
 * Canonical media/URL helpers.
 *
 * Backend stores RELATIVE paths only (e.g. "/uploads/announcements/ab.jpg").
 * The frontend must always expand them onto the API host, otherwise the
 * browser resolves them against the current page host (Vercel) and 404s.
 *
 * Never emit a relative URL, a vercel.app host, or a localhost host in
 * production.
 */

const PROD_ORIGIN = "https://madrasatulhabibielmustwafa-api.onrender.com";
const PROD_API = `${PROD_ORIGIN}/api`;
const LOCAL_API = "http://localhost:8000/api";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

function isLocalHostname(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname.toLowerCase());
}

/** Hostname of the page currently running, or "" during SSR/build. */
function currentHostname(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname || "";
}

/**
 * Read NEXT_PUBLIC_API_URL but ignore values that cannot identify the API
 * host: empty strings and same-origin proxies such as "/api". Those are
 * baked into the production bundle and would otherwise collapse to a
 * relative URL at runtime.
 */
function rawEnvApi(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!env) return "";
  if (!/^https?:\/\//i.test(env)) return "";
  return env.replace(/\/+$/, "");
}

/**
 * Base API URL including the `/api` prefix. Always absolute in production.
 */
export function apiUrl(): string {
  const env = rawEnvApi();
  if (env) return env;
  // On the server / during `next build` there is no window, so fall back to
  // NODE_ENV: a production build must never prerender localhost URLs.
  if (process.env.NODE_ENV === "development") return LOCAL_API;
  const host = currentHostname();
  if (host && isLocalHostname(host)) return LOCAL_API;
  return PROD_API;
}

/** API host with NO trailing `/api`. Used as the origin for `/uploads/...`. */
export function apiOrigin(): string {
  return apiUrl().replace(/\/api\/?$/, "");
}

function isBadMediaHost(hostname: string): boolean {
  return (
    isLocalHostname(hostname) ||
    hostname.endsWith(".vercel.app") ||
    hostname === "vercel.app"
  );
}

/** Drop a leading `/api` segment so `/api/uploads/x` becomes `/uploads/x`. */
function stripApiPrefix(pathname: string): string {
  if (pathname === "/api") return "/";
  if (pathname.startsWith("/api/")) return pathname.slice(4);
  return pathname;
}

/**
 * Build a browser-loadable URL for a stored media path.
 *
 * - empty input -> null
 * - relative "/uploads/..." -> API origin + path
 * - absolute URL on localhost/vercel -> path rewritten onto the API origin
 * - already-correct absolute URL -> returned untouched
 */
export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  const p = String(path).trim();
  if (!p) return null;

  if (/^https?:\/\//i.test(p)) {
    let parsed: URL | null = null;
    try {
      parsed = new URL(p);
    } catch {
      parsed = null;
    }
    if (!parsed) return null;
    // Leave real remote hosts (Supabase Storage, S3, CDN) alone.
    if (!isBadMediaHost(parsed.hostname)) return p;
    const pathname = stripApiPrefix(parsed.pathname || "/");
    return `${apiOrigin()}${pathname}${parsed.search}`;
  }

  if (p.startsWith("data:") || p.startsWith("blob:") || p.startsWith("mailto:")) {
    return p;
  }

  const withSlash = p.startsWith("/") ? p : `/${p}`;
  return `${apiOrigin()}${stripApiPrefix(withSlash)}`;
}
