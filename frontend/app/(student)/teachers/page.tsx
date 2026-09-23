"use client";

import { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type T = {
  user_id: string;
  full_name: string;
  email?: string;
  subjects: string[];
};

export default function StudentTeachersPage() {
  const [teachers, setTeachers] = useState<T[]>([]);
  const [className, setClassName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("madrasa_token");
    fetch(`${API}/student/my-teachers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.detail || "Imeshindikana");
        setClassName(body.class_name || null);
        setTeachers(body.teachers || []);
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
        Darasa: {className || "—"} · kutoka ratiba ya Kamati
      </p>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {teachers.map((t) => (
          <div
            key={t.user_id}
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: colors.line }}
          >
            <p className="font-semibold" style={{ color: colors.primary }}>
              {t.full_name}
            </p>
            <p className="text-xs" style={{ color: colors.stone }}>
              {t.email}
            </p>
            <p className="mt-2 text-sm">{t.subjects?.join(", ") || "—"}</p>
          </div>
        ))}
      </div>
      {!teachers.length && !error && (
        <p className="mt-4 text-sm" style={{ color: colors.stone }}>
          Hakuna mwalimu kwenye ratiba ya darasa lako. Kamati iunganishe mwalimu + darasa.
        </p>
      )}
    </div>
  );
}
