"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  FileText,
  Trophy,
  Settings2,
  Download,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type EvalRow = {
  id?: string;
  class_name: string;
  registered: number;
  completed_all: number;
  missed_some: number;
  notes?: string | null;
};

type BestRow = {
  id: string;
  class_name: string;
  subject_name: string;
  student_name: string;
  student_code?: string | null;
  score?: number | null;
  notes?: string | null;
};

type TopRow = {
  id?: string;
  position: number;
  student_name: string;
  student_code?: string | null;
  class_name: string;
  average: number;
};

type ReportFile = {
  id: string;
  title: string;
  report_type: string;
  term?: string;
  file_url: string;
  created_at: string;
};

export default function ExamReportsPage() {
  const [term, setTerm] = useState("Muhula 2");
  const [autoEval, setAutoEval] = useState<any>(null);
  const [rankData, setRankData] = useState<any>(null);
  const [promo, setPromo] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [manualEval, setManualEval] = useState<EvalRow[]>([]);
  const [manualBest, setManualBest] = useState<BestRow[]>([]);
  const [manualTop, setManualTop] = useState<TopRow[]>([]);
  const [files, setFiles] = useState<ReportFile[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  // evaluation form
  const [evClass, setEvClass] = useState("Darasa la 1");
  const [evReg, setEvReg] = useState("20");
  const [evDone, setEvDone] = useState("18");
  const [evMiss, setEvMiss] = useState("2");
  const [evNotes, setEvNotes] = useState("");

  // best form
  const [bClass, setBClass] = useState("Darasa la 1");
  const [bSubject, setBSubject] = useState("Quran");
  const [bName, setBName] = useState("");
  const [bCode, setBCode] = useState("");
  const [bScore, setBScore] = useState("");
  const [bRankNote, setBRankNote] = useState("Bora #1");

  // top form
  const [tPos, setTPos] = useState("1");
  const [tName, setTName] = useState("");
  const [tCode, setTCode] = useState("");
  const [tClass, setTClass] = useState("Darasa la 1");
  const [tAvg, setTAvg] = useState("");

  // promotion rule
  const [ruleClass, setRuleClass] = useState("Darasa la 1");
  const [minAvg, setMinAvg] = useState("40");

  async function loadAll() {
    setError("");
    try {
      const q = term ? `?term=${encodeURIComponent(term)}` : "";
      const [e, r, p, ru, me, mb, mt, f] = await Promise.all([
        api.get(`/committee/exam-reports/evaluation${q}`).catch(() => null),
        api.get(`/committee/exam-reports/rankings${q}`).catch(() => null),
        api.get(`/committee/exam-reports/promotion-preview${q}`).catch(() => ({ items: [] })),
        api.get(`/committee/exam-reports/promotion-rules`).catch(() => []),
        api.get(`/committee/exam-reports/manual/evaluation?term=${encodeURIComponent(term)}`).catch(() => []),
        api.get(`/committee/exam-reports/manual/best?term=${encodeURIComponent(term)}`).catch(() => []),
        api.get(`/committee/exam-reports/manual/top?term=${encodeURIComponent(term)}`).catch(() => []),
        api.get(`/committee/exam-reports/files`).catch(() => []),
      ]);
      setAutoEval(e);
      setRankData(r);
      setPromo((p as any)?.items || []);
      setRules((ru as any[]) || []);
      setManualEval((me as EvalRow[]) || []);
      setManualBest((mb as BestRow[]) || []);
      setManualTop((mt as TopRow[]) || []);
      setFiles((f as ReportFile[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kupakia");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  async function genPdf(report_type: "evaluation" | "ranking") {
    setBusy(true);
    setSuccess("");
    setError("");
    try {
      const res = await api.post<{ file_url: string; id: string }>("/committee/exam-reports/generate-pdf", {
        title:
          report_type === "evaluation"
            ? `Tathmini ya mitihani — ${term}`
            : `Nafasi, bora kwa somo na Top 3 — ${term}`,
        report_type,
        term,
        publish_announcement: true,
      });
      setSuccess(`PDF imetengenezwa: ${res.file_url}`);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF imeshindikana");
    } finally {
      setBusy(false);
    }
  }

  async function saveEval(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/committee/exam-reports/manual/evaluation", {
        term,
        class_name: evClass,
        registered: Number(evReg) || 0,
        completed_all: Number(evDone) || 0,
        missed_some: Number(evMiss) || 0,
        notes: evNotes || null,
      });
      setSuccess(`Tathmini ya ${evClass} imehifadhiwa`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana");
    }
  }

  async function saveBest(e: FormEvent) {
    e.preventDefault();
    if (!bName.trim()) {
      setError("Jina la mwanafunzi linahitajika");
      return;
    }
    try {
      await api.post("/committee/exam-reports/manual/best", {
        term,
        class_name: bClass,
        subject_name: bSubject,
        student_name: bName.trim(),
        student_code: bCode || null,
        score: bScore ? Number(bScore) : null,
        notes: bRankNote || null,
      });
      setSuccess("Mwanafunzi bora ameongezwa");
      setBName("");
      setBCode("");
      setBScore("");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana");
    }
  }

  async function deleteBest(id: string) {
    try {
      await api.delete(`/committee/exam-reports/manual/best/${id}`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kufuta");
    }
  }

  async function saveTop(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post("/committee/exam-reports/manual/top", {
        term,
        position: Number(tPos) || 1,
        student_name: tName.trim(),
        student_code: tCode || null,
        class_name: tClass,
        average: Number(tAvg) || 0,
      });
      setSuccess(`Top ${tPos} imehifadhiwa`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana");
    }
  }

  async function saveRule(e: FormEvent) {
    e.preventDefault();
    try {
      await api.put("/committee/exam-reports/promotion-rules", {
        class_name: ruleClass,
        min_average: Number(minAvg),
        fail_grade: "D",
        repeat_on_term2_fail: true,
      });
      setSuccess("Sheria imehifadhiwa");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana");
    }
  }

  async function downloadFile(f: ReportFile) {
    const token = localStorage.getItem("madrasa_token");
    const res = await fetch(`${API}/committee/exam-reports/download/${f.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      // fallback static
      window.open(
        f.file_url.startsWith("http") ? f.file_url : `http://localhost:8000${f.file_url}`,
        "_blank"
      );
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${f.title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputCls = "rounded-lg border px-3 py-2 text-sm w-full";
  const labelCls = "mb-1 block text-xs font-semibold";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
            Ripoti za mitihani
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>
            Tathmini, bora kwa somo (#1 na #2), Top 3, sheria, na PDF
          </p>
        </div>
        <button
          type="button"
          onClick={loadAll}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: colors.line, color: colors.primary }}
        >
          <RefreshCw size={14} /> Sasisha
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label className={labelCls} style={{ color: colors.primary }}>
            Muhula / Term
          </label>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className={inputCls}
            style={{ borderColor: colors.line, maxWidth: 200 }}
            placeholder="Muhula 2"
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => genPdf("evaluation")}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: colors.primary }}
        >
          <FileText size={14} /> PDF tathmini
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => genPdf("ranking")}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: colors.primary }}
        >
          <Trophy size={14} /> PDF nafasi / bora
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          {error}
        </p>
      )}
      {success && (
        <p className="mb-3 break-all rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: colors.soft, color: colors.primary }}>
          {success}
        </p>
      )}

      {/* ===== MANUAL EVALUATION ===== */}
      <section className="mb-6 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>
          1. Tathmini kwa mkono (Waliosajiliwa / Wamekamilisha / Wamekosa baadhi)
        </h2>
        <p className="mt-1 text-xs" style={{ color: colors.stone }}>
          Jaza kwa kila darasa. Data hii inatumika kwenye PDF tathmini (ikiwa ipo, inashinda auto).
        </p>
        <form onSubmit={saveEval} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Darasa</label>
            <input value={evClass} onChange={(e) => setEvClass(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Waliosajiliwa</label>
            <input value={evReg} onChange={(e) => setEvReg(e.target.value)} type="number" className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Wamekamilisha</label>
            <input value={evDone} onChange={(e) => setEvDone(e.target.value)} type="number" className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Wamekosa baadhi</label>
            <input value={evMiss} onChange={(e) => setEvMiss(e.target.value)} type="number" className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Maelezo</label>
            <input value={evNotes} onChange={(e) => setEvNotes(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} placeholder="Hiari" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
              Hifadhi
            </button>
          </div>
        </form>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs" style={{ color: colors.stone }}>
                <th className="py-2">Darasa</th>
                <th>Waliosajiliwa</th>
                <th>Wamekamilisha</th>
                <th>Wamekosa baadhi</th>
                <th>Maelezo</th>
              </tr>
            </thead>
            <tbody>
              {manualEval.map((c) => (
                <tr key={c.class_name} className="border-t" style={{ borderColor: colors.line }}>
                  <td className="py-2 font-medium">{c.class_name}</td>
                  <td>{c.registered}</td>
                  <td>{c.completed_all}</td>
                  <td>{c.missed_some}</td>
                  <td className="text-xs" style={{ color: colors.stone }}>{c.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!manualEval.length && (
            <p className="py-3 text-xs" style={{ color: colors.stone }}>
              Bado hakuna data ya mkono. Auto: {(autoEval?.by_class || []).length} madarasa kutoka grades.
            </p>
          )}
        </div>
      </section>

      {/* ===== BEST PER SUBJECT (#1 and #2) ===== */}
      <section className="mb-6 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>
          2. Mwanafunzi bora kwa somo na darasa (#1, #2, …)
        </h2>
        <p className="mt-1 text-xs" style={{ color: colors.stone }}>
          Ongeza zaidi ya mmoja kwa somo lile lile (mf. Bora #1 na Bora #2). Andika kwenye Maelezo.
        </p>
        <form onSubmit={saveBest} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Darasa</label>
            <input value={bClass} onChange={(e) => setBClass(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Somo</label>
            <input value={bSubject} onChange={(e) => setBSubject(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Jina</label>
            <input value={bName} onChange={(e) => setBName(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} required />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Namba</label>
            <input value={bCode} onChange={(e) => setBCode(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} placeholder="STU…" />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Alama</label>
            <input value={bScore} onChange={(e) => setBScore(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Nafasi / note</label>
            <select value={bRankNote} onChange={(e) => setBRankNote(e.target.value)} className={inputCls} style={{ borderColor: colors.line }}>
              <option>Bora #1</option>
              <option>Bora #2</option>
              <option>Bora #3</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="inline-flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
              <Plus size={14} /> Ongeza
            </button>
          </div>
        </form>
        <div className="mt-4 max-h-72 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs" style={{ color: colors.stone }}>
                <th className="py-2">Darasa</th>
                <th>Somo</th>
                <th>Mwanafunzi</th>
                <th>Namba</th>
                <th>Alama</th>
                <th>Note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {manualBest.map((b) => (
                <tr key={b.id} className="border-t" style={{ borderColor: colors.line }}>
                  <td className="py-2">{b.class_name}</td>
                  <td>{b.subject_name}</td>
                  <td className="font-medium">{b.student_name}</td>
                  <td className="text-xs">{b.student_code || "—"}</td>
                  <td>{b.score ?? "—"}</td>
                  <td className="text-xs">{b.notes || "—"}</td>
                  <td>
                    <button type="button" onClick={() => deleteBest(b.id)} className="p-1" title="Futa">
                      <Trash2 size={14} style={{ color: "#b91c1c" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!manualBest.length && (
            <p className="py-3 text-xs" style={{ color: colors.stone }}>Hakuna bora wa mkono bado.</p>
          )}
        </div>
      </section>

      {/* ===== TOP 3 SCHOOL ===== */}
      <section className="mb-6 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>
          3. Top 3 chuo nzima (wastani)
        </h2>
        <form onSubmit={saveTop} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Nafasi</label>
            <select value={tPos} onChange={(e) => setTPos(e.target.value)} className={inputCls} style={{ borderColor: colors.line }}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Jina</label>
            <input value={tName} onChange={(e) => setTName(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} required />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Namba</label>
            <input value={tCode} onChange={(e) => setTCode(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Darasa</label>
            <input value={tClass} onChange={(e) => setTClass(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: colors.primary }}>Wastani</label>
            <input value={tAvg} onChange={(e) => setTAvg(e.target.value)} className={inputCls} style={{ borderColor: colors.line }} />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
              Hifadhi Top
            </button>
          </div>
        </form>
        <ul className="mt-3 space-y-1 text-sm">
          {manualTop.map((t) => (
            <li key={`${t.position}-${t.student_name}`}>
              <strong>#{t.position}</strong> {t.student_name} ({t.class_name}) — {t.average}
              {t.student_code ? ` · ${t.student_code}` : ""}
            </li>
          ))}
          {!manualTop.length && (rankData?.school_top3 || []).map((s: any, i: number) => (
            <li key={s.student_id || i}>
              Auto #{i + 1} {s.student_name} ({s.class_name}) — {s.average}
            </li>
          ))}
        </ul>
      </section>

      {/* ===== RULES ===== */}
      <section className="mb-6 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <div className="mb-2 flex items-center gap-2">
          <Settings2 size={16} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>
            4. Wastani wa chini / Term 2 + D → kurudishwa
          </h2>
        </div>
        <form onSubmit={saveRule} className="flex flex-wrap gap-2">
          <input value={ruleClass} onChange={(e) => setRuleClass(e.target.value)} className={inputCls} style={{ borderColor: colors.line, maxWidth: 160 }} placeholder="Darasa" />
          <input value={minAvg} onChange={(e) => setMinAvg(e.target.value)} className={inputCls} style={{ borderColor: colors.line, maxWidth: 100 }} placeholder="Min avg" />
          <button type="submit" className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
            Hifadhi sheria
          </button>
        </form>
        <ul className="mt-2 text-xs" style={{ color: colors.stone }}>
          {rules.map((r: any) => (
            <li key={r.id || r.class_name}>
              {r.class_name}: min {r.min_average}, fail={r.fail_grade}
            </li>
          ))}
        </ul>
        <div className="mt-3 max-h-40 overflow-y-auto text-xs">
          {promo.slice(0, 30).map((p: any) => (
            <div key={p.student_id + String(p.class_name)} className="border-b py-1" style={{ borderColor: colors.line }}>
              {p.student_name} — {p.average} — <strong>{p.decision}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FILES ===== */}
      <section className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>
          PDF zilizotengenezwa
        </h2>
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2" style={{ borderColor: colors.line }}>
              <div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-xs" style={{ color: colors.stone }}>
                  {f.report_type} · {f.term || "—"} · {new Date(f.created_at).toLocaleString("sw-TZ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadFile(f)}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: colors.primary }}
              >
                <Download size={12} /> Pakua
              </button>
            </li>
          ))}
          {!files.length && <p className="text-xs" style={{ color: colors.stone }}>Hakuna PDF bado.</p>}
        </ul>
      </section>
    </div>
  );
}
