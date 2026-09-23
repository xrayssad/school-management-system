"use client";
import { resultStatus, statusLabel, statusStyle } from "@/lib/gradeStatus";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type StudentRow = {
  profile_id: string;
  student_code?: string;
  full_name?: string;
  marks_obtained?: number | null;
  grade_letter?: string | null;
  status?: string | null;
};

type SubjectBlock = {
  subject_id: string;
  subject_name: string;
  exam_id?: string | null;
  exam_title?: string | null;
  total_marks: number;
  students: StudentRow[];
};

export default function TeacherExamsPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [className, setClassName] = useState("");
  const [subjects, setSubjects] = useState<SubjectBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // manual entry targets a subject
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [marks, setMarks] = useState("");
  const [busy, setBusy] = useState(false);

  // CSV per subject
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvSubjectId, setCsvSubjectId] = useState("");
  const [busyCsv, setBusyCsv] = useState(false);

  const token = () => localStorage.getItem("madrasa_token");

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/teacher/my-teaching-scope`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.detail || "Imeshindikana");
        const cls: string[] = body.classes || [];
        setClasses(cls);
        if (cls[0]) setClassName(cls[0]);
      })
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  const loadBoard = useCallback(async (cn: string) => {
    if (!cn) {
      setSubjects([]);
      return;
    }
    setBoardLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/teacher/class-exam-board?class_name=${encodeURIComponent(cn)}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || "Imeshindikana");
      const list: SubjectBlock[] = body.subjects || [];
      setSubjects(list);
      if (list[0]?.subject_id) {
        setActiveSubjectId(list[0].subject_id);
        setCsvSubjectId(list[0].subject_id);
      }
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
      setSubjects([]);
    } finally {
      setBoardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (className) loadBoard(className);
  }, [className, loadBoard]);

  async function ensureExamId(subjectId: string): Promise<string> {
    const block = subjects.find((s) => s.subject_id === subjectId);
    if (block?.exam_id) return block.exam_id;
    const res = await fetch(
      `${API}/teacher/ensure-exam?class_name=${encodeURIComponent(className)}&subject_id=${encodeURIComponent(subjectId)}`,
      { method: "POST", headers: { Authorization: `Bearer ${token()}` } }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.detail || "Imeshindikana kuunda mtihani");
    return body.exam_id as string;
  }

  async function saveManual(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!activeSubjectId || !studentCode.trim() || marks === "") {
      setError("Chagua somo, namba na alama");
      return;
    }
    setBusy(true);
    try {
      const examId = await ensureExamId(activeSubjectId);
      const res = await fetch(`${API}/teacher/exams/${examId}/grade-one`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: examId,
          student_code: studentCode.trim(),
          marks_obtained: parseFloat(marks),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const d = body.detail;
        throw new Error(typeof d === "string" ? d : JSON.stringify(d || body));
      }
      setMsg(`${body.full_name}: ${body.marks_obtained} (${body.grade_letter}) · submitted`);
      setStudentCode("");
      setMarks("");
      await loadBoard(className);
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    } finally {
      setBusy(false);
    }
  }

  async function uploadCsv(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!csvSubjectId || !csvFile) {
      setError("Chagua somo na CSV");
      return;
    }
    setBusyCsv(true);
    try {
      const examId = await ensureExamId(csvSubjectId);
      const fd = new FormData();
      fd.append("file", csvFile);
      const res = await fetch(`${API}/teacher/exams/${examId}/grades-csv`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const d = body.detail;
        throw new Error(typeof d === "string" ? d : JSON.stringify(d || body));
      }
      setMsg("CSV imehifadhiwa · submitted");
      setCsvFile(null);
      await loadBoard(className);
    } catch (err: any) {
      setError(err.message || "CSV imeshindikana");
    } finally {
      setBusyCsv(false);
    }
  }

  if (loading) return <MadrasaLoader label="Inapakia madarasa yako…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Exams & Grades
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          Madarasa unayofundisha · masomo yako · jedwali la wanafunzi kwa kila somo
        </p>
      </div>

      {msg && (
        <p className="text-sm" style={{ color: colors.primary }}>
          {msg}
        </p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* Class dropdown — only teaching classes */}
      <div>
        <label className="text-xs font-semibold">Darasa *</label>
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="mt-1 w-full max-w-md rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        >
          {!classes.length && <option value="">Huna darasa lililopangwa</option>}
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Entry forms */}
      {className && subjects.length > 0 && (
        <>
          <form
            onSubmit={saveManual}
            className="space-y-3 rounded-xl border bg-white p-4"
            style={{ borderColor: colors.line }}
          >
            <p className="text-sm font-semibold" style={{ color: colors.primary }}>
              Weka alama (mkono)
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium">Somo lako *</label>
                <select
                  value={activeSubjectId}
                  onChange={(e) => setActiveSubjectId(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: colors.line }}
                >
                  {subjects.map((s) => (
                    <option key={s.subject_id} value={s.subject_id}>
                      {s.subject_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Namba ya usajili *</label>
                <input
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: colors.line }}
                  placeholder="STU90001"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Alama *</label>
                <input
                  type="number"
                  step="0.01"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: colors.line }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: colors.primary }}
            >
              {busy ? "…" : "Hifadhi alama"}
            </button>
          </form>

          <form
            onSubmit={uploadCsv}
            className="space-y-3 rounded-xl border bg-white p-4"
            style={{ borderColor: colors.line }}
          >
            <p className="text-sm font-semibold" style={{ color: colors.primary }}>
              CSV kwa somo
            </p>
            <select
              value={csvSubjectId}
              onChange={(e) => setCsvSubjectId(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: colors.line }}
            >
              {subjects.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_name}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="block text-sm"
            />
            <button
              type="submit"
              disabled={busyCsv}
              className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-60"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              {busyCsv ? "…" : "Pakia CSV"}
            </button>
          </form>
        </>
      )}

      {/* Tables per subject */}
      {boardLoading ? (
        <MadrasaLoader label="Inapakia masomo na wanafunzi…" />
      ) : (
        <div className="space-y-6">
          {subjects.map((s) => (
            <div
              key={s.subject_id}
              className="rounded-xl border bg-white"
              style={{ borderColor: colors.line }}
            >
              <div
                className="border-b px-4 py-3"
                style={{ borderColor: colors.line }}
              >
                <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                  {s.subject_name}
                </p>
                <p className="text-xs" style={{ color: colors.stone }}>
                  {className}
                  {s.exam_title ? ` · ${s.exam_title}` : " · mtihani utaundwa unapoweka alama"}
                  {` · /${s.total_marks}`}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="text-xs" style={{ color: colors.stone }}>
                      <th className="px-3 py-2">Namba</th>
                      <th>Jina</th>
                      <th>Alama</th>
                      <th>Grade</th>
                      <th>Status</th>
                        <th>Hali</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.students.map((st) => {
                      const rs = resultStatus(st.grade_letter, st.marks_obtained as number | null);
                      return (
                      <tr
                        key={st.profile_id}
                        className="border-t"
                        style={{ borderColor: colors.line }}
                      >
                        <td className="px-3 py-2 font-medium">{st.student_code}</td>
                        <td>{st.full_name}</td>
                        <td>{st.marks_obtained ?? "—"}</td>
                        <td>{st.grade_letter ?? "—"}</td>
                        <td>
                          <span className="inline-block rounded px-2 py-0.5 text-xs font-bold" style={statusStyle(rs)}>
                            {statusLabel(rs)}
                          </span>
                        </td>
                        <td className="text-xs">
                          {!st.status
                            ? "Bado"
                            : st.status === "published"
                              ? "Imechapishwa"
                              : "Inasubiri Kamati"}
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
                {!s.students.length && (
                  <p className="p-4 text-sm" style={{ color: colors.stone }}>
                    Hakuna wanafunzi katika darasa hili.
                  </p>
                )}
              </div>
            </div>
          ))}
          {className && !subjects.length && (
            <p className="text-sm" style={{ color: colors.stone }}>
              Hakuna masomo yaliyopangwa na Kamati kwa darasa hili / kwako.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
