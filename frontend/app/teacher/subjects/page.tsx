"use client";

import { useEffect, useMemo, useState } from "react";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Flat = {
  class_name: string;
  subject_id: string;
  subject_name: string;
};

export default function TeacherSubjectsPage() {
  const [flat, setFlat] = useState<Flat[]>([]);
  const [byClass, setByClass] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("madrasa_token");
    fetch(`${API}/teacher/my-subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof body.detail === "string" ? body.detail : "Imeshindikana");

        // Support multiple API shapes
        if (Array.isArray(body.flat) && body.flat.length) {
          setFlat(body.flat);
          setByClass(body.by_class || []);
        } else if (Array.isArray(body.subjects) && body.subjects.length) {
          // { subject_id, subject_name, classes: [] }
          const f: Flat[] = [];
          for (const s of body.subjects) {
            const classes = s.classes?.length ? s.classes : ["—"];
            for (const cn of classes) {
              f.push({
                class_name: cn,
                subject_id: s.subject_id,
                subject_name: s.subject_name,
              });
            }
          }
          setFlat(f);
          setByClass(body.by_class || []);
        } else if (Array.isArray(body.by_class)) {
          const f: Flat[] = [];
          for (const block of body.by_class) {
            for (const s of block.subjects || []) {
              f.push({
                class_name: block.class_name,
                subject_id: s.subject_id,
                subject_name: s.subject_name,
              });
            }
          }
          setFlat(f);
          setByClass(body.by_class);
        } else {
          setFlat([]);
          setByClass([]);
        }
      })
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    if (byClass.length) return byClass;
    const map: Record<string, Flat[]> = {};
    for (const row of flat) {
      (map[row.class_name] ||= []).push(row);
    }
    return Object.entries(map).map(([class_name, subjects]) => ({
      class_name,
      subjects: subjects.map((s) => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
      })),
    }));
  }, [byClass, flat]);

  if (loading) return <MadrasaLoader label="Inapakia masomo…" />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Masomo yangu
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Yanayopangwa na Kamati kwenye ratiba
      </p>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 space-y-4">
        {grouped.map((block: any) => (
          <div
            key={block.class_name}
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: colors.line }}
          >
            <p className="text-sm font-semibold" style={{ color: colors.primary }}>
              {block.class_name}
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {(block.subjects || []).map((s: any) => (
                <li key={s.subject_id || s.subject_name}>• {s.subject_name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {!grouped.length && !error && (
        <p className="mt-4 text-sm" style={{ color: colors.stone }}>
          Hakuna masomo. Kamati iweke somo + mwalimu kwenye ratiba.
        </p>
      )}
    </div>
  );
}
