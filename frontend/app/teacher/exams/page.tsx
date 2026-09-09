"use client";

import { useEffect, useState, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import type { Exam, Subject, User, Grade } from "@/lib/types";

const CLASS_OPTIONS = ["Darasa la 3", "Darasa la 4", "Darasa la 5", "Darasa la 6"];

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
      await api.post("/exams", { title, subject_id: subjectId || null, class_name: classFilter, exam_date: examDate, total_marks: totalMarks });
      setShowForm(false);
      setTitle("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create exam.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Exams & grades"
        subtitle="Create exams and record student scores"
        action={
          <button onClick={() => setShowForm((s) => !s)} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            {showForm ? "Cancel" : "New exam"}
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createExam} className="grid gap-3 sm:grid-cols-5">
            <input required placeholder="Exam title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm sm:col-span-2" />
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm">
              <option value="">Subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm">
              {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" required value={examDate} onChange={(e) => setExamDate(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <input type="number" min={1} value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" placeholder="Total marks" />
            <button type="submit" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 sm:col-span-5">
              Create exam
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      {exams.length === 0 ? (
        <EmptyState title="No exams yet" description="Create your first exam to start recording grades." />
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-ink-400">{exam.subject?.name} &middot; {exam.class_name}</p>
                <h3 className="font-serif text-lg font-semibold text-ink">{exam.title}</h3>
                <p className="text-xs text-ink-400">{new Date(exam.exam_date).toLocaleDateString()} &middot; out of {exam.total_marks}</p>
              </div>
              <button onClick={() => setGradingExam(exam)} className="rounded-full border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50">
                Enter grades
              </button>
            </Card>
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
      await api.post("/grades", { exam_id: exam.id, student_id: studentId, marks_obtained: Number(value) });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl2 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">{exam.title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink">&#10005;</button>
        </div>
        <p className="mt-1 text-sm text-ink-400">{exam.class_name} &middot; out of {exam.total_marks}</p>

        {loading ? (
          <Spinner />
        ) : (
          <div className="mt-4 space-y-3">
            {students.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{s.full_name}</p>
                  {existingGrades[s.id] && <p className="text-xs text-ink-400">Current: {existingGrades[s.id].grade_letter}</p>}
                </div>
                <input
                  type="number"
                  min={0}
                  max={exam.total_marks}
                  value={marks[s.id] ?? ""}
                  onChange={(e) => setMarks((m) => ({ ...m, [s.id]: e.target.value }))}
                  className="w-20 rounded-lg border border-teal-100 px-2 py-1.5 text-sm"
                />
                <button
                  onClick={() => saveGrade(s.id)}
                  disabled={savingId === s.id}
                  className="rounded-full bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {savingId === s.id ? "\u2026" : "Save"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
