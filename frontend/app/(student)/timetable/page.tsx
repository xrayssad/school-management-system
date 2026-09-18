"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

type Entry = {
  id?: string;
  day_label?: string;
  day_of_week?: string | number;
  start_time?: string;
  end_time?: string;
  subject_name?: string;
  teacher_name?: string;
  class_name?: string;
  status?: string;
};

export default function StudentTimetablePage() {
  const [className, setClassName] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ class_name: string | null; entries: Entry[]; note?: string; error?: string }>(
        "/student/my-timetable"
      )
      .then((d) => {
        setClassName(d.class_name);
        setEntries(Array.isArray(d.entries) ? d.entries : []);
        if (d.error) setError(d.error);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Imeshindikana kupakia ratiba"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Ratiba
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        {className ? `Darasa: ${className}` : "Ratiba ya darasa lako"}
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm" style={{ color: colors.stone }}>Inapakia…</p>
      ) : (
        <div className="mt-6 space-y-2">
          {entries.map((e, i) => (
            <div
              key={e.id || i}
              className="rounded-xl border bg-white px-4 py-3 text-sm"
              style={{ borderColor: colors.line }}
            >
              <p className="font-medium" style={{ color: colors.ink }}>
                {e.subject_name || "Somo"}
              </p>
              <p style={{ color: colors.stone }}>
                {e.day_label || e.day_of_week} · {e.start_time}–{e.end_time}
                {e.teacher_name ? ` · ${e.teacher_name}` : ""}
              </p>
            </div>
          ))}
          {!entries.length && !error && (
            <p className="text-sm" style={{ color: colors.stone }}>
              Hakuna ratiba kwa darasa lako. Kamati inaweza kuipanga kwenye Ratiba.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
