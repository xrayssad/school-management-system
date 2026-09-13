"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, GraduationCap, X, Save } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import type { Exam, Subject, User, Grade } from "@/lib/types";
import { colors } from "@/lib/colors";

const CLASS_OPTIONS = ["Darasa la 1", "Darasa la 2", "Darasa la 3", "Darasa la 4", "Darasa la 5"];

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classFilter, setClassFilter] = useState(CLASS_OPTIONS[0]);
  const [examDate, setExamDate] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [gradingExam, setGradingExam] = useState<Exam | null>(null);

  function load() {
    api.get<Exam[]>("/exams").then(setExams).finally(() => setLoading(false));
  }
  useEffect(load, []);
  useEffect(() => {
    api.get<Subject[]>("/subjects").then(setSubjects);
  }, []);

  async function createExam(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/exams", {
        title,
        subject_id: subjectId || null,
        class_name: classFilter,
        exam_date: examDate,
        total_marks: totalMarks,
      });
      setShowForm(false);
      setTitle("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Imeshindikana kuunda mtihani.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Mitihani na alama"
        subtitle="Unda mitihani na weka alama za wanafunzi"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={15} />
            {showForm ? "Ghairi" : "Mtihani mpya"}
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createExam} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input required placeholder="Jina la mtihani" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" style={{ borderColor: colors.line }} />
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
              <option value="">Somo</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input type="date" required value={examDate} onChange={(e) => setExamDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
            <input type="number" min={1} value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} placeholder="Alama kamili" />
            <button type="submit" className="rounded-full px-4 py-2 text-sm font-medium text-white sm:col-span-2 lg:col-span-3" style={{ backgroundColor: colors.primary }}>
              Hifadhi mtihani
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      {exams.length === 0 ? (
        <EmptyState title="Hakuna mitihani bado" description="Unda mtihani wa kwanza ili kuanza kuweka alama." />
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div key={exam.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: colors.soft, color: colors.primary }}>
                  <GraduationCap size={18} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: colors.stone }}>
                    {exam.subject?.name} · {exam.class_name}
                  </p>
                  <h3 className="font-serif text-lg font-semibold" style={{ color: colors.ink }}>{exam.title}</h3>
                  <p className="text-xs" style={{ color: colors.stone }}>
                    {new Date(exam.exam_date).toLocaleDateString("sw-TZ")} · kati ya {exam.total_marks}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGradingExam(exam)}
                className="rounded-full border px-4 py-2 text-sm font-medium"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Weka alama
              </button>
            </div>
          ))}
        </div>
      )}

      {gradingExam && <GradingModal exam={gradingExam} onClose={() => setGradingExam(null)} />}
    </div>
  );
}

function GradingModal({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const [students, setStudents] = useState<User[]>([]);
  const [existingGrades, setExistingGrades] = useState<Record<string, Grade>>({});
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<User[]>(`/students?class_name=${encodeURIComponent(exam.class_name)}`),
      api.get<Grade[]>(`/grades/exam/${exam.id}`),
    ]).then(([studentList, grades]) => {
      setStudents(studentList);
      const gmap: Record<string, Grade> = {};
      const mmap: Record<string, string> = {};
      grades.forEach((g) => {
        gmap[g.student_id] = g;
        mmap[g.student_id] = String(g.marks_obtained);
      });
      setExistingGrades(gmap);
      setMarks(mmap);
      setLoading(false);
    });
  }, [exam]);

  async function saveGrade(studentId: string) {
    const value = marks[studentId];
    if (value === undefined || value === "") return;
    setSavingId(studentId);
    try {
      await api.post("/grades", {
        exam_id: exam.id,
        student_id: studentId,
        marks_obtained: Number(value),
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold" style={{ color: colors.ink }}>{exam.title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1" style={{ color: colors.stone }}>
            <X size={18} />
          </button>
        </div>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          {exam.class_name} · kati ya {exam.total_marks}
        </p>
        {loading ? (
          <Spinner />
        ) : (
          <div className="mt-4 space-y-3">
            {students.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.ink }}>{s.full_name}</p>
                  {existingGrades[s.id] && (
                    <p className="text-xs" style={{ color: colors.stone }}>
                      Sasa: {existingGrades[s.id].grade_letter}
                    </p>
                  )}
                </div>
                <input
                  type="number"
                  min={0}
                  max={exam.total_marks}
                  value={marks[s.id] ?? ""}
                  onChange={(e) => setMarks((m) => ({ ...m, [s.id]: e.target.value }))}
                  className="w-20 rounded-lg border px-2 py-1.5 text-sm"
                  style={{ borderColor: colors.line }}
                />
                <button
                  type="button"
                  onClick={() => saveGrade(s.id)}
                  disabled={savingId === s.id}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Save size={12} />
                  {savingId === s.id ? "…" : "Hifadhi"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
