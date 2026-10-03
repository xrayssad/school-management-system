const PROD_API_HOST = "https://madrasatulhabibielmustwafa-api.onrender.com";
const PROD_API = `${PROD_API_HOST}/api`;

export function apiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  let base = configured || PROD_API;
  
  if (typeof window !== "undefined") {
    try {
      const url = new URL(base, window.location.origin);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        base = PROD_API;
      }
    } catch {
      if (base.includes("localhost") || base.includes("127.0.0.1")) {
        base = PROD_API;
      }
    }
  } else {
    if (base.includes("localhost") || base.includes("127.0.0.1")) {
      base = PROD_API;
    }
  }
  
  return base.replace(/\/api\/?$/, "");
}

export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  const p = path.trim();
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://")) {
    try {
      const u = new URL(p);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "0.0.0.0") {
        return `${apiOrigin()}${u.pathname}${u.search}`;
      }
    } catch {
      /* keep */
    }
    return p;
  }
  return `${apiOrigin()}${p.startsWith("/") ? p : `/${p}`}`;
}
