const SUPA = "https://cfyscarmbfpfjkvgymxr.supabase.co";

/** Origin without /api — for static /uploads paths. */
export function apiOrigin(): string {
  const api =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://madrasatulhabibielmustwafa-api.onrender.com/api";
  return api.replace(/\/api\/?$/, "");
}

/** Full URL for images, PDFs, Supabase storage, legacy /uploads. */
export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  const p = path.trim();
  if (!p) return null;

  if (p.includes("onrender.com/storage/")) {
    return `${SUPA}/storage/${p.split("/storage/")[1]}`;
  }

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

  if (p.startsWith("/storage/") || p.startsWith("storage/")) {
    const pathPart = p.startsWith("/") ? p : `/${p}`;
    return `${SUPA}${pathPart}`;
  }

  return `${apiOrigin()}${p.startsWith("/") ? p : `/${p}`}`;
}

/** API base including /api — for fetch (e.g. student exams). */
export function apiUrl(path: string = ""): string {
  const base = (
    process.env.NEXT_PUBLIC_API_URL ||
    "https://madrasatulhabibielmustwafa-api.onrender.com/api"
  ).replace(/\/$/, "");
  if (!path) return base;
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
