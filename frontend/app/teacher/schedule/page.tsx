"use client";

import { useEffect, useState, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import type { TimetableEntry, Subject } from "@/lib/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CLASS_OPTIONS = ["Darasa la 3", "Darasa la 4", "Darasa la 5", "Darasa la 6"];

export default function SchedulePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classFilter, setClassFilter] = useState(CLASS_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [day, setDay] = useState(DAYS[0]);
  const [subjectId, setSubjectId] = useState("");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("09:00");
  const [room, setRoom] = useState("");

  function load() {
    setLoading(true);
    api
      .get<TimetableEntry[]>(`/timetable?class_name=${encodeURIComponent(classFilter)}`)
      .then(setEntries)
      .finally(() => setLoading(false));
  }

  useEffect(load, [classFilter]);
  useEffect(() => {
    api.get<Subject[]>("/subjects").then(setSubjects);
  }, []);

  async function createEntry(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/timetable", {
        day_of_week: day,
        class_name: classFilter,
        subject_id: subjectId || null,
        start_time: start,
        end_time: end,
        room,
        entry_type: "lesson",
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create entry.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle="Manage the weekly timetable"
        action={
          <button onClick={() => setShowForm((s) => !s)} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            {showForm ? "Cancel" : "Add lesson"}
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {CLASS_OPTIONS.map((c) => (
          <button
            key={c}
            onClick={() => setClassFilter(c)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              classFilter === c ? "bg-teal-700 text-white" : "bg-sage text-ink-600"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createEntry} className="grid gap-3 sm:grid-cols-5">
            <select value={day} onChange={(e) => setDay(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm">
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <input placeholder="Room" value={room} onChange={(e) => setRoom(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 sm:col-span-5">
              Save lesson
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          {DAYS.map((d) => (
            <div key={d}>
              <h2 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wide text-teal-800">{d}</h2>
              <div className="space-y-3">
                {entries.filter((e) => e.day_of_week === d).map((entry) => (
                  <Card key={entry.id}>
                    <p className="text-xs text-ink-400">{entry.start_time} &ndash; {entry.end_time}</p>
                    <p className="mt-1 font-medium text-ink">{entry.subject?.name ?? entry.entry_type}</p>
                    {entry.room && <p className="text-xs text-ink-400">{entry.room}</p>}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
