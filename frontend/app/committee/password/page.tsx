"use client";
import MadrasaLoader from "@/components/MadrasaLoader";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Mail, RefreshCw, Shield } from "lucide-react";
import { api } from "@/lib/api";
import { committeePasswordApi } from "@/lib/committee-password";
import { colors } from "@/lib/colors";

type SimpleUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string | null;
};

export default function CommitteePasswordPage() {
  const [teachers, setTeachers] = useState<SimpleUser[]>([]);
  const [students, setStudents] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [selfMsg, setSelfMsg] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      // Jaribu endpoints za kawaida; fallback orodha tupu
      let t: SimpleUser[] = [];
      let s: SimpleUser[] = [];
      try {
        t = await api.get<SimpleUser[]>("/committee/teachers-brief");
      } catch {
        t = [];
      }
      try {
        s = await api.get<SimpleUser[]>("/committee/students-brief");
      } catch {
        s = [];
      }
      // Normalize
      t = (t || []).map((x: any) => ({
        id: x.user_id || x.id,
        full_name: x.full_name || x.name || "Mwalimu",
        email: x.email || "",
        role: "teacher",
        phone: x.phone,
      }));
      s = (s || []).map((x: any) => ({
        id: x.user_id || x.id,
        full_name: x.full_name || x.name || "Mwanafunzi",
        email: x.email || "",
        role: "student",
        phone: x.phone,
      }));
      setTeachers(t);
      setStudents(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Imeshindikana kupakia watumiaji.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setPw(userId: string, name: string) {
    const pw = (passwords[userId] || "").trim();
    if (pw.length < 6) {
      setError("Nenosiri jipya liwe na herufi 6+.");
      return;
    }
    setBusy(userId + "-set");
    setError("");
    setSuccess("");
    try {
      const res = await committeePasswordApi.setPassword(userId, pw);
      setSuccess(`${res.detail || "Imebadilishwa"} — ${name}`);
      setPasswords((p) => ({ ...p, [userId]: "" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Imeshindikana kuweka nenosiri.");
    } finally {
      setBusy(null);
    }
  }

  async function sendEmail(userId: string, name: string) {
    setBusy(userId + "-mail");
    setError("");
    setSuccess("");
    try {
      const res = await committeePasswordApi.sendResetEmail(userId);
      setSuccess(
        `${res.detail} (${res.email || name})` +
          (res.dev_reset_link ? ` · Dev: ${res.dev_reset_link}` : "")
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Imeshindikana kutuma email.");
    } finally {
      setBusy(null);
    }
  }

  async function selfReset(e: FormEvent) {
    e.preventDefault();
    setSelfMsg("");
    setError("");
    try {
      const res = await committeePasswordApi.selfResetEmail();
      setSelfMsg(
        res.detail +
          (res.email ? ` → ${res.email}` : "") +
          (res.dev_reset_link ? ` · ${res.dev_reset_link}` : "")
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana.");
    }
  }

  function Row({ u }: { u: SimpleUser }) {
    if (loading) return <MadrasaLoader />;
  return (
      <li
        className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 last:border-0"
        style={{ borderColor: colors.line }}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: colors.ink }}>
            {u.full_name}
          </p>
          <p className="truncate text-xs" style={{ color: colors.stone }}>
            {u.email || "—"} · {u.role}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Nenosiri jipya"
            value={passwords[u.id] || ""}
            onChange={(e) => setPasswords((p) => ({ ...p, [u.id]: e.target.value }))}
            className="w-32 rounded-lg border px-2 py-1.5 text-xs"
            style={{ borderColor: colors.line }}
          />
          <button
            type="button"
            disabled={busy === u.id + "-set"}
            onClick={() => setPw(u.id, u.full_name)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: colors.primary }}
          >
            <KeyRound size={12} /> Weka
          </button>
          <button
            type="button"
            disabled={busy === u.id + "-mail" || !u.email}
            onClick={() => sendEmail(u.id, u.full_name)}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-60"
            style={{ borderColor: colors.line, color: colors.primary }}
          >
            <Mail size={12} /> Tuma reset
          </button>
        </div>
      </li>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
            Nenosiri
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>
            Weka nenosiri jipya au tuma kiungo cha reset kwa email
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: colors.line, color: colors.primary }}
        >
          <RefreshCw size={14} /> Sasisha
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm break-all" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>
          {success}
        </div>
      )}

      <div className="mb-6 rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
        <div className="mb-3 flex items-center gap-2">
          <Shield size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>
            Nenosiri langu (Kamati)
          </h2>
        </div>
        <p className="mb-3 text-xs" style={{ color: colors.stone }}>
          Tutakutumia kiungo cha kubadilisha nenosiri kwenye barua pepe yako ya Kamati.
        </p>
        <form onSubmit={selfReset}>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Tuma reset kwangu
          </button>
        </form>
        {selfMsg && (
          <p className="mt-2 break-all text-xs" style={{ color: colors.primary }}>
            {selfMsg}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: colors.stone }}>…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
            <div className="border-b px-4 py-3 text-sm font-semibold" style={{ borderColor: colors.line, color: colors.primary }}>
              Walimu ({teachers.length})
            </div>
            {teachers.length === 0 ? (
              <p className="px-4 py-6 text-xs" style={{ color: colors.stone }}>Hakuna walimu.</p>
            ) : (
              <ul>{teachers.map((u) => <Row key={u.id} u={u} />)}</ul>
            )}
          </div>
          <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
            <div className="border-b px-4 py-3 text-sm font-semibold" style={{ borderColor: colors.line, color: colors.primary }}>
              Wanafunzi ({students.length})
            </div>
            {students.length === 0 ? (
              <p className="px-4 py-6 text-xs" style={{ color: colors.stone }}>Hakuna wanafunzi.</p>
            ) : (
              <ul>{students.map((u) => <Row key={u.id} u={u} />)}</ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
