"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

export default function StudentGradesPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/student/my-grades")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Imeshindikana"));
  }, []);

  const grades = data?.grades || [];
  const promo = data?.promotion;
  const repeated = promo?.status === "repeated";
  const promoted = promo?.status === "promoted";

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Matokeo yangu
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Baada ya Kamati kuidhinisha
        {data?.class_name ? ` · ${data.class_name}` : ""}
        {data?.student_code ? ` · ${data.student_code}` : ""}
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {(repeated || promoted) && (
        <div
          className="mt-4 rounded-xl border p-4"
          style={{
            borderColor: repeated ? "#FECACA" : colors.line,
            backgroundColor: repeated ? "#FEF2F2" : "#F0F5F2",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: repeated ? "#991B1B" : colors.primary }}>
            {repeated
              ? "Umerudishwa darasa"
              : "Hongera — umepandishwa darasa"}
          </p>
          <p className="mt-1 text-sm" style={{ color: colors.ink }}>
            {repeated
              ? "Kulingana na wastani wa mitihani ulioidhinishwa, utaendelea katika darasa lile lile."
              : "Kulingana na wastani wa mitihani ulioidhinishwa, umefuzu kupandishwa."}
          </p>
          {promo?.term && (
            <p className="mt-1 text-xs" style={{ color: colors.stone }}>
              Muhula: {promo.term}
            </p>
          )}
          {promo?.note && (
            <p className="mt-1 text-xs" style={{ color: colors.stone }}>
              {promo.note}
            </p>
          )}
        </div>
      )}

      {data?.average != null && (
        <p className="mt-4 text-sm font-medium" style={{ color: colors.primary }}>
          Wastani wa jumla: {data.average}%
        </p>
      )}

      <div className="mt-4 space-y-2">
        {grades.map((g: any, i: number) => (
          <div
            key={i}
            className="rounded-xl border bg-white px-4 py-3 text-sm"
            style={{ borderColor: colors.line }}
          >
            <p className="font-medium">{g.subject_name || g.exam_title}</p>
            <p style={{ color: colors.stone }}>
              {g.marks_obtained}/{g.total_marks || 100} · Grade {g.grade_letter}
            </p>
          </div>
        ))}
        {!grades.length && !error && (
          <p className="text-sm" style={{ color: colors.stone }}>
            Bado hakuna matokeo yaliyoidhinishwa.
          </p>
        )}
      </div>
    </div>
  );
}
