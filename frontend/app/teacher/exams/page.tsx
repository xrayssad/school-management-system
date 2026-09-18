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

export default function TeacherExamsPage() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examId, setExamId] = useState("");
  const [csv, setCsv] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<Exam[]>("/teacher/my-exams")
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setExams(list);
        if (list[0]) setExamId(list[0].id);
      })
      .catch((e) => setErr(e.message || "Imeshindikana kupakia mitihani"))
      .finally(() => setLoading(false));
  }, []);

  async function uploadCsv() {
    setMsg("");
    setErr("");
    if (!examId) {
      setErr("Chagua mtihani (darasa + somo)");
      return;
    }
    if (!csv) {
      setErr("Chagua faili CSV: student_code,marks");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", csv);
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
      setMsg(
        `Imehifadhiwa: mpya ${body.created ?? 0}, sasisha ${body.updated ?? 0}. ` +
          `Status = submitted — wanafunzi hawaoni hadi Kamati ichapishe.`
      );
      if (body.errors?.length) {
        setErr(body.errors.slice(0, 8).join(" · "));
      }
    } catch (e: any) {
      setErr(e.message || "Failed to fetch");
    } finally {
      setBusy(false);
    }
  }

  const exam = exams.find((e) => e.id === examId);

  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Exams & Grades
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Pakia CSV ya alama kwa mtihani mmoja (darasa + somo lako). Mwanafunzi anaona baada ya Kamati kuidhinisha.
      </p>

      <div
        className="mt-4 space-y-3 rounded-xl border bg-white p-4"
        style={{ borderColor: colors.line }}
      >
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
                {ex.title}
                {ex.class_name ? ` (${ex.class_name})` : ""}
                {ex.subject_name ? ` · ${ex.subject_name}` : ""}
              </option>
            ))}
          </select>
          {exam && (
            <p className="mt-1 text-xs" style={{ color: colors.stone }}>
              Darasa: {exam.class_name || "—"} · Somo: {exam.subject_name || "—"} · Max:{" "}
              {exam.total_marks || 100}
            </p>
          )}
          {!exams.length && (
            <p className="mt-1 text-xs" style={{ color: colors.stone }}>
              Hakuna mitihani iliyohusishwa nawe. Kamati / mfumo uunde mtihani kwa teacher_id yako.
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold">CSV (student_code,marks)</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setCsv(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
          <p className="mt-1 text-[11px]" style={{ color: colors.stone }}>
            Wanafunzi wa darasa la mtihani huu tu. Mstari usiolingana na darasa unarukwa.
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={uploadCsv}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: colors.primary }}
        >
          {busy ? "Inapakia…" : "Pakia CSV"}
        </button>
        {msg && (
          <p className="text-sm" style={{ color: colors.primary }}>
            {msg}
          </p>
        )}
        {err && <p className="text-sm text-red-700">{err}</p>}
      </div>
    </div>
  );
}
