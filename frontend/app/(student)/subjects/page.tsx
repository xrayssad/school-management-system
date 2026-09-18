"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";

export default function StudentSubjectsPage() {
  const [className, setClassName] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ class_name: string; subjects: any[] }>("/student/my-subjects")
      .then((d) => {
        setClassName(d.class_name || "");
        setSubjects(d.subjects || []);
      })
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MadrasaLoader label="Inapakia masomo…" />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Masomo ninayosoma
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        {className ? `Darasa: ${className}` : ""} · kama Kamati ilivyopanga
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 space-y-2">
        {subjects.map((s) => (
          <div key={s.subject_id || s.subject_name} className="rounded-xl border bg-white px-4 py-3 text-sm" style={{ borderColor: colors.line }}>
            <p className="font-medium">{s.subject_name}</p>
            {s.teacher_name && (
              <p className="text-xs" style={{ color: colors.stone }}>Mwalimu: {s.teacher_name}</p>
            )}
          </div>
        ))}
        {!subjects.length && !error && (
          <p className="text-sm" style={{ color: colors.stone }}>
            Hakuna masomo kwenye ratiba ya darasa lako.
          </p>
        )}
      </div>
    </div>
  );
}
