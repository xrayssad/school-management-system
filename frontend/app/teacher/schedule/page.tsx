"use client";

import { apiUrl } from "@/lib/media";

import { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";
import { formatSchoolDay } from "@/lib/school-days";

const API = apiUrl();

type Entry = {
  id: string;
  day_of_week?: number | string;
  day_label?: string;
  start_time?: string;
  end_time?: string;
  class_name?: string;
  subject_name?: string;
  status?: string;
};

export default function TeacherSchedulePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("madrasa_token");
    fetch(`${API}/teacher/my-schedule`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof body.detail === "string" ? body.detail : "Imeshindikana");
        setEntries(body.entries || []);
      })
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MadrasaLoader label="Inapakia ratiba…" />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Ratiba yangu
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Kama Kamati ilivyopanga
      </p>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <div
        className="mt-4 overflow-x-auto rounded-xl border bg-white"
        style={{ borderColor: colors.line }}
      >
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Siku</th>
              <th>Muda</th>
              <th>Somo</th>
              <th>Darasa</th>
              <th>Hali</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t" style={{ borderColor: colors.line }}>
                <td className="px-3 py-2">{formatSchoolDay(e.day_of_week, e.day_label)}</td>
                <td>
                  {e.start_time}–{e.end_time}
                </td>
                <td>{e.subject_name || "—"}</td>
                <td>{e.class_name}</td>
                <td className="text-xs">
                  {e.status === "published" ? "Imechapishwa" : e.status || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!entries.length && !error && (
          <p className="p-4 text-sm" style={{ color: colors.stone }}>
            Hakuna vipindi.
          </p>
        )}
      </div>
    </div>
  );
}
