"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner } from "@/components/Card";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

const CLASS_OPTIONS = ["Darasa la 3", "Darasa la 4", "Darasa la 5", "Darasa la 6"];
const STATUSES = ["present", "late", "absent", "excused"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_COLORS: Record<Status, string> = {
  present: "#0F5F53",
  late: "#B8862F",
  absent: "#D32F2F",
  excused: "#66716B",
};

export default function TeacherAttendancePage() {
  const [classFilter, setClassFilter] = useState(CLASS_OPTIONS[0]);
  const [students, setStudents] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get<User[]>(`/students?class_name=${encodeURIComponent(classFilter)}`)
      .then((list) => {
        setStudents(list);
        setStatuses(Object.fromEntries(list.map((s) => [s.id, "present" as Status])));
      })
      .finally(() => setLoading(false));
  }, [classFilter]);

  async function save() {
    setSaved(false);
    const records = students.map((s) => ({ student_id: s.student_profile!.id, status: statuses[s.id] }));
    await api.post("/attendance/bulk", { class_name: classFilter, date, records });
    setSaved(true);
  }

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark daily attendance for your class" />

      <div className="mb-6 flex flex-wrap items-center gap-3">
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
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ml-auto rounded-lg border border-teal-100 px-3 py-2 text-sm" />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <div className="space-y-3">
            {students.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-sage pb-3 last:border-0">
                <p className="text-sm font-medium text-ink">{s.full_name}</p>
                <div className="flex gap-2">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatuses((m) => ({ ...m, [s.id]: status }))}
                      className="rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors"
                      style={{
                        backgroundColor: statuses[s.id] === status ? STATUS_COLORS[status] : "#E7EFE9",
                        color: statuses[s.id] === status ? "white" : "#3A443F",
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={save} className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800">
              Save attendance
            </button>
            {saved && <span className="text-sm text-teal-700">Saved!</span>}
          </div>
        </Card>
      )}
    </div>
  );
}
