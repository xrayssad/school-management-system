"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";
import MadrasaLoader from "@/components/MadrasaLoader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type EvalRow = {
  class_name: string;
  registered: number;
  sat: number;
  sat_all: number;
  sat_partial: number;
  absent: number;
};

type ClassBest = {
  class_name: string;
  full_name: string;
  student_code: string;
  average: string;
  letter: string;
};

type SubjectBest = {
  class_name: string;
  subject_name: string;
  full_name: string;
  student_code: string;
  marks: string;
};

type Published = {
  id: string;
  title: string;
  report_type: string;
  term?: string;
  file_url: string;
  created_at?: string;
};

export default function ExamReportsPage() {
  const classes = useMemo(() => allClasses(), []);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [term, setTerm] = useState("Muhula 1");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [published, setPublished] = useState<Published[]>([]);

  const [evalRows, setEvalRows] = useState<EvalRow[]>(() =>
    classes.map((c) => ({
      class_name: c,
      registered: 0,
      sat: 0,
      sat_all: 0,
      sat_partial: 0,
      absent: 0,
    }))
  );

  const [classBests, setClassBests] = useState<ClassBest[]>(() =>
    classes.map((c) => ({
      class_name: c,
      full_name: "",
      student_code: "",
      average: "",
      letter: "",
    }))
  );

  const [subjectBests, setSubjectBests] = useState<SubjectBest[]>([
    {
      class_name: classes[1] || "Darasa la 1",
      subject_name: "",
      full_name: "",
      student_code: "",
      marks: "",
    },
  ]);

  function token() {
    return localStorage.getItem("madrasa_token");
  }

  function mediaUrl(url: string) {
    if (!url) return "";
    return url.startsWith("http") ? url : `http://localhost:8000${url}`;
  }

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token()}` };

    (async () => {
      // Same source as /committee/subjects — no hardcode
      const paths = [
        "/committee/subjects",
        "/subjects",
        "/committee/subjects/list",
      ];
      let names: string[] = [];
      for (const path of paths) {
        try {
          const r = await fetch(`${API}${path}`, { headers });
          if (!r.ok) continue;
          const b = await r.json();
          const arr = Array.isArray(b) ? b : b.subjects || b.items || b.data || [];
          names = arr
            .map((s: any) =>
              typeof s === "string" ? s : s.name || s.subject_name || s.title || ""
            )
            .map((s: string) => s.trim())
            .filter(Boolean);
          // unique preserve order
          const seen = new Set<string>();
          names = names.filter((n) => (seen.has(n) ? false : (seen.add(n), true)));
          if (names.length) break;
        } catch {
          /* next */
        }
      }
      setSubjects(names);
    })();

    loadPublished();
  }, []);

  function loadPublished() {
    fetch(`${API}/exam-reports/published`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(async (r) => (r.ok ? r.json() : []))
      .then((rows) => setPublished(Array.isArray(rows) ? rows : []))
      .catch(() => setPublished([]));
  }

  async function downloadManualPdf(kind: "evaluation" | "best") {
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const payload =
        kind === "evaluation"
          ? {
              term,
              year: Number(year) || new Date().getFullYear(),
              narrative: narrative || undefined,
              by_class: evalRows.map((r) => ({
                class_name: r.class_name,
                registered: Number(r.registered) || 0,
                sat: Number(r.sat) || 0,
                sat_all: Number(r.sat_all) || 0,
                sat_partial: Number(r.sat_partial) || 0,
                absent: Number(r.absent) || 0,
              })),
            }
          : {
              term,
              year: Number(year) || new Date().getFullYear(),
              best_per_class: classBests
                .filter((r) => r.full_name.trim())
                .map((r) => ({
                  class_name: r.class_name,
                  full_name: r.full_name,
                  student_code: r.student_code || null,
                  average: r.average ? Number(r.average) : null,
                  letter: r.letter || null,
                })),
              best_per_subject: subjectBests
                .filter((r) => r.full_name.trim() && r.subject_name.trim())
                .map((r) => ({
                  class_name: r.class_name,
                  subject_name: r.subject_name,
                  full_name: r.full_name,
                  student_code: r.student_code || null,
                  marks: r.marks || null,
                  note: "Bora #1",
                  rank: 1,
                })),
              school_top1: (() => {
                const filled = classBests.filter((r) => r.full_name.trim() && r.average);
                if (!filled.length) return null;
                return filled.reduce((a, b) =>
                  Number(a.average) >= Number(b.average) ? a : b
                );
              })(),
            };

      const path =
        kind === "evaluation"
          ? "/committee/exam-reports/pdf/evaluation-manual"
          : "/committee/exam-reports/pdf/best-students-manual";

      const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()).slice(0, 300));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = kind === "evaluation" ? "tathmini.pdf" : "wanafunzi-bora.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setMsg("PDF imepakuliwa na imehifadhiwa — wanafunzi/walimu wanaweza kuiona kwenye Ripoti.");
      loadPublished();
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
            Ripoti za mitihani
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>
            Jaza → pakua PDF → inaonekana kwa walimu na wanafunzi
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          />
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-24 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          />
        </div>
      </div>

      {msg && (
        <p className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: colors.soft, color: colors.primary }}>
          {msg}
        </p>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {loading && <MadrasaLoader label="Inatengeneza PDF…" />}

      {/* Published gallery */}
      {published.length > 0 && (
        <section className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
          <h2 className="mb-2 font-serif font-semibold" style={{ color: colors.primary }}>
            PDF zilizochapishwa
          </h2>
          <ul className="space-y-2 text-sm">
            {published.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2" style={{ borderColor: colors.line }}>
                <span>
                  {p.title}
                  {p.term ? ` · ${p.term}` : ""}
                </span>
                <a
                  href={mediaUrl(p.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline"
                  style={{ color: colors.primary }}
                >
                  Pakua
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* A. Tathmini — no "wa mwanzo" */}
      <section className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>
            A. Tathmini — idadi ya watahiniwa
          </h2>
          <button
            type="button"
            disabled={loading}
            onClick={() => downloadManualPdf("evaluation")}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <Download size={16} />
            Pakua tathmini PDF
          </button>
        </div>
        <textarea
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          rows={2}
          placeholder="Maelezo mafupi (hiari)"
          className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr style={{ backgroundColor: colors.soft }}>
                <th className="px-2 py-2">Darasa</th>
                <th className="px-2 py-2">Waliosajiliwa</th>
                <th className="px-2 py-2">Waliofanya</th>
                <th className="px-2 py-2">Yote</th>
                <th className="px-2 py-2">Baadhi</th>
                <th className="px-2 py-2">Hawakufanya</th>
              </tr>
            </thead>
            <tbody>
              {evalRows.map((r, i) => (
                <tr key={r.class_name} className="border-t" style={{ borderColor: colors.line }}>
                  <td className="px-2 py-1.5 font-medium">{r.class_name}</td>
                  {(["registered", "sat", "sat_all", "sat_partial", "absent"] as const).map((k) => (
                    <td key={k} className="px-1 py-1">
                      <input
                        type="number"
                        min={0}
                        value={r[k]}
                        onChange={(e) => {
                          const v = Number(e.target.value) || 0;
                          setEvalRows((rows) =>
                            rows.map((x, j) => (j === i ? { ...x, [k]: v } : x))
                          );
                        }}
                        className="w-16 rounded border px-1 py-1 text-xs"
                        style={{ borderColor: colors.line }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SEHEMU 1 */}
      <section className="overflow-hidden rounded-xl border-2 bg-white" style={{ borderColor: colors.primary }}>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3" style={{ backgroundColor: colors.primary }}>
          <div>
            <h2 className="font-serif text-base font-semibold text-white">SEHEMU 1 — Bora kwa kila darasa</h2>
            <p className="text-xs text-white/80">#1 pekee · wastani wa masomo yote</p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => downloadManualPdf("best")}
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white"
          >
            <Download size={16} />
            Pakua PDF
          </button>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: colors.soft }}>
                <th className="px-2 py-2">Darasa</th>
                <th className="px-2 py-2">Jina</th>
                <th className="px-2 py-2">Namba</th>
                <th className="px-2 py-2">Wastani %</th>
                <th className="px-2 py-2">Daraja</th>
              </tr>
            </thead>
            <tbody>
              {classBests.map((r, i) => (
                <tr key={r.class_name} className="border-t" style={{ borderColor: colors.line }}>
                  <td className="px-2 py-1.5 font-medium">{r.class_name}</td>
                  <td className="px-1 py-1">
                    <input
                      value={r.full_name}
                      onChange={(e) =>
                        setClassBests((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, full_name: e.target.value } : x))
                        )
                      }
                      className="w-full min-w-[140px] rounded border px-2 py-1 text-sm"
                      style={{ borderColor: colors.line }}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      value={r.student_code}
                      onChange={(e) =>
                        setClassBests((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, student_code: e.target.value } : x))
                        )
                      }
                      className="w-24 rounded border px-2 py-1 text-sm"
                      style={{ borderColor: colors.line }}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      value={r.average}
                      onChange={(e) =>
                        setClassBests((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, average: e.target.value } : x))
                        )
                      }
                      className="w-16 rounded border px-2 py-1 text-sm"
                      style={{ borderColor: colors.line }}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      value={r.letter}
                      onChange={(e) =>
                        setClassBests((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, letter: e.target.value } : x))
                        )
                      }
                      className="w-12 rounded border px-2 py-1 text-sm"
                      style={{ borderColor: colors.line }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SEHEMU 2 — subject dropdown, top 1 only */}
      <section className="overflow-hidden rounded-xl border-2 bg-white" style={{ borderColor: "#0F2F28" }}>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3" style={{ backgroundColor: "#0F2F28" }}>
          <div>
            <h2 className="font-serif text-base font-semibold text-white">
              SEHEMU 2 — Bora kwa kila somo (kwa kila darasa)
            </h2>
            <p className="text-xs text-white/80">#1 pekee kwa kila somo · chagua somo kwenye orodha</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSubjectBests((rows) => [
                ...rows,
                {
                  class_name: classes[1] || "Darasa la 1",
                  subject_name: subjects[0] || "",
                  full_name: "",
                  student_code: "",
                  marks: "",
                },
              ])
            }
            className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            Ongeza mstari
          </button>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: colors.soft }}>
                <th className="px-2 py-2">Darasa</th>
                <th className="px-2 py-2">Somo</th>
                <th className="px-2 py-2">Jina</th>
                <th className="px-2 py-2">Namba</th>
                <th className="px-2 py-2">Alama</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {subjectBests.map((r, i) => (
                <tr key={i} className="border-t" style={{ borderColor: colors.line }}>
                  <td className="px-1 py-1">
                    <select
                      value={r.class_name}
                      onChange={(e) =>
                        setSubjectBests((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, class_name: e.target.value } : x))
                        )
                      }
                      className="rounded border px-1 py-1 text-xs"
                      style={{ borderColor: colors.line }}
                    >
                      {classes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-1 py-1">
                    <select
                      value={r.subject_name}
                      onChange={(e) =>
                        setSubjectBests((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, subject_name: e.target.value } : x))
                        )
                      }
                      className="rounded border px-1 py-1 text-xs"
                      style={{ borderColor: colors.line }}
                    >
                      <option value="">— Somo —</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-1 py-1">
                    <input
                      value={r.full_name}
                      onChange={(e) =>
                        setSubjectBests((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, full_name: e.target.value } : x))
                        )
                      }
                      className="min-w-[130px] rounded border px-2 py-1 text-sm"
                      style={{ borderColor: colors.line }}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      value={r.student_code}
                      onChange={(e) =>
                        setSubjectBests((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, student_code: e.target.value } : x))
                        )
                      }
                      className="w-24 rounded border px-2 py-1 text-sm"
                      style={{ borderColor: colors.line }}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      value={r.marks}
                      onChange={(e) =>
                        setSubjectBests((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, marks: e.target.value } : x))
                        )
                      }
                      className="w-20 rounded border px-2 py-1 text-sm"
                      style={{ borderColor: colors.line }}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <button
                      type="button"
                      onClick={() => setSubjectBests((rows) => rows.filter((_, j) => j !== i))}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t px-4 py-3" style={{ borderColor: colors.line }}>
          <p className="mb-2 text-xs" style={{ color: colors.stone }}>
            Ikiwa SEHEMU 2 haina mistari, PDF itaonyesha SEHEMU 1 pekee (haitoi “Hakuna data”).
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => downloadManualPdf("best")}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <Download size={16} />
            Pakua PDF wanafunzi bora
          </button>
        </div>
      </section>
    </div>
  );
}
