"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

type ReportFile = {
  id: string;
  title: string;
  report_type: string;
  term?: string | null;
  file_url: string;
  created_at: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ExamReportsDownload() {
  const [files, setFiles] = useState<ReportFile[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ReportFile[]>("/committee/exam-reports/files")
      .then(setFiles)
      .catch((e) => setError(e instanceof Error ? e.message : "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  async function download(f: ReportFile) {
    const token = localStorage.getItem("madrasa_token");
    try {
      const res = await fetch(`${API}/committee/exam-reports/download/${f.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${f.title || "ripoti"}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch { /* fallback */ }
    window.open(
      f.file_url.startsWith("http") ? f.file_url : `http://localhost:8000${f.file_url}`,
      "_blank"
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Ripoti za mitihani
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Pakua PDF kutoka Kamati
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm" style={{ color: colors.stone }}>Inapakia…</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3"
              style={{ borderColor: colors.line }}
            >
              <div className="flex items-center gap-2">
                <FileText size={18} style={{ color: colors.primary }} />
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs" style={{ color: colors.stone }}>
                    {f.report_type}{f.term ? ` · ${f.term}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => download(f)}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: colors.primary }}
              >
                <Download size={12} /> Pakua
              </button>
            </li>
          ))}
          {!files.length && (
            <p className="text-sm" style={{ color: colors.stone }}>Hakuna ripoti bado.</p>
          )}
        </ul>
      )}
    </div>
  );
}
