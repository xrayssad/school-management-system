"use client";

import { apiUrl } from "@/lib/media";

import MadrasaLoader from "@/components/MadrasaLoader";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";

const API = apiUrl();

type Item = {
  id: string;
  title: string;
  item_type: string;
  class_name?: string | null;
  file_url: string;
};

export default function CommitteeLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState("book");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    const d = await api.get<Item[]>("/library");
    setItems(Array.isArray(d) ? d : []);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (!file) {
      setErr("Chagua faili");
      return;
    }
    const fd = new FormData();
    fd.append("title", title);
    fd.append("item_type", itemType);
    if (className) fd.append("class_name", className);
    if (subject) fd.append("subject_name", subject);
    if (term) fd.append("term", term);
    fd.append("file", file);
    const token = localStorage.getItem("madrasa_token");
    const res = await fetch(`${API}/library/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(typeof body.detail === "string" ? body.detail : "Imeshindikana");
      return;
    }
    setMsg("Imepakiwa");
    setTitle("");
    setFile(null);
    await load();
  }

  async function remove(id: string) {
    await api.delete(`/library/${id}`).catch(() =>
      fetch(`${API}/library/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("madrasa_token")}` },
      })
    );
    await load();
  }

  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Maktaba — pakia
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Vitabu vya darasa, vitabu vya jumla, past papers (PDF)
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kichwa" className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
        <div className="grid gap-2 sm:grid-cols-2">
          <select value={itemType} onChange={(e) => setItemType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
            <option value="book">Kitabu cha darasa / somo</option>
            <option value="past_paper">Past paper</option>
            <option value="other">Kitabu kingine (jumla)</option>
          </select>
          <select value={className} onChange={(e) => setClassName(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
            <option value="">— Bila darasa (jumla) —</option>
            {allClasses().map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Somo (si lazima)" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Muhula (past paper)" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
        </div>
        <input type="file" accept=".pdf,.doc,.docx,.epub" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        <button type="submit" className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
          Pakia
        </button>
        {msg && <p className="text-sm" style={{ color: colors.primary }}>{msg}</p>}
        {err && <p className="text-sm text-red-700">{err}</p>}
      </form>

      <div className="mt-6 space-y-2">
        {items.length === 0 && (
          <p className="text-sm" style={{ color: colors.stone }}>Hakuna vitabu. Pakia upya (Supabase) ili zionekane baada ya deploy.</p>
        )}
        {items.map((it) => (
          <div key={it.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 text-sm" style={{ borderColor: colors.line }}>
            <div>
              <p className="font-medium">{it.title}</p>
              <p className="text-xs" style={{ color: colors.stone }}>{it.item_type} · {it.class_name || "jumla"}</p>
            </div>
            <div className="flex items-center gap-3">
              {mediaUrl(it.file_url) && (
                <a href={mediaUrl(it.file_url)!} target="_blank" rel="noreferrer" className="text-xs font-medium underline" style={{ color: colors.primary }}>
                  Fungua
                </a>
              )}
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Futa kitabu hiki kwa wote?")) return;
                  await remove(it.id);
                }}
                className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700"
              >
                Futa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
