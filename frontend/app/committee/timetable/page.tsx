"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Calendar, Plus, CheckCircle, Clock } from "lucide-react";
import { committeeApi } from "@/lib/api";
import type { SchoolClass, SubjectItem, TeacherItem, CommitteeTimetableEntry } from "@/lib/types";
import { colors } from "@/lib/colors";

const DAYS = [
  { value: 0, label: "Jumatatu" },
  { value: 1, label: "Jumanne" },
  { value: 2, label: "Jumatano" },
  { value: 3, label: "Alhamisi" },
  { value: 4, label: "Ijumaa" },
  { value: 5, label: "Jumamosi" },
];

export default function CommitteeTimetablePage() {
  const [items, setItems] = useState<CommitteeTimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dayFilter, setDayFilter] = useState<number | "all">("all");

  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [timetable, subjectList, teacherList, classList] = await Promise.all([
        committeeApi.listTimetable(),
        committeeApi.listSubjects(),
        committeeApi.listTeachers(),
        committeeApi.listClasses(),
      ]);
      setItems(timetable);
      setSubjects(subjectList);
      setTeachers(teacherList);
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
    if (dayFilter === "all") return items;
    return items.filter((i) => {
      const d = DAYS.find((x) => x.label === i.day_name);
      return d?.value === dayFilter;
    });
  }, [items, dayFilter]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!subjectId || !teacherId || !classId || !startTime || !endTime) {
      setError("Jaza sehemu zote.");
      return;
    }
    if (startTime >= endTime) {
      setError("Muda wa kuisha uwe baada ya kuanza.");
      return;
    }
    setSaving(true);
    try {
      await committeeApi.createTimetableEntry({
        subject_id: subjectId,
        teacher_id: teacherId,
        class_id: classId,
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
      });
      setSubjectId("");
      setTeacherId("");
      setClassId("");
      setStartTime("");
      setEndTime("");
      setSuccess("Kipindi kimeongezwa kama rasimu.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kuhifadhi.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishAll() {
    setError("");
    setSuccess("");
    try {
      const result = await committeeApi.publishTimetable();
      setSuccess(`Ratiba imechapishwa (vipindi ${result.updated}).`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kuchapisha.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Ratiba ya masomo</h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>Panga kisha chapisha</p>
        </div>
        <button type="button" onClick={handlePublishAll} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
          <CheckCircle size={16} /> Chapisha yote
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>{error}</div>}
      {success && <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>{success}</div>}

      <div className="mb-6 rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Kipindi kipya</h2>
        </div>
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
          <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }}>
            {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
            <option value="">Somo</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
            <option value="">Mwalimu</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </select>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
            <option value="">Darasa</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          <button type="submit" disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2" style={{ backgroundColor: colors.primary }}>
            {saving ? "Inahifadhi…" : "Hifadhi kipindi"}
          </button>
        </form>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setDayFilter("all")} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: dayFilter === "all" ? colors.primary : colors.soft, color: dayFilter === "all" ? "#fff" : colors.primary }}>Zote</button>
        {DAYS.map((d) => (
          <button key={d.value} type="button" onClick={() => setDayFilter(d.value)} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: dayFilter === d.value ? colors.primary : colors.soft, color: dayFilter === d.value ? "#fff" : colors.primary }}>
            {d.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-3" style={{ borderColor: colors.line }}>
          <Calendar size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Vipindi ({visible.length})</h2>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Inapakia…</p>
        ) : visible.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna vipindi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: colors.soft }}>
                <tr>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Siku</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}><span className="inline-flex items-center gap-1"><Clock size={14} />Muda</span></th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Somo</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Mwalimu</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Darasa</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Hali</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="px-4 py-3">{item.day_name}</td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{item.start_time}–{item.end_time}</td>
                    <td className="px-4 py-3">{item.subject_name}</td>
                    <td className="px-4 py-3">{item.teacher_name}</td>
                    <td className="px-4 py-3">{item.class_name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: colors.soft, color: colors.primary }}>
                        {item.status === "published" ? "Imechapishwa" : "Rasimu"}
                      </span>
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
