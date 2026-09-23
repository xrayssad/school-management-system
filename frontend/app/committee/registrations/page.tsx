"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";
import MadrasaLoader from "@/components/MadrasaLoader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Reg = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  class_name: string;
  status: string;
  student_code?: string | null;
  created_at?: string;
};

export default function CommitteeRegistrationsPage() {
  const classOptions = allClasses();
  const [items, setItems] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // manual form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [className, setClassName] = useState(classOptions[1] || "Darasa la 1");
  const [password, setPassword] = useState("Student@123");
  const [studentCode, setStudentCode] = useState("");
  const [saving, setSaving] = useState(false);

  // approve
  const [codes, setCodes] = useState<Record<string, string>>({});

  const token = () => localStorage.getItem("madrasa_token");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/committee/registrations`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Imeshindikana kupakia maombi");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createManual(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!fullName.trim()) {
      setError("Jaza jina kamili");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/committee/students/create-one`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          class_name: className,
          password: password || "Student@123",
          student_code: studentCode.trim() || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const d = body.detail;
        throw new Error(typeof d === "string" ? d : JSON.stringify(d || body));
      }
      setMsg(
        `Ameongezwa: ${body.student_code} · anaweza kuingia kwa namba/nenosiri uliloweka`
      );
      setFullName("");
      setEmail("");
      setPhone("");
      setStudentCode("");
      await load();
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    } finally {
      setSaving(false);
    }
  }

  async function approve(id: string) {
    setMsg("");
    setError("");
    const code = (codes[id] || "").trim();
    if (!code) {
      setError("Weka namba ya usajili kabla ya kuidhinisha");
      return;
    }
    try {
      const res = await fetch(`${API}/committee/registrations/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_code: code }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const d = body.detail;
        throw new Error(typeof d === "string" ? d : JSON.stringify(d || body));
      }
      setMsg(`Imeidhinishwa: ${code}`);
      await load();
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    }
  }

  if (loading) return <MadrasaLoader label="Inapakia usajili…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Usajili
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          Idhinisha maombi · au ongeza mwanafunzi mmoja kwa mkono (bila CSV)
        </p>
      </div>

      {msg && <p className="text-sm" style={{ color: colors.primary }}>{msg}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* Manual entry */}
      <form
        onSubmit={createManual}
        className="space-y-3 rounded-xl border bg-white p-4"
        style={{ borderColor: colors.line }}
      >
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
          Ongeza mwanafunzi mmoja (mkono)
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium">Jina kamili *</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Darasa *</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            >
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Barua pepe (si lazima)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
              placeholder="anaweza kuachwa"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Simu</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Namba ya usajili (si lazima)</label>
            <input
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
              placeholder="Ikiwa tupu, mfumo utatengeneza"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Nenosiri la kwanza</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: colors.primary }}
        >
          {saving ? "…" : "Hifadhi mwanafunzi"}
        </button>
      </form>

      {/* Pending list */}
      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="border-b px-4 py-3" style={{ borderColor: colors.line }}>
          <p className="text-sm font-semibold" style={{ color: colors.primary }}>
            Maombi yaliyowasili
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-xs" style={{ color: colors.stone }}>
                <th className="px-3 py-2">Jina</th>
                <th>Darasa</th>
                <th>Hali</th>
                <th>Namba</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: colors.line }}>
                  <td className="px-3 py-2">
                    <p className="font-medium">{r.full_name}</p>
                    <p className="text-xs" style={{ color: colors.stone }}>{r.email}</p>
                  </td>
                  <td>{r.class_name}</td>
                  <td className="text-xs">{r.status}</td>
                  <td>
                    {r.status === "pending" ? (
                      <input
                        value={codes[r.id] || ""}
                        onChange={(e) => setCodes((c) => ({ ...c, [r.id]: e.target.value }))}
                        placeholder="STU…"
                        className="w-28 rounded border px-2 py-1 text-xs"
                        style={{ borderColor: colors.line }}
                      />
                    ) : (
                      r.student_code || "—"
                    )}
                  </td>
                  <td className="px-2">
                    {r.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => approve(r.id)}
                        className="rounded px-2 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: colors.primary }}
                      >
                        Idhinisha
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && (
            <p className="p-4 text-sm" style={{ color: colors.stone }}>
              Hakuna maombi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
