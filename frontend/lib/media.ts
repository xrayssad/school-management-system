/** Absolute URL for uploads / Supabase storage. */
const SUPA = "https://cfyscarmbfpfjkvgymxr.supabase.co";

export function apiOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return api.replace(/\/api\/?$/, "");
}

export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  const p = path.trim();
  if (!p) return null;

  // Wrong host: Render + /storage/
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

  // Relative Supabase path saved in DB
  if (p.startsWith("/storage/") || p.startsWith("storage/")) {
    const pathPart = p.startsWith("/") ? p : `/${p}`;
    return `${SUPA}${pathPart}`;
  }

  // Legacy local uploads (often 404 after redeploy)
  return `${apiOrigin()}${p.startsWith("/") ? p : `/${p}`}`;
}
