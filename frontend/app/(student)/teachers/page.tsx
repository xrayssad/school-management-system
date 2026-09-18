"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";

export default function StudentTeachersPage() {
  const [className, setClassName] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ class_name: string; teachers: any[] }>("/student/my-teachers")
      .then((d) => {
        setClassName(d.class_name || "");
        setTeachers(d.teachers || []);
      })
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MadrasaLoader label="Inapakia walimu…" />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Walimu wangu
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        {className ? `Darasa: ${className}` : ""} · waliopewa na Kamati pekee
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 space-y-2">
        {teachers.map((t) => (
          <div key={t.user_id} className="rounded-xl border bg-white px-4 py-3 text-sm" style={{ borderColor: colors.line }}>
            <p className="font-medium">{t.full_name}</p>
            <p className="text-xs" style={{ color: colors.stone }}>
              {(t.subjects || []).join(", ") || "—"}
            </p>
          </div>
        ))}
        {!teachers.length && !error && (
          <p className="text-sm" style={{ color: colors.stone }}>
            Hakuna walimu kwenye ratiba ya darasa lako.
          </p>
        )}
      </div>
    </div>
  );
}
