"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";

type ExamEntry = {
  id: string;
  subject_name?: string;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
};

type GradeRow = {
  marks_obtained?: number;
  grade_letter?: string;
  exam_title?: string;
  total_marks?: number;
  subject_name?: string;
};

export default function StudentExamsPage() {
  const [className, setClassName] = useState("");
  const [schedule, setSchedule] = useState<ExamEntry[]>([]);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [promo, setPromo] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"schedule" | "results">("schedule");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<{ class_name: string; entries: ExamEntry[] }>("/student/exam-schedule"),
      api.get<any>("/student/my-grades"),
    ])
      .then(([sch, g]) => {
        setClassName(sch.class_name || g.class_name || "");
        setSchedule(sch.entries || []);
        setGrades(g.grades || []);
        setAverage(g.average ?? null);
        setPromo(g.promotion || null);
      })
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MadrasaLoader label="Inapakia mitihani na matokeo…" />;

  const repeated = promo?.status === "repeated";
  const promoted = promo?.status === "promoted" || promo?.status === "graduated";

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Mitihani na matokeo
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        {className ? `Darasa: ${className}` : "Darasa lako"}
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex gap-2">
        {[
          ["schedule", "Ratiba ya mitihani"],
          ["results", "Matokeo yangu"],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k as "schedule" | "results")}
            className="rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{
              borderColor: tab === k ? colors.primary : colors.line,
              backgroundColor: tab === k ? colors.primary : "#fff",
              color: tab === k ? "#fff" : colors.stone,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "schedule" && (
        <div className="mt-4 overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-xs" style={{ color: colors.stone }}>
                <th className="px-3 py-2">Tarehe</th>
                <th>Somo</th>
                <th>Muda</th>
                <th>Chumba</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((e) => (
                <tr key={e.id} className="border-t" style={{ borderColor: colors.line }}>
                  <td className="px-3 py-2">{e.exam_date || "—"}</td>
                  <td className="font-medium">{e.subject_name || "—"}</td>
                  <td style={{ color: colors.stone }}>
                    {[e.start_time, e.end_time].filter(Boolean).join(" – ") || "—"}
                  </td>
                  <td>{e.room || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!schedule.length && (
            <p className="p-4 text-sm" style={{ color: colors.stone }}>
              Hakuna ratiba ya mitihani kwa darasa hili.
            </p>
          )}
        </div>
      )}

      {tab === "results" && (
        <div className="mt-4 space-y-3">
          {(repeated || promoted) && (
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: repeated ? "#FECACA" : colors.line,
                backgroundColor: repeated ? "#FEF2F2" : "#F0F5F2",
              }}
            >
              <p className="text-sm font-semibold" style={{ color: repeated ? "#991B1B" : colors.primary }}>
                {repeated
                  ? "Umerudishwa darasa"
                  : promo?.status === "graduated"
                    ? "Hongera — umehitimu"
                    : "Hongera — umepandishwa darasa"}
              </p>
              {promo?.note && (
                <p className="mt-1 text-xs" style={{ color: colors.stone }}>{promo.note}</p>
              )}
            </div>
          )}
          {average != null && (
            <p className="text-sm font-medium" style={{ color: colors.primary }}>
              Wastani: {average}%
            </p>
          )}
          {grades.map((g, i) => (
            <div key={i} className="rounded-xl border bg-white px-4 py-3 text-sm" style={{ borderColor: colors.line }}>
              <p className="font-medium">{g.subject_name || g.exam_title}</p>
              <p style={{ color: colors.stone }}>
                {g.marks_obtained}/{g.total_marks || 100} · Grade {g.grade_letter}
              </p>
            </div>
          ))}
          {!grades.length && (
            <p className="text-sm" style={{ color: colors.stone }}>
              Hakuna matokeo yaliyoidhinishwa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
