const PROD_API = "https://madrasatulhabibielmustwafa-api.onrender.com/api";

export function apiOrigin(): string {
  const api =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? PROD_API
      : "http://localhost:8000/api");
  return api.replace(/\/api\/?$/, "");
}

export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  const p = path.trim();
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://")) {
    try {
      const u = new URL(p);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        return `${apiOrigin()}${u.pathname}${u.search}`;
      }
    } catch {
      /* keep */
    }
    return p;
  }
  return `${apiOrigin()}${p.startsWith("/") ? p : `/${p}`}`;
}
