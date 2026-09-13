"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Clock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import type { TimetableEntry, Subject } from "@/lib/types";
import { colors } from "@/lib/colors";

const DAYS = [
  { en: "Monday", sw: "Jumatatu" },
  { en: "Tuesday", sw: "Jumanne" },
  { en: "Wednesday", sw: "Jumatano" },
  { en: "Thursday", sw: "Alhamisi" },
  { en: "Friday", sw: "Ijumaa" },
];
const CLASS_OPTIONS = ["Darasa la 1", "Darasa la 2", "Darasa la 3", "Darasa la 4", "Darasa la 5"];

export default function SchedulePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classFilter, setClassFilter] = useState(CLASS_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState(DAYS[0].en);
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
      setError(err instanceof ApiError ? err.message : "Imeshindikana kuhifadhi kipindi.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Ratiba"
        subtitle="Simamia ratiba ya wiki"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={15} />
            {showForm ? "Ghairi" : "Ongeza kipindi"}
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {CLASS_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setClassFilter(c)}
            className="rounded-full px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: classFilter === c ? colors.primary : colors.soft,
              color: classFilter === c ? "#fff" : colors.primary,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createEntry} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select value={day} onChange={(e) => setDay(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
              {DAYS.map((d) => (
                <option key={d.en} value={d.en}>{d.sw}</option>
              ))}
            </select>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
              <option value="">Chagua somo</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
            <input placeholder="Chumba" value={room} onChange={(e) => setRoom(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
            <button type="submit" className="rounded-full px-4 py-2 text-sm font-medium text-white sm:col-span-2 lg:col-span-5" style={{ backgroundColor: colors.primary }}>
              Hifadhi kipindi
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {DAYS.map((d) => (
            <div key={d.en}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.primary }}>
                {d.sw}
              </h2>
              <div className="space-y-2">
                {entries
                  .filter((e) => e.day_of_week === d.en)
                  .map((entry) => (
                    <div key={entry.id} className="rounded-xl border bg-white p-3" style={{ borderColor: colors.line }}>
                      <p className="flex items-center gap-1 text-xs" style={{ color: colors.stone }}>
                        <Clock size={12} />
                        {entry.start_time} – {entry.end_time}
                      </p>
                      <p className="mt-1 text-sm font-medium" style={{ color: colors.ink }}>
                        {entry.subject?.name ?? entry.entry_type}
                      </p>
                      {entry.room && (
                        <p className="text-xs" style={{ color: colors.stone }}>{entry.room}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
