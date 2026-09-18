"use client";
import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Exam = {
  id: string;
  title: string;
  class_name?: string;
  subject_name?: string;
  total_marks?: number;
};

export default function TeacherGradesPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examId, setExamId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<Exam[]>("/teacher/my-exams")
      .then((d) => {
        setExams(Array.isArray(d) ? d : []);
        if (Array.isArray(d) && d[0]) setExamId(d[0].id);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Imeshindikana kupakia mitihani"));
  }, []);

  async function uploadCsv() {
    setMsg("");
    setErr("");
    setResult(null);
    if (!examId) {
      setErr("Chagua mtihani");
      return;
    }
    if (!file) {
      setErr("Chagua faili CSV (student_code,marks)");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("madrasa_token");
      const res = await fetch(`${API}/teacher/exams/${examId}/grades-csv`, {
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
      setResult(body);
      setMsg(
        `Imehifadhiwa: +${body.created ?? 0} mpya, ${body.updated ?? 0} kusasishwa. Kamati ichapishe ili mwanafunzi aone.`
      );
    } catch (e: any) {
      setErr(e.message || "Failed to fetch");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Matokeo — CSV
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Chagua mtihani wa darasa/somo lako, kisha pakia CSV: student_code,marks
      </p>

      <div className="mt-4 space-y-3 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <div>
          <label className="text-xs font-semibold">Mtihani</label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          >
            <option value="">— chagua —</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} {ex.class_name ? `(${ex.class_name})` : ""} {ex.subject_name || ""}
              </option>
            ))}
          </select>
          {!exams.length && (
            <p className="mt-1 text-xs" style={{ color: colors.stone }}>
              Hakuna mitihani iliyohusishwa nawe. Kamati / mfumo uunde mtihani kwa teacher_id yako.
            </p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold">CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={uploadCsv}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: colors.primary }}
        >
          {busy ? "…" : "Pakia alama CSV"}
        </button>
        {msg && <p className="text-sm" style={{ color: colors.primary }}>{msg}</p>}
        {err && <p className="text-sm text-red-700">{err}</p>}
        {result?.errors?.length > 0 && (
          <ul className="max-h-40 list-disc overflow-y-auto pl-4 text-xs text-red-800">
            {result.errors.map((e: string, i: number) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
