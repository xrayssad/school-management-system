"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

export default function TeacherSubjectsPage() {
  const [byClass, setByClass] = useState<{ class_name: string; subjects: any[] }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ by_class: any[] }>("/teacher/my-subjects")
      .then((d) => setByClass(d.by_class || []))
      .catch((e) => setError(e.message || "Imeshindikana"));
  }, []);

  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Masomo ninayofundisha
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Kulingana na ratiba iliyopangwa na Kamati
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 space-y-4">
        {byClass.map((block) => (
          <div key={block.class_name} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
            <p className="text-sm font-semibold" style={{ color: colors.primary }}>
              {block.class_name}
            </p>
            <ul className="mt-2 space-y-1">
              {(block.subjects || []).map((s: any) => (
                <li key={s.subject_id || s.subject_name} className="text-sm">
                  {s.subject_name}
                </li>
              ))}
              {!block.subjects?.length && (
                <li className="text-xs" style={{ color: colors.stone }}>Hakuna somo</li>
              )}
            </ul>
          </div>
        ))}
        {!byClass.length && !error && (
          <p className="text-sm" style={{ color: colors.stone }}>
            Hakuna masomo kwenye ratiba yako.
          </p>
        )}
      </div>
    </div>
  );
}
