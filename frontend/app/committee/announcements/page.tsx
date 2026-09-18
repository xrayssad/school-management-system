"use client";
import MadrasaLoader from "@/components/MadrasaLoader";

import { FormEvent, useEffect, useState } from "react";
import { Megaphone, Paperclip, Send } from "lucide-react";
import { colors } from "@/lib/colors";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Ann = {
  id: string;
  title: string;
  message: string;
  audience?: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  created_at?: string;
};

export default function CommitteeAnnouncementsPage() {
  const [items, setItems] = useState<Ann[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function token() {
    return localStorage.getItem("madrasa_token");
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/committee/announcements/list`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) {
        // fallback general list
        const res2 = await fetch(`${API}/announcements`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res2.json();
        setItems(Array.isArray(data) ? data : data.items || []);
      } else {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Imeshindikana");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("message", message.trim());
      fd.append("audience", audience);
      if (file) fd.append("attachment", file);
      const res = await fetch(`${API}/committee/announcements/with-attachment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof body.detail === "string" ? body.detail : "Imeshindikana kutuma");
      }
      setSuccess("Tangazo limetumwa");
      setTitle("");
      setMessage("");
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana");
    } finally {
      setSaving(false);
    }
  }

  function attHref(url?: string | null) {
    if (!url) return null;
    return url.startsWith("http") ? url : `http://localhost:8000${url}`;
  }

  if (loading) return <MadrasaLoader />;
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Matangazo
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Tuma ujumbe kwa wanafunzi / walimu — unaweza kuambatanisha PDF au picha
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Kichwa</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Ujumbe</label>
          <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Hadhir</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
              <option value="all">Wote (wanafunzi + walimu)</option>
              <option value="students">Wanafunzi tu</option>
              <option value="teachers">Walimu tu</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Kiambatisho (PDF / picha)</label>
            <input type="file" accept=".pdf,image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
          </div>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {success && <p className="text-sm" style={{ color: colors.primary }}>{success}</p>}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
          <Send size={14} /> {saving ? "Inatuma…" : "Tuma tangazo"}
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-sm" style={{ color: colors.stone }}>…</p>}
        {items.map((a) => (
          <article key={a.id} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
            <div className="flex items-start gap-2">
              <Megaphone size={16} style={{ color: colors.primary }} />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold" style={{ color: colors.ink }}>{a.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm" style={{ color: colors.stone }}>{a.message}</p>
                {a.attachment_url && (
                  <a
                    href={attHref(a.attachment_url) || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium underline"
                    style={{ color: colors.primary }}
                  >
                    <Paperclip size={14} />
                    {a.attachment_name || "Kiambatisho"}
                  </a>
                )}
                <p className="mt-2 text-xs" style={{ color: colors.stone }}>
                  {a.audience || "all"}
                  {a.created_at ? ` · ${new Date(a.created_at).toLocaleString("sw-TZ")}` : ""}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
