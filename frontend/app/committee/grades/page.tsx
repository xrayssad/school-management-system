"use client";

import { useCallback, useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";
import MadrasaLoader from "@/components/MadrasaLoader";
import { resultStatus, statusLabel, statusStyle } from "@/lib/gradeStatus";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function CommitteeGradesPage() {
  const [className, setClassName] = useState("");
  const [statusFilter, setStatusFilter] = useState("submitted");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const token = () => localStorage.getItem("madrasa_token");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (className) params.set("class_name", className);
      params.set("status_filter", statusFilter);
      const res = await fetch(`${API}/committee/grades/board?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || "Imeshindikana");
      setData(body);
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [className, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function publishExam(examId: string) {
    setMsg("");
    setError("");
    try {
      const res = await fetch(`${API}/committee/grades/exam/${examId}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || JSON.stringify(body));
      setMsg(`Imechapishwa: ${body.published}`);
      await load();
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    }
  }

  async function publishAll() {
    setMsg("");
    try {
      const params = className ? `?class_name=${encodeURIComponent(className)}` : "";
      const res = await fetch(`${API}/committee/grades/publish-all-submitted${params}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || JSON.stringify(body));
      setMsg(`Yote yamechapishwa: ${body.published}`);
      await load();
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Matokeo
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          Kila darasa · kila somo · PASS / FAIL / INCOMPLETE
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        >
          <option value="">Madarasa yote</option>
          {allClasses().map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        >
          <option value="submitted">Zinazosubiri</option>
          <option value="published">Zilizochapishwa</option>
          <option value="all">Zote</option>
        </select>
        <button type="button" onClick={load} className="rounded-lg border px-3 py-2 text-sm font-medium" style={{ borderColor: colors.primary, color: colors.primary }}>
          Onyesha
        </button>
        <button type="button" onClick={publishAll} className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
          Chapisha zote (submitted)
        </button>
      </div>

      {msg && <p className="text-sm" style={{ color: colors.primary }}>{msg}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {loading ? (
        <MadrasaLoader label="Inapakia matokeo…" />
      ) : (
        <div className="space-y-6">
          {(data?.classes || []).map((block: any) => (
            <div key={block.class_name}>
              <h2 className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>
                {block.class_name}
              </h2>
              <div className="mt-2 space-y-4">
                {(block.exams || []).map((ex: any) => (
                  <div key={ex.exam_id} className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3" style={{ borderColor: colors.line }}>
                      <div>
                        <p className="text-sm font-semibold">{ex.subject_name || ex.exam_title}</p>
                        <p className="text-xs" style={{ color: colors.stone }}>
                          {ex.exam_title} · wanafunzi {ex.grades?.length || 0}
                        </p>
                      </div>
                      {statusFilter !== "published" && (
                        <button
                          type="button"
                          onClick={() => publishExam(ex.exam_id)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Idhinisha / chapisha somo hili
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead>
                          <tr className="text-xs" style={{ color: colors.stone }}>
                            <th className="px-3 py-2">Namba</th>
                            <th>Jina</th>
                            <th>Alama</th>
                            <th>Grade</th>
                            <th>Status</th>
                            <th>Hali (mfumo)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(ex.grades || []).map((g: any) => {
                            const st = resultStatus(g.grade_letter, g.marks_obtained);
                            return (
                              <tr key={g.grade_id} className="border-t" style={{ borderColor: colors.line }}>
                                <td className="px-3 py-2">{g.student_code}</td>
                                <td>{g.full_name}</td>
                                <td>{g.marks_obtained}</td>
                                <td>{g.grade_letter || "—"}</td>
                                <td>
                                  <span className="inline-block rounded px-2 py-0.5 text-xs font-bold" style={statusStyle(st)}>
                                    {statusLabel(st)}
                                  </span>
                                </td>
                                <td className="text-xs">{g.status === "published" ? "Imechapishwa" : "Submitted"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!data?.classes?.length && (
            <p className="text-sm" style={{ color: colors.stone }}>Hakuna matokeo.</p>
          )}
        </div>
      )}
    </div>
  );
}
