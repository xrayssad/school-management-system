"use client";

function mediaUrl(url?: string | null) {
  if (!url) return null;
  const u = String(url).trim();
  if (u.includes("onrender.com/storage/")) {
    return "https://cfyscarmbfpfjkvgymxr.supabase.co/storage/" + u.split("/storage/")[1];
  }
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/storage/") || u.startsWith("storage/")) {
    const p = u.startsWith("/") ? u : "/" + u;
    return "https://cfyscarmbfpfjkvgymxr.supabase.co" + p;
  }
  if (u.startsWith("/uploads")) {
    return "https://madrasatulhabibielmustwafa-api.onrender.com" + u;
  }
  return u;
}

import MadrasaLoader from "@/components/MadrasaLoader";
import AnnouncementsList from "@/components/AnnouncementsList";
export default function Page() {
  return <AnnouncementsList subtitle="Taarifa kutoka kwa Kamati" />;
}
