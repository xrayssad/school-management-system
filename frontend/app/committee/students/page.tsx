"use client";
import MadrasaLoader from "@/components/MadrasaLoader";

import { allClasses, CLASS_ORDER } from "@/lib/classes";

import { useCallback, useEffect, useState } from "react";
import { colors } from "@/lib/colors";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

function mediaUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("http") ? url : `http://localhost:8000${url}`;
}

export default function CommitteeStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [csv, setCsv] = useState<File | null>(null);
  const [zip, setZip] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadErr, setUploadErr] = useState("");
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const token = () => localStorage.getItem("madrasa_token");

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
        // fallback older endpoint
        const res2 = await fetch(`${API}/students`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res2.ok) throw new Error("Imeshindikana kupakia wanafunzi");
        const data2 = await res2.json();
        setStudents(Array.isArray(data2) ? data2 : data2.students || []);
        return;
      }
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    } finally {
      setLoading(false);
    }
  }, [classFilter, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload() {
    setUploadMsg("");
    setUploadErr("");
    setUploadResult(null);
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
        const d = body.detail;
        setUploadErr(typeof d === "string" ? d : JSON.stringify(d || body) || "Imeshindikana");
        return;
      }
      setUploadResult(body);
      setUploadMsg(`Imeundwa: ${body.created ?? 0}, ruka: ${body.skipped ?? 0}`);
      await load();
    } catch (e: any) {
      setUploadErr(e.message || "Failed to fetch");
    } finally {
      setBusy(false);
    }
  }

  const classes = Array.from(
    new Set(students.map((s) => s.class_name).filter(Boolean) as string[])
  ).sort();

  if (loading) return <MadrasaLoader />;
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Wanafunzi
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Orodha ya waliosajiliwa · pakia CSV kuongeza wengi
      </p>

      {/* CSV upload */}
      <div
        className="mt-4 space-y-3 rounded-xl border bg-white p-4"
        style={{ borderColor: colors.line }}
      >
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
          Pakia CSV
        </p>
        <p className="text-xs" style={{ color: colors.stone }}>
          Headers: full_name, email, class_name, phone, password, student_code, photo_filename
        </p>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs font-medium">CSV</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsv(e.target.files?.[0] || null)}
              className="mt-1 block text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Zip picha (si lazima)</label>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setZip(e.target.files?.[0] || null)}
              className="mt-1 block text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={upload}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: colors.primary }}
        >
          {busy ? "…" : "Pakia CSV"}
        </button>
        {uploadMsg && (
          <p className="text-sm" style={{ color: colors.primary }}>
            {uploadMsg}
          </p>
        )}
        {uploadErr && <p className="text-sm text-red-700">{uploadErr}</p>}
        {uploadResult?.errors?.length > 0 && (
          <ul className="max-h-32 list-disc overflow-y-auto pl-4 text-xs text-red-800">
            {uploadResult.errors.map((e: string, i: number) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tafuta jina, email, namba…"
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line, minWidth: 200 }}
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        >
          <option value="">Madarasa yote</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          {!classes.includes("Darasa la 1") && <option value="Darasa la 1">Darasa la 1</option>}
          {!classes.includes("Darasa la 2") && <option value="Darasa la 2">Darasa la 2</option>}
          {!classes.includes("Darasa la 3") && <option value="Darasa la 3">Darasa la 3</option>}
        </select>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border px-3 py-2 text-sm font-medium"
          style={{ borderColor: colors.primary, color: colors.primary }}
        >
          Onyesha
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {loading && (
        <p className="mt-4 text-sm" style={{ color: colors.stone }}>
          …
        </p>
      )}

      {/* Table */}
      <div
        className="mt-4 overflow-x-auto rounded-xl border bg-white"
        style={{ borderColor: colors.line }}
      >
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Picha</th>
              <th className="px-3 py-2">Jina</th>
              <th className="px-3 py-2">Namba</th>
              <th className="px-3 py-2">Darasa</th>
              <th className="px-3 py-2">Barua / Simu</th>
              <th className="px-3 py-2">Hali</th>
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
                      <img
                        src={img}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {(s.full_name || "?").slice(0, 1)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">{s.full_name}</td>
                  <td className="px-3 py-2" style={{ color: colors.stone }}>
                    {s.student_code || "—"}
                  </td>
                  <td className="px-3 py-2">{s.class_name || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="text-xs">{s.email}</div>
                    <div className="text-xs" style={{ color: colors.stone }}>
                      {s.phone || ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {s.promotion_status === "repeated"
                      ? "Kurudishwa"
                      : s.promotion_status === "promoted"
                        ? "Kupandishwa"
                        : s.is_active === false
                          ? "Zimwa"
                          : "Active"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && students.length === 0 && (
          <p className="p-4 text-sm" style={{ color: colors.stone }}>
            Hakuna wanafunzi. Pakia CSV au idhinisha maombi ya usajili.
          </p>
        )}
      </div>
      <p className="mt-2 text-xs" style={{ color: colors.stone }}>
        Jumla: {students.length}
      </p>
    </div>
  );
}
