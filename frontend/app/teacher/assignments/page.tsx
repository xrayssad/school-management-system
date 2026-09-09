"use client";

import { useEffect, useState, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api, ApiError } from "@/lib/api";
import type { Assignment, Subject, Submission } from "@/lib/types";

const CLASS_OPTIONS = ["Darasa la 3", "Darasa la 4", "Darasa la 5", "Darasa la 6"];

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Assignment | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classFilter, setClassFilter] = useState(CLASS_OPTIONS[0]);
  const [dueDate, setDueDate] = useState("");

  function load() {
    api.get<Assignment[]>("/assignments").then(setAssignments).finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    api.get<Subject[]>("/subjects").then(setSubjects);
  }, []);

  async function createAssignment(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/assignments", { title, description, subject_id: subjectId || null, class_name: classFilter, due_date: dueDate, total_marks: 100 });
      setShowForm(false);
      setTitle("");
      setDescription("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create assignment.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Set homework and review submissions"
        action={
          <button onClick={() => setShowForm((s) => !s)} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            {showForm ? "Cancel" : "New assignment"}
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createAssignment} className="grid gap-3 sm:grid-cols-2">
            <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm">
              <option value="">Subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm">
              {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm sm:col-span-2" rows={2} />
            <button type="submit" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 sm:col-span-2">
              Create assignment
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      {assignments.length === 0 ? (
        <EmptyState title="No assignments yet" />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-ink-400">{a.subject?.name} &middot; {a.class_name}</p>
                <h3 className="font-serif text-lg font-semibold text-ink">{a.title}</h3>
                <p className="text-xs text-ink-400">Due {new Date(a.due_date).toLocaleDateString()} &middot; {a.submission_count} submissions</p>
              </div>
              <button onClick={() => setViewing(a)} className="rounded-full border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50">
                View submissions
              </button>
            </Card>
          ))}
        </div>
      )}

      {viewing && <SubmissionsModal assignment={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function SubmissionsModal({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Submission[]>(`/assignments/${assignment.id}/submissions`)
      .then((subs) => {
        setSubmissions(subs);
        const m: Record<string, string> = {};
        subs.forEach((s) => { if (s.marks_obtained !== null) m[s.id] = String(s.marks_obtained); });
        setMarks(m);
      })
      .finally(() => setLoading(false));
  }, [assignment]);

  async function grade(subId: string) {
    const value = marks[subId];
    if (value === undefined || value === "") return;
    setSavingId(subId);
    try {
      const updated = await api.put<Submission>(`/assignments/submissions/${subId}/grade`, { marks_obtained: Number(value) });
      setSubmissions((prev) => prev.map((s) => (s.id === subId ? updated : s)));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl2 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">{assignment.title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink">&#10005;</button>
        </div>

        {loading ? (
          <Spinner />
        ) : submissions.length === 0 ? (
          <p className="mt-4 text-sm text-ink-400">No submissions yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {submissions.map((s) => (
              <div key={s.id} className="border-b border-sage pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <Badge tone={s.status === "graded" ? "teal" : s.status === "late" ? "red" : "gold"}>{s.status}</Badge>
                </div>
                {s.content && <p className="mt-2 text-sm text-ink-600">{s.content}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={assignment.total_marks}
                    value={marks[s.id] ?? ""}
                    onChange={(e) => setMarks((m) => ({ ...m, [s.id]: e.target.value }))}
                    className="w-20 rounded-lg border border-teal-100 px-2 py-1.5 text-sm"
                    placeholder="Marks"
                  />
                  <button
                    onClick={() => grade(s.id)}
                    disabled={savingId === s.id}
                    className="rounded-full bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                  >
                    {savingId === s.id ? "\u2026" : "Save grade"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
