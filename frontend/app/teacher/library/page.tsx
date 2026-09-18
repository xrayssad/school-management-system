"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Item = {
  id: string;
  title: string;
  item_type: string;
  class_name?: string | null;
  subject_name?: string | null;
  term?: string | null;
  file_url: string;
  file_name?: string;
};

function fileHref(url: string) {
  return url.startsWith("http") ? url : `http://localhost:8000${url}`;
}

const TYPE_LABEL: Record<string, string> = {
  book: "Kitabu",
  past_paper: "Past paper",
  other: "Nyingine",
};

export default function TeacherLibraryPage() {
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
  const [filter, setFilter] = useState("");

  async function load() {
    const q = filter ? `?item_type=${filter}` : "";
    const d = await api.get<Item[]>(`/library${q}`);
    setItems(Array.isArray(d) ? d : []);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, [filter]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (!file) {
      setErr("Chagua faili (PDF n.k.)");
      return;
    }
    if (!title.trim()) {
      setErr("Andika kichwa");
      return;
    }
    const fd = new FormData();
    fd.append("title", title.trim());
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
      const d = body.detail;
      setErr(typeof d === "string" ? d : JSON.stringify(d || body) || "Imeshindikana");
      return;
    }
    setMsg("Imepakiwa — wanafunzi wanaweza kupakua");
    setTitle("");
    setFile(null);
    await load();
  }

  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Maktaba
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Pakia vitabu / past papers · pakua zilizopo
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-4 space-y-3 rounded-xl border bg-white p-4"
        style={{ borderColor: colors.line }}
      >
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
          Pakia faili
        </p>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Kichwa cha kitabu / past paper"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          >
            <option value="book">Kitabu</option>
            <option value="past_paper">Past paper</option>
            <option value="other">Nyingine (jumla)</option>
          </select>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          >
            <option value="">— Bila darasa (jumla) —</option>
            {allClasses().map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Somo (si lazima)"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Muhula (past paper)"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          />
        </div>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.epub"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
        <button
          type="submit"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: colors.primary }}
        >
          Pakia
        </button>
        {msg && (
          <p className="text-sm" style={{ color: colors.primary }}>
            {msg}
          </p>
        )}
        {err && <p className="text-sm text-red-700">{err}</p>}
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["", "Zote"],
          ["book", "Vitabu"],
          ["past_paper", "Past papers"],
          ["other", "Nyingine"],
        ].map(([v, l]) => (
          <button
            key={v || "all"}
            type="button"
            onClick={() => setFilter(v)}
            className="rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              borderColor: filter === v ? colors.primary : colors.line,
              color: filter === v ? colors.primary : colors.stone,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3"
            style={{ borderColor: colors.line }}
          >
            <div>
              <p className="text-sm font-medium">{it.title}</p>
              <p className="text-xs" style={{ color: colors.stone }}>
                {TYPE_LABEL[it.item_type] || it.item_type}
                {it.class_name ? ` · ${it.class_name}` : " · Jumla"}
                {it.subject_name ? ` · ${it.subject_name}` : ""}
              </p>
            </div>
            <a
              href={fileHref(it.file_url)}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold underline"
              style={{ color: colors.primary }}
            >
              Pakua
            </a>
          </div>
        ))}
        {!items.length && (
          <p className="text-sm" style={{ color: colors.stone }}>
            Hakuna faili bado.
          </p>
        )}
      </div>
    </div>
  );
}
