"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Megaphone, Plus, Send, Search } from "lucide-react";
import { committeeApi } from "@/lib/api";
import type { CommitteeAnnouncement, SchoolClass } from "@/lib/types";
import { colors } from "@/lib/colors";

export default function CommitteeAnnouncementsPage() {
  const [items, setItems] = useState<CommitteeAnnouncement[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [q, setQ] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [announcements, classList] = await Promise.all([
        committeeApi.listAnnouncements(),
        committeeApi.listClasses(),
      ]);
      setItems(announcements);
      setClasses(classList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kupakia matangazo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (a) =>
        a.title.toLowerCase().includes(s) ||
        a.content.toLowerCase().includes(s) ||
        (a.target_class_name || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSuccess("");
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("Jaza kichwa na maudhui ya tangazo.");
      return;
    }
    setSaving(true);
    try {
      await committeeApi.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        target_class_id: targetClassId || null,
      });
      setTitle("");
      setContent("");
      setTargetClassId("");
      setSuccess("Tangazo limetumwa.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kutuma tangazo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Matangazo</h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>Tuma na simamia matangazo kwa wanafunzi</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>{success}</div>
      )}

      <div className="mb-6 rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Tangazo jipya</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Kichwa</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={{ borderColor: colors.line, backgroundColor: colors.soft }} placeholder="Mfano: Kikao cha wazazi" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Maudhui</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={{ borderColor: colors.line, backgroundColor: colors.soft }} placeholder="Andika ujumbe…" required />
            <p className="mt-1 text-[11px]" style={{ color: colors.stone }}>{content.length} herufi</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Lengwa</label>
            <select value={targetClassId} onChange={(e) => setTargetClassId(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }}>
              <option value="">Wanafunzi wote</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
            <Send size={16} />
            {saving ? "Inatuma…" : "Tuma tangazo"}
          </button>
        </form>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.stone }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tafuta tangazo…"
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
            style={{ borderColor: colors.line }}
          />
        </div>
        <span className="text-xs" style={{ color: colors.stone }}>{filtered.length} kati ya {items.length}</span>
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-3" style={{ borderColor: colors.line }}>
          <Megaphone size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Yaliyotumwa</h2>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Inapakia…</p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna matangazo.</p>
        ) : (
          <ul>
            {filtered.map((a) => (
              <li key={a.id} className="border-b px-5 py-4 last:border-b-0" style={{ borderColor: colors.line }}>
                <p className="text-sm font-medium" style={{ color: colors.ink }}>{a.title}</p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: colors.stone }}>{a.content}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs" style={{ color: colors.stone }}>
                  <span>{new Date(a.created_at).toLocaleString("sw-TZ")}</span>
                  <span>·</span>
                  <span>{a.target_class_name || "Wanafunzi wote"}</span>
                  <span>·</span>
                  <span>Waliofikiwa: {a.reach_count}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
