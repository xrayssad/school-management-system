"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { allClasses, CLASS_ORDER } from "@/lib/classes";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarClock, Plus, CheckCircle, Search } from "lucide-react";
import { committeeApi } from "@/lib/api";
import type { ExamSchedule, SchoolClass, SubjectItem } from "@/lib/types";
import { colors } from "@/lib/colors";

export default function CommitteeExamsPage() {
  const [items, setItems] = useState<ExamSchedule[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const [q, setQ] = useState("");

  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [schedules, subjectList, classList] = await Promise.all([
        committeeApi.listExamSchedules(),
        committeeApi.listSubjects(),
        committeeApi.listClasses(),
      ]);
      setItems(schedules);
      setSubjects(subjectList);
      setClasses(classList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kupakia ratiba.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visible = useMemo(() => {
    let list = items;
    if (filter !== "all") list = list.filter((i) => i.status === filter);
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (i) =>
          i.subject_name.toLowerCase().includes(s) ||
          i.class_name.toLowerCase().includes(s) ||
          i.room.toLowerCase().includes(s)
      );
    }
    return list;
  }, [items, filter, q]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!subjectId || !classId || !examDate || !startTime || !endTime || !room.trim()) {
      setError("Jaza sehemu zote.");
      return;
    }
    if (startTime >= endTime) {
      setError("Muda wa kuisha uwe baada ya kuanza.");
      return;
    }
    setSaving(true);
    try {
      await committeeApi.createExamSchedule({
        subject_id: subjectId,
        class_id: classId,
        exam_date: examDate,
        start_time: startTime,
        end_time: endTime,
        room: room.trim(),
      });
      setSubjectId("");
      setClassId("");
      setExamDate("");
      setStartTime("");
      setEndTime("");
      setRoom("");
      setSuccess("Ratiba imeongezwa kama rasimu.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kuhifadhi.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(id: string) {
    setError("");
    setSuccess("");
    try {
      await committeeApi.publishExamSchedule(id);
      setSuccess("Imechapishwa.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kuchapisha.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Ratiba za mitihani</h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>Panga na chapisha mitihani</p>
      </div>

      {error && <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>{error}</div>}
      {success && <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>{success}</div>}

      <div className="mb-6 rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Ratiba mpya (rasimu)</h2>
        </div>
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
            <option value="">Somo</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
            <option value="">Darasa</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          <input placeholder="Chumba" value={room} onChange={(e) => setRoom(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          <button type="submit" disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2" style={{ backgroundColor: colors.primary }}>
            {saving ? "Inahifadhi…" : "Hifadhi rasimu"}
          </button>
        </form>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["all", "draft", "published"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: filter === f ? colors.primary : colors.soft,
              color: filter === f ? "#fff" : colors.primary,
            }}
          >
            {f === "all" ? "Zote" : f === "draft" ? "Rasimu" : "Zimechapishwa"}
          </button>
        ))}
        <div className="relative ml-auto min-w-[180px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: colors.stone }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tafuta…" className="w-full rounded-lg border py-1.5 pl-8 pr-2 text-sm" style={{ borderColor: colors.line }} />
        </div>
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-3" style={{ borderColor: colors.line }}>
          <CalendarClock size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Ratiba ({visible.length})</h2>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Inapakia…</p>
        ) : visible.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna ratiba.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: colors.soft }}>
                <tr>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Somo</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Darasa</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Tarehe / muda</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Chumba</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Hali</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }} />
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="px-4 py-3">{item.subject_name}</td>
                    <td className="px-4 py-3">{item.class_name}</td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{item.exam_date} · {item.start_time}–{item.end_time}</td>
                    <td className="px-4 py-3">{item.room}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: colors.soft, color: colors.primary }}>
                        {item.status === "published" ? "Imechapishwa" : "Rasimu"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "draft" && (
                        <button type="button" onClick={() => handlePublish(item.id)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: colors.primary }}>
                          <CheckCircle size={12} /> Chapisha
                        </button>
                      )}
                    </td>
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
