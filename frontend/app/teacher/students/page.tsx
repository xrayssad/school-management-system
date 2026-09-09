"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function TeacherStudentsPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<string[]>("/students/classes").then((c) => {
      setClasses(c);
      setSelected(c[0] ?? "");
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api
      .get<User[]>(`/students?class_name=${encodeURIComponent(selected)}`)
      .then(setStudents)
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div>
      <PageHeader title="Students" subtitle="Browse students by class" />

      <div className="mb-6 flex flex-wrap gap-2">
        {classes.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selected === c ? "bg-teal-700 text-white" : "bg-sage text-ink-600 hover:bg-sage-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : students.length === 0 ? (
        <EmptyState title="No students in this class yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <Card key={s.id}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage font-serif text-sm font-semibold text-teal-800">
                {s.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <h3 className="mt-3 font-serif text-base font-semibold text-ink">{s.full_name}</h3>
              <p className="text-xs text-ink-400">{s.student_profile?.student_code}</p>
              {s.student_profile?.guardian_name && (
                <p className="mt-2 text-xs text-ink-400">Guardian: {s.student_profile.guardian_name}</p>
              )}
              {s.student_profile?.guardian_phone && <p className="text-xs text-ink-400">{s.student_profile.guardian_phone}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
