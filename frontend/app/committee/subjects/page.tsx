"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";
import MadrasaLoader from "@/components/MadrasaLoader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Sub = { id: string; name: string; code?: string };
type Block = { class_name: string; subjects: { subject_id: string; subject_name: string; code?: string }[] };

export default function CommitteeSubjectsPage() {
  const [subjects, setSubjects] = useState<Sub[]>([]);
  const [byClass, setByClass] = useState<Block[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [assignClass, setAssignClass] = useState(allClasses()[0] || "Darasa la 1");
  const [assignSubject, setAssignSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const token = () => localStorage.getItem("madrasa_token");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([
        fetch(`${API}/committee/subjects`, { headers: { Authorization: `Bearer ${token()}` } }).then((r) => r.json()),
        fetch(`${API}/committee/subjects/by-class`, { headers: { Authorization: `Bearer ${token()}` } }).then((r) => r.json()),
      ]);
      setSubjects(Array.isArray(s) ? s : []);
      setByClass(Array.isArray(b) ? b : []);
      if (Array.isArray(s) && s[0] && !assignSubject) setAssignSubject(s[0].id);
    } catch {
      setError("Imeshindikana kupakia");
    } finally {
      setLoading(false);
    }
  }, [assignSubject]);

  useEffect(() => {
    load();
  }, [load]);

  async function addSubject(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    const res = await fetch(`${API}/committee/subjects`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail || body));
      return;
    }
    setMsg(`Somo limeongezwa: ${body.code}`);
    setName("");
    setCode("");
    await load();
  }

  async function assign(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch(`${API}/committee/subjects/assign`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ class_name: assignClass, subject_id: assignSubject }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof body.detail === "string" ? body.detail : "Imeshindikana");
      return;
    }
    setMsg("Somo limeunganishwa na darasa");
    await load();
  }

  async function unassign(class_name: string, subject_id: string) {
    await fetch(
      `${API}/committee/subjects/assign?class_name=${encodeURIComponent(class_name)}&subject_id=${encodeURIComponent(subject_id)}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } }
    );
    await load();
  }

  if (loading) return <MadrasaLoader label="Inapakia masomo…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Masomo
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          Ongeza somo (jina + msimbo) · unganisha na darasa · hutumika kwenye ratiba, mitihani, alama
        </p>
      </div>
      {msg && <p className="text-sm" style={{ color: colors.primary }}>{msg}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      <form onSubmit={addSubject} className="space-y-3 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>Somo jipya</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs">Jina *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} placeholder="Fiqh" />
          </div>
          <div>
            <label className="text-xs">Msimbo *</label>
            <input required value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} placeholder="FIQ" />
          </div>
        </div>
        <button type="submit" className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
          Hifadhi somo
        </button>
      </form>

      <form onSubmit={assign} className="space-y-3 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>Unganisha somo na darasa</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={assignClass} onChange={(e) => setAssignClass(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
            {allClasses().map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={assignSubject} onChange={(e) => setAssignSubject(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.code ? `${s.code} — ` : ""}{s.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: colors.primary, color: colors.primary }}>
          Unganisha
        </button>
      </form>

      <div className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>Orodha ya masomo</p>
        <ul className="mt-2 space-y-1 text-sm">
          {subjects.map((s) => (
            <li key={s.id}>
              <span className="font-medium">{s.code || "—"}</span> · {s.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>Masomo kwa darasa</p>
        {byClass.map((b) => (
          <div key={b.class_name} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
            <p className="font-medium">{b.class_name}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {(b.subjects || []).map((s) => (
                <li key={s.subject_id} className="flex items-center justify-between gap-2">
                  <span>
                    {s.code || "—"} · {s.subject_name}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-red-700 underline"
                    onClick={() => unassign(b.class_name, s.subject_id)}
                  >
                    Ondoa
                  </button>
                </li>
              ))}
              {!b.subjects?.length && (
                <li className="text-xs" style={{ color: colors.stone }}>Hakuna bado</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
