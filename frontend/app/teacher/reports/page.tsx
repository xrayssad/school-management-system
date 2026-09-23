"use client";
import { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function TeacherReportsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API}/exam-reports/published`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("madrasa_token")}` },
    })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <MadrasaLoader />;
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Ripoti</h1>
      <p className="text-sm" style={{ color: colors.stone }}>PDF za tathmini na wanafunzi bora</p>
      {!items.length && <p className="text-sm" style={{ color: colors.stone }}>Hakuna ripoti bado.</p>}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="flex justify-between gap-2 rounded-lg border bg-white px-4 py-3 text-sm" style={{ borderColor: colors.line }}>
            <span>{p.title}{p.term ? ` · ${p.term}` : ""}</span>
            <a className="font-semibold underline" style={{ color: colors.primary }}
              href={p.file_url?.startsWith("http") ? p.file_url : `http://localhost:8000${p.file_url}`}
              target="_blank" rel="noreferrer">Pakua</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
