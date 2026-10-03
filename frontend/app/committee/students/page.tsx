"use client";

import { apiUrl, mediaUrl } from "@/lib/media";
import { useCallback, useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";
import MadrasaLoader from "@/components/MadrasaLoader";

const API = apiUrl();

type Student = {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  student_code?: string;
  class_name?: string;
  promotion_status?: string | null;
  is_active?: boolean;
};

export default function CommitteeStudentsPage() {
  const classOptions = allClasses();
  const [students, setStudents] = useState<Student[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [csv, setCsv] = useState<File | null>(null);
  const [zip, setZip] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadErr, setUploadErr] = useState("");
  const [busy, setBusy] = useState(false);

  const token = () => localStorage.getItem("madrasa_token");
  const headers = () => ({
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (classFilter) params.set("class_name", classFilter);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`${API}/committee/students?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.detail === "string" ? body.detail : `HTTP ${res.status}`
        );
      }
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : data.students || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Imeshindikana");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [classFilter, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function blockStudent(id: string) {
    const res = await fetch(`${API}/committee/students/${id}/block`, {
      method: "POST",
      headers: headers(),
    });
    if (!res.ok) alert("Imeshindikana kuzuia");
    await load();
  }

  async function unblockStudent(id: string) {
    const res = await fetch(`${API}/committee/students/${id}/unblock`, {
      method: "POST",
      headers: headers(),
    });
    if (!res.ok) alert("Imeshindikana kufungua");
    await load();
  }

  async function deleteStudent(id: string) {
    if (!confirm("Futa akaunti ya mwanafunzi kabisa? Haitaweza kurejeshwa.")) return;
    const res = await fetch(`${API}/committee/students/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) alert("Imeshindikana kufuta");
    await load();
  }

  async function editStudent(s: Student) {
    const full_name = prompt("Jina kamili", s.full_name || "");
    if (full_name === null) return;
    const class_name = prompt("Darasa (mf. Darasa la 1)", s.class_name || "");
    if (class_name === null) return;
    const student_code = prompt("Namba (mf. MHM.2026/001)", s.student_code || "");
    if (student_code === null) return;
    const phone = prompt("Simu", s.phone || "");
    if (phone === null) return;
    const password = prompt("Nenosiri jipya (acha tupu kama hubadilishi)", "");
    if (password === null) return;
    const body: Record<string, string> = {
      full_name: full_name.trim(),
      class_name: class_name.trim(),
      student_code: student_code.trim(),
      phone: phone.trim(),
    };
    if (password.trim()) body.password = password.trim();
    const res = await fetch(`${API}/committee/students/${s.user_id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      alert(typeof b.detail === "string" ? b.detail : "Imeshindikana kuhifadhi");
      return;
    }
    await load();
  }

  async function upload() {
    setUploadMsg("");
    setUploadErr("");
    if (!csv) {
      setUploadErr("Chagua faili CSV");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", csv);
      if (zip) fd.append("photos_zip", zip);
      const res = await fetch(`${API}/committee/students/import-csv`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadErr(
          typeof body.detail === "string" ? body.detail : "Imeshindikana kupakia"
        );
        return;
      }
      setUploadMsg(
        `Imeundwa: ${body.created ?? 0}, ruka: ${body.skipped ?? 0}. Namba: MHM.2026/001 (slash).`
      );
      await load();
    } catch (e: unknown) {
      setUploadErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <MadrasaLoader label="Inapakia wanafunzi…" />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Wanafunzi
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Orodha · CSV (namba MHM.2026/001) · Hariri / Zuia / Futa
      </p>

      <div
        className="mt-4 rounded-xl border bg-white p-4 text-sm"
        style={{ borderColor: colors.line }}
      >
        <p className="font-medium" style={{ color: colors.primary }}>
          Pakia CSV (wengi kwa wakati mmoja)
        </p>
        <p className="mt-1 text-xs" style={{ color: colors.stone }}>
          Headers: full_name,email,class_name,phone,password,student_code,guardian_name,photo_filename
          · Namba: MHM.2026/001 (slash) · password chaguo-msingi Student@123 · ZIP + photo_filename
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input type="file" accept=".csv,text/csv" onChange={(e) => setCsv(e.target.files?.[0] || null)} />
          <input type="file" accept=".zip" onChange={(e) => setZip(e.target.files?.[0] || null)} />
          <button
            type="button"
            disabled={busy}
            onClick={upload}
            className="rounded-lg px-3 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: colors.primary }}
          >
            {busy ? "Inapakia…" : "Pakia CSV"}
          </button>
        </div>
        {uploadMsg && <p className="mt-2 text-xs" style={{ color: colors.primary }}>{uploadMsg}</p>}
        {uploadErr && <p className="mt-2 text-xs text-red-600">{uploadErr}</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="text-sm">
          Darasa
          <select
            className="mt-1 block rounded-lg border px-2 py-2 text-sm"
            style={{ borderColor: colors.line }}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">Yote</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Tafuta
          <input
            className="mt-1 block rounded-lg border px-2 py-2 text-sm"
            style={{ borderColor: colors.line }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jina / namba"
          />
        </label>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border px-3 py-2 text-sm font-medium"
          style={{ borderColor: colors.primary, color: colors.primary }}
        >
          Onyesha
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Picha</th>
              <th>Namba</th>
              <th>Jina</th>
              <th>Darasa</th>
              <th>Mawasiliano</th>
              <th>Hali</th>
              <th className="px-3 py-2">Vitendo</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const img = mediaUrl(s.avatar_url);
              return (
                <tr key={s.user_id || s.student_code} className="border-t" style={{ borderColor: colors.line }}>
                  <td className="px-3 py-2">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {(s.full_name || "?").slice(0, 1)}
                      </span>
                    )}
                  </td>
                  <td className="font-medium">{s.student_code || "—"}</td>
                  <td>{s.full_name}</td>
                  <td>{s.class_name || "—"}</td>
                  <td style={{ color: colors.stone }}>
                    {[s.email, s.phone].filter(Boolean).join(" · ")}
                  </td>
                  <td className="text-xs">
                    {s.is_active === false
                      ? "Imezuiwa"
                      : s.promotion_status === "repeated"
                        ? "Amerudishwa"
                        : s.promotion_status === "promoted"
                          ? "Amepandishwa"
                          : "Active"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="rounded border px-2 py-1 text-xs"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                        onClick={() => editStudent(s)}
                      >
                        Hariri
                      </button>
                      {s.is_active === false ? (
                        <button
                          type="button"
                          className="rounded border px-2 py-1 text-xs"
                          onClick={() => unblockStudent(s.user_id)}
                        >
                          Fungua
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="rounded border px-2 py-1 text-xs text-amber-800"
                          onClick={() => blockStudent(s.user_id)}
                        >
                          Zuia
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                        onClick={() => deleteStudent(s.user_id)}
                      >
                        Futa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!students.length && (
          <p className="p-4 text-sm" style={{ color: colors.stone }}>Hakuna wanafunzi.</p>
        )}
      </div>
    </div>
  );
}
