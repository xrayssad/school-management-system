"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

type Staff = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  is_active?: boolean;
};

export default function CommitteeUsersPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Kamati@123");
  const [phone, setPhone] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await api.get<Staff[]>("/committee/users");
      setStaff(Array.isArray(d) ? d : []);
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function promote(userId: string) {
    setMsg("");
    setError("");
    try {
      const r = await api.post<{ message: string }>("/committee/users/promote-teacher", {
        user_id: userId,
      });
      setMsg(r.message || "Imefanyika");
      await load();
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    }
  }

  async function demote(userId: string) {
    setMsg("");
    setError("");
    try {
      const r = await api.post<{ message: string }>("/committee/users/demote-to-teacher", {
        user_id: userId,
      });
      setMsg(r.message || "Imefanyika");
      await load();
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    }
  }

  async function createCommittee(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await api.post("/committee/users/create-committee", {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone || undefined,
      });
      setMsg(`Kamati mpya: ${email}`);
      setFullName("");
      setEmail("");
      setPhone("");
      await load();
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    }
  }

  const teachers = staff.filter((s) => s.role === "teacher");
  const committee = staff.filter((s) => s.role === "committee" || s.role === "admin");

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Watumiaji wa Kamati
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Ongeza mwanachama mpya au mpe mwalimu ruhusa za Kamati
      </p>

      {msg && (
        <p className="mt-3 text-sm" style={{ color: colors.primary }}>
          {msg}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {/* Create */}
      <form
        onSubmit={createCommittee}
        className="mt-4 space-y-3 rounded-xl border bg-white p-4"
        style={{ borderColor: colors.line }}
      >
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
          Ongeza mtumiaji mpya wa Kamati
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium">Jina kamili</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Barua pepe</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Nenosiri</label>
            <input
              required
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Simu (si lazima)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: colors.primary }}
        >
          Hifadhi Kamati
        </button>
      </form>

      {/* Committee list */}
      <h2 className="mt-8 font-serif text-lg font-semibold" style={{ color: colors.primary }}>
        Wanachama wa Kamati
      </h2>
      <div className="mt-2 overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Jina</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {committee.map((s) => (
              <tr key={s.id} className="border-t" style={{ borderColor: colors.line }}>
                <td className="px-3 py-2 font-medium">{s.full_name}</td>
                <td>{s.email}</td>
                <td>{s.role}</td>
                <td className="px-3 py-2">
                  {s.role === "committee" && (
                    <button
                      type="button"
                      onClick={() => demote(s.id)}
                      className="text-xs font-medium underline"
                      style={{ color: colors.stone }}
                    >
                      Rudisha mwalimu
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !committee.length && (
          <p className="p-3 text-xs" style={{ color: colors.stone }}>
            Hakuna
          </p>
        )}
      </div>

      {/* Teachers → promote */}
      <h2 className="mt-8 font-serif text-lg font-semibold" style={{ color: colors.primary }}>
        Walimu — mpe role ya Kamati
      </h2>
      <div className="mt-2 overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Jina</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((s) => (
              <tr key={s.id} className="border-t" style={{ borderColor: colors.line }}>
                <td className="px-3 py-2 font-medium">{s.full_name}</td>
                <td>{s.email}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => promote(s.id)}
                    className="rounded-lg px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Fanya Kamati
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !teachers.length && (
          <p className="p-3 text-xs" style={{ color: colors.stone }}>
            Hakuna walimu
          </p>
        )}
      </div>
    </div>
  );
}
