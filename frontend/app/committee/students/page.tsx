"use client";

import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Search, User, Phone } from "lucide-react";
import { committeeApi } from "@/lib/api";
import type { SchoolClass, StudentItem } from "@/lib/types";
import { colors } from "@/lib/colors";

export default function CommitteeStudentsPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    async function loadClasses() {
      setLoading(true);
      setError("");
      try {
        const classList = await committeeApi.listClasses();
        setClasses(classList);
        if (classList.length > 0) setSelectedClassId(String(classList[0].id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Imeshindikana kupakia madarasa.");
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    let cancelled = false;
    async function loadStudents() {
      setLoadingStudents(true);
      setError("");
      try {
        const list = await committeeApi.listStudentsByClass(selectedClassId);
        if (!cancelled) setStudents(list);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Imeshindikana kupakia wanafunzi.");
      } finally {
        if (!cancelled) setLoadingStudents(false);
      }
    }
    loadStudents();
    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return students;
    return students.filter(
      (st) =>
        st.full_name.toLowerCase().includes(s) ||
        (st.parent_name || "").toLowerCase().includes(s) ||
        (st.parent_phone || "").includes(s)
    );
  }, [students, q]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Wanafunzi</h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>Orodha kwa darasa</p>
      </div>

      {error && <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>{error}</div>}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="min-w-[200px]">
          <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Darasa</label>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} disabled={loading} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }}>
            {classes.length === 0 && <option value="">Hakuna madarasa</option>}
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.student_count})</option>
            ))}
          </select>
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Tafuta</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.stone }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jina au simu…" className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm" style={{ borderColor: colors.line }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: colors.line }}>
          <div className="flex items-center gap-2">
            <GraduationCap size={18} style={{ color: colors.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Orodha</h2>
          </div>
          <span className="text-xs" style={{ color: colors.stone }}>{filtered.length} wanafunzi</span>
        </div>
        {loadingStudents ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Inapakia…</p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna wanafunzi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: colors.soft }}>
                <tr>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}><span className="inline-flex items-center gap-1"><User size={14} />Jina</span></th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Tarehe ya kuzaliwa</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Mzazi</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}><span className="inline-flex items-center gap-1"><Phone size={14} />Simu</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((st) => (
                  <tr key={st.id} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="px-4 py-3" style={{ color: colors.ink }}>{st.full_name}</td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{st.date_of_birth || "—"}</td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{st.parent_name || "—"}</td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{st.parent_phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
