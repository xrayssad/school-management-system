"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

export default function TeacherSchedulePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ entries: any[] }>("/teacher/my-schedule")
      .then((d) => setEntries(d.entries || []))
      .catch((e) => setError(e instanceof Error ? e.message : "Imeshindikana"));
  }, []);

  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Ratiba yangu</h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>Kama ilivyopangwa na Kamati</p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 space-y-2">
        {entries.map((e, i) => (
          <div key={e.id || i} className="rounded-xl border bg-white px-4 py-3 text-sm" style={{ borderColor: colors.line }}>
            <p className="font-medium">{e.subject_name || "Somo"} · {e.class_name}</p>
            <p style={{ color: colors.stone }}>
              {e.day_label || e.day_of_week} · {e.start_time}–{e.end_time}
              {e.status ? ` · ${e.status}` : ""}
            </p>
          </div>
        ))}
        {!entries.length && !error && (
          <p className="text-sm" style={{ color: colors.stone }}>Hakuna vipindi vilivyopangwa kwako.</p>
        )}
      </div>
    </div>
  );
}
