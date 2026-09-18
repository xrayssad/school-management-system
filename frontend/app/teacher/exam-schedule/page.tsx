"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

type Entry = {
  id: string;
  subject_name?: string;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
  term?: string;
  class_name?: string;
};

export default function TeacherExamSchedulePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ entries: Entry[]; classes: string[] }>("/teacher/exam-schedule")
      .then((d) => {
        setEntries(d.entries || []);
        setClasses(d.classes || []);
      })
      .catch((e) => setError(e.message || "Imeshindikana"));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Ratiba ya mitihani
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Madarasa/masomo yako · {classes.length ? classes.join(", ") : "kama Kamati ilivyopanga"}
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Tarehe</th>
              <th>Darasa</th>
              <th>Somo</th>
              <th>Muda</th>
              <th>Chumba</th>
              <th>Muhula</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t" style={{ borderColor: colors.line }}>
                <td className="px-3 py-2">{e.exam_date || "—"}</td>
                <td>{e.class_name || "—"}</td>
                <td className="font-medium">{e.subject_name || "—"}</td>
                <td style={{ color: colors.stone }}>
                  {[e.start_time, e.end_time].filter(Boolean).join(" – ") || "—"}
                </td>
                <td>{e.room || "—"}</td>
                <td>{e.term || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!entries.length && !error && (
          <p className="p-4 text-sm" style={{ color: colors.stone }}>
            Hakuna ratiba ya mitihani. Kamati ichapishe kwenye ratiba ya mitihani.
          </p>
        )}
      </div>
    </div>
  );
}
