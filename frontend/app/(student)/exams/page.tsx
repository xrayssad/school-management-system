"use client";

import { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";
import { resultStatus, statusLabel, statusStyle } from "@/lib/gradeStatus";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type ScheduleEntry = {
  id?: string;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
  subject_name?: string;
  class_name?: string;
  status?: string;
};

type SubjectRow = {
  subject_code?: string;
  subject_name: string;
  marks_obtained: number;
  total_marks: number;
  grade_letter?: string;
};

type TermBlock = {
  term: string;
  average: number;
  count: number;
  subjects: SubjectRow[];
};

type YearBlock = { year: number; terms: TermBlock[] };

type Results = {
  student_code?: string;
  class_name?: string;
  full_name?: string;
  overall_average?: number | null;
  promotion?: { status?: string; term?: string; note?: string };
  years: YearBlock[];
};

type Tab = "schedule" | "results";

export default function StudentExamsPage() {
  const [tab, setTab] = useState<Tab>("results");
  const [data, setData] = useState<Results | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [scheduleClass, setScheduleClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openYear, setOpenYear] = useState<number | null>(null);
  const [openTerm, setOpenTerm] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("madrasa_token");
    setLoading(true);
    setError("");

    Promise.all([
      fetch(`${API}/student/my-results`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.detail || "Matokeo yameshindikana");
        return body as Results;
      }),
      fetch(`${API}/student/exam-schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          // soft fail schedule only
          return { entries: [], class_name: null };
        }
        return body;
      }),
    ])
      .then(([results, sched]) => {
        setData(results);
        const entries = sched.entries || sched || [];
        setSchedule(Array.isArray(entries) ? entries : []);
        setScheduleClass(sched.class_name || results.class_name || null);
        if (results.years?.[0]?.year) {
          setOpenYear(results.years[0].year);
          if (results.years[0].terms?.[0]?.term) {
            setOpenTerm(`${results.years[0].year}-${results.years[0].terms[0].term}`);
          }
        }
      })
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MadrasaLoader label="Inapakia mitihani…" />;

  const promo = data?.promotion;
  const promoNote =
    promo?.status === "promoted"
      ? "Hongera — umepandishwa / umehitimu kulingana na wastani ulioidhinishwa."
      : promo?.status === "repeated"
        ? "Umerudishwa darasa kulingana na wastani wa muhula."
        : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Mitihani na matokeo
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          {data?.full_name || "Mwanafunzi"} · {data?.student_code || "—"} · Darasa:{" "}
          {data?.class_name || scheduleClass || "—"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2" style={{ borderColor: colors.line }}>
        <button
          type="button"
          onClick={() => setTab("schedule")}
          className="rounded-lg px-4 py-2 text-sm font-semibold"
          style={
            tab === "schedule"
              ? { backgroundColor: colors.primary, color: "#fff" }
              : { backgroundColor: colors.soft, color: colors.primary }
          }
        >
          Ratiba ya mitihani
        </button>
        <button
          type="button"
          onClick={() => setTab("results")}
          className="rounded-lg px-4 py-2 text-sm font-semibold"
          style={
            tab === "results"
              ? { backgroundColor: colors.primary, color: "#fff" }
              : { backgroundColor: colors.soft, color: colors.primary }
          }
        >
          Matokeo yangu
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* ===== SCHEDULE ===== */}
      {tab === "schedule" && (
        <div
          className="overflow-x-auto rounded-xl border bg-white"
          style={{ borderColor: colors.line }}
        >
          <div className="border-b px-4 py-3" style={{ borderColor: colors.line }}>
            <p className="text-sm font-semibold" style={{ color: colors.primary }}>
              Ratiba ya mitihani · {scheduleClass || data?.class_name || "darasa lako"}
            </p>
            <p className="text-xs" style={{ color: colors.stone }}>
              Kama Kamati ilivyopanga
            </p>
          </div>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-xs" style={{ color: colors.stone }}>
                <th className="px-3 py-2">Tarehe</th>
                <th>Muda</th>
                <th>Somo</th>
                <th>Chumba</th>
                <th>Hali</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((e, i) => (
                <tr
                  key={e.id || i}
                  className="border-t"
                  style={{ borderColor: colors.line }}
                >
                  <td className="px-3 py-2.5">{e.exam_date || "—"}</td>
                  <td>
                    {e.start_time || "—"}
                    {e.end_time ? `–${e.end_time}` : ""}
                  </td>
                  <td>{e.subject_name || "—"}</td>
                  <td>{e.room || "—"}</td>
                  <td className="text-xs">
                    {e.status === "published" ? "Imechapishwa" : e.status || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!schedule.length && (
            <p className="p-4 text-sm" style={{ color: colors.stone }}>
              Hakuna ratiba ya mitihani iliyochapishwa kwa darasa lako.
            </p>
          )}
        </div>
      )}

      {/* ===== RESULTS ===== */}
      {tab === "results" && (
        <>
          <div
            className="flex flex-wrap gap-4 rounded-xl border bg-white p-4"
            style={{ borderColor: colors.line }}
          >
            <div>
              <p className="text-xs" style={{ color: colors.stone }}>
                Wastani wa jumla
              </p>
              <p className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
                {data?.overall_average != null ? `${data.overall_average}%` : "—"}
              </p>
            </div>
            {promoNote && (
              <div className="min-w-[200px] flex-1">
                <p className="text-xs font-semibold" style={{ color: colors.primary }}>
                  Hali ya darasa
                </p>
                <p className="mt-1 text-sm">{promoNote}</p>
                {promo?.note && (
                  <p className="mt-1 text-xs" style={{ color: colors.stone }}>
                    {promo.note}
                  </p>
                )}
              </div>
            )}
          </div>

          {(data?.years || []).map((y) => {
            const yearOpen = openYear === y.year;
            return (
              <div
                key={y.year}
                className="overflow-hidden rounded-xl border bg-white"
                style={{ borderColor: colors.line }}
              >
                <button
                  type="button"
                  onClick={() => setOpenYear(yearOpen ? null : y.year)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                  style={{ backgroundColor: colors.soft }}
                >
                  <span className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>
                    Mwaka wa masomo {y.year}
                  </span>
                  <span className="text-xs" style={{ color: colors.stone }}>
                    {yearOpen ? "Funga" : "Fungua"} · {y.terms.length} muhula
                  </span>
                </button>

                {yearOpen && (
                  <div className="space-y-4 p-4">
                    {y.terms.map((t) => {
                      const key = `${y.year}-${t.term}`;
                      const termOpen = openTerm === key;
                      return (
                        <div
                          key={key}
                          className="rounded-lg border"
                          style={{ borderColor: colors.line }}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenTerm(termOpen ? null : key)}
                            className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-left"
                          >
                            <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                              {t.term}
                            </span>
                            <span className="text-xs" style={{ color: colors.stone }}>
                              Wastani {t.average}% · masomo {t.count}
                            </span>
                          </button>

                          {termOpen && (
                            <div
                              className="overflow-x-auto border-t"
                              style={{ borderColor: colors.line }}
                            >
                              <table className="w-full min-w-[560px] text-left text-sm">
                                <thead>
                                  <tr
                                    className="text-xs uppercase tracking-wide"
                                    style={{ color: colors.stone, backgroundColor: colors.paper }}
                                  >
                                    <th className="px-3 py-2">#</th>
                                    <th className="px-2 py-2">Msimbo</th>
                                    <th className="px-2 py-2">Somo</th>
                                    <th className="px-2 py-2">Alama</th>
                                    <th className="px-2 py-2">Grade</th>
                                    <th className="px-2 py-2">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {t.subjects.map((s, i) => {
                                    const st = resultStatus(s.grade_letter, s.marks_obtained);
                                    return (
                                      <tr
                                        key={`${s.subject_name}-${i}`}
                                        className="border-t"
                                        style={{ borderColor: colors.line }}
                                      >
                                        <td
                                          className="px-3 py-2.5 text-xs"
                                          style={{ color: colors.stone }}
                                        >
                                          {i + 1}
                                        </td>
                                        <td className="px-2 py-2.5 font-medium">
                                          {s.subject_code || "—"}
                                        </td>
                                        <td className="px-2 py-2.5">{s.subject_name}</td>
                                        <td className="px-2 py-2.5">
                                          {s.marks_obtained}/{s.total_marks}
                                        </td>
                                        <td
                                          className="px-2 py-2.5 font-semibold"
                                          style={{ color: colors.primary }}
                                        >
                                          {s.grade_letter || "—"}
                                        </td>
                                        <td className="px-2 py-2.5">
                                          <span
                                            className="inline-block rounded px-2 py-0.5 text-xs font-bold tracking-wide"
                                            style={statusStyle(st)}
                                          >
                                            {statusLabel(st)}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {!data?.years?.length && !error && (
            <p className="text-sm" style={{ color: colors.stone }}>
              Bado hakuna matokeo yaliyochapishwa na Kamati.
            </p>
          )}
        </>
      )}
    </div>
  );
}
