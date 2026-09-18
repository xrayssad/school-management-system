"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

export default function TeacherStudentsPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    api
      .get<{ classes: string[]; students: any[]; note?: string }>("/teacher/my-students")
      .then((d) => {
        setClasses(d.classes || []);
        setStudents(d.students || []);
        setNote(d.note || "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Imeshindikana"));
  }, []);

  const shown = filter ? students.filter((s) => s.class_name === filter) : students;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Wanafunzi wangu</h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Madarasa uliyopangiwa na Kamati pekee
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {note && <p className="mt-3 text-sm" style={{ color: colors.stone }}>{note}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilter("")} className="rounded-lg border px-3 py-1 text-xs" style={{ borderColor: colors.line }}>
          Yote ({students.length})
        </button>
        {classes.map((c) => (
          <button key={c} type="button" onClick={() => setFilter(c)} className="rounded-lg border px-3 py-1 text-xs" style={{ borderColor: filter === c ? colors.primary : colors.line, color: colors.primary }}>
            {c}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Jina</th>
              <th>Namba</th>
              <th>Darasa</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.profile_id || s.user_id} className="border-t" style={{ borderColor: colors.line }}>
                <td className="px-3 py-2">{s.full_name}</td>
                <td>{s.student_code || "—"}</td>
                <td>{s.class_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && <p className="p-4 text-xs" style={{ color: colors.stone }}>Hakuna wanafunzi kwa upeo wako.</p>}
      </div>
    </div>
  );
}
