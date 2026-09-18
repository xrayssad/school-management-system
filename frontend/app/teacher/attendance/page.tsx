"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import { Check, Clock, X, Shield } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner } from "@/components/Card";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { colors } from "@/lib/colors";

const CLASS_OPTIONS = ["Darasa la 1", "Darasa la 2", "Darasa la 3", "Darasa la 4", "Darasa la 5"];
const STATUSES = [
  { id: "present" as const, label: "Poa", icon: Check },
  { id: "late" as const, label: "Kuchelewa", icon: Clock },
  { id: "absent" as const, label: "Hajapo", icon: X },
  { id: "excused" as const, label: "Ruhusa", icon: Shield },
];
type Status = (typeof STATUSES)[number]["id"];

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
    const records = students.map((s) => ({
      student_id: s.student_profile!.id,
      status: statuses[s.id],
    }));
    await api.post("/attendance/bulk", { class_name: classFilter, date, records });
    setSaved(true);
  }

  return (
    <div>
      <PageHeader title="Mahudhurio" subtitle="Weka mahudhurio ya kila siku" />

      <div className="mb-6 flex flex-wrap items-center gap-2">
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
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="ml-auto rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <div className="space-y-3">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-0"
                style={{ borderColor: colors.line }}
              >
                <p className="text-sm font-medium" style={{ color: colors.ink }}>{s.full_name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((st) => {
                    const Icon = st.icon;
                    const on = statuses[s.id] === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatuses((m) => ({ ...m, [s.id]: st.id }))}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: on ? colors.primary : colors.soft,
                          color: on ? "#fff" : colors.primary,
                        }}
                      >
                        <Icon size={12} />
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              className="rounded-full px-5 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: colors.primary }}
            >
              Hifadhi mahudhurio
            </button>
            {saved && (
              <span className="text-sm font-medium" style={{ color: colors.primary }}>
                Imehifadhiwa
              </span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
