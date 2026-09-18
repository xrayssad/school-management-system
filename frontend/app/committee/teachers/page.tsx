"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { allClasses, CLASS_ORDER } from "@/lib/classes";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Users, Plus, BookOpen, Mail, Phone, Award, Search } from "lucide-react";
import { committeeApi } from "@/lib/api";
import type { SchoolClass, SubjectItem, TeacherAssignment, TeacherItem } from "@/lib/types";
import { colors } from "@/lib/colors";

export default function CommitteeTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");

  async function loadTeachersData() {
    setLoading(true);
    setError("");
    try {
      const [teacherList, subjectList, classList] = await Promise.all([
        committeeApi.listTeachers(),
        committeeApi.listSubjects(),
        committeeApi.listClasses(),
      ]);
      setTeachers(teacherList);
      setSubjects(subjectList);
      setClasses(classList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kupakia walimu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeachersData();
  }, []);

  const filteredTeachers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return teachers;
    return teachers.filter(
      (t) =>
        t.full_name.toLowerCase().includes(s) ||
        t.email.toLowerCase().includes(s) ||
        (t.phone || "").includes(s)
    );
  }, [teachers, q]);

  async function selectTeacher(teacherId: string) {
    setSelectedTeacherId(teacherId || null);
    setError("");
    if (!teacherId) {
      setAssignments([]);
      return;
    }
    try {
      setAssignments(await committeeApi.listAssignments(teacherId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kupakia masomo.");
    }
  }

  async function handleCreateTeacher(event: FormEvent) {
    event.preventDefault();
    setSuccess("");
    setError("");
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Jaza jina, barua pepe na nenosiri.");
      return;
    }
    if (password.length < 6) {
      setError("Nenosiri liwe na herufi 6+.");
      return;
    }
    setSaving(true);
    try {
      await committeeApi.createTeacher({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setSuccess("Mwalimu ameongezwa.");
      await loadTeachersData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kuongeza.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(event: FormEvent) {
    event.preventDefault();
    if (!selectedTeacherId || !subjectId || !classId) {
      setError("Chagua mwalimu, somo na darasa.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await committeeApi.assignTeacher({
        teacher_id: selectedTeacherId,
        subject_id: subjectId,
        class_id: classId,
      });
      setSubjectId("");
      setClassId("");
      setSuccess("Imepangiwa.");
      await selectTeacher(selectedTeacherId);
      await loadTeachersData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kupanga.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Walimu</h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>Ongeza na pangia masomo</p>
      </div>

      {error && <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>{error}</div>}
      {success && <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>{success}</div>}

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
          <div className="mb-4 flex items-center gap-2">
            <Plus size={18} style={{ color: colors.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Mwalimu mpya</h2>
          </div>
          <form onSubmit={handleCreateTeacher} className="space-y-3">
            <input placeholder="Jina kamili" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
            <input type="email" placeholder="Barua pepe" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
            <input placeholder="Simu" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} />
            <input type="password" placeholder="Nenosiri (6+)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required minLength={6} />
            <button type="submit" disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
              {saving ? "Inahifadhi…" : "Hifadhi"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
          <div className="mb-4 flex items-center gap-2">
            <BookOpen size={18} style={{ color: colors.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Pangia somo</h2>
          </div>
          <form onSubmit={handleAssign} className="space-y-3">
            <select value={selectedTeacherId ?? ""} onChange={(e) => selectTeacher(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
              <option value="">Mwalimu</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
              <option value="">Somo</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
              <option value="">Darasa</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" disabled={saving || !selectedTeacherId} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
              {saving ? "Inahifadhi…" : "Panga"}
            </button>
          </form>
          {selectedTeacherId && assignments.length > 0 && (
            <div className="mt-4 border-t pt-3" style={{ borderColor: colors.line }}>
              <p className="mb-2 text-xs font-semibold" style={{ color: colors.primary }}>Aliyopangiwa</p>
              <ul className="space-y-1">
                {assignments.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-sm" style={{ color: colors.stone }}>
                    <Award size={12} style={{ color: colors.primary }} />
                    {a.subject_name} · {a.class_name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.stone }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tafuta mwalimu…" className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm" style={{ borderColor: colors.line }} />
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-3" style={{ borderColor: colors.line }}>
          <Users size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Orodha ({filteredTeachers.length})</h2>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Inapakia…</p>
        ) : filteredTeachers.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna walimu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: colors.soft }}>
                <tr>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Jina</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Mawasiliano</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Masomo</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: colors.primary }}>Madarasa</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="px-4 py-3" style={{ color: colors.ink }}>{t.full_name}</td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>
                      <span className="inline-flex items-center gap-1"><Mail size={12} />{t.email}</span>
                      {t.phone && <span className="ml-2 inline-flex items-center gap-1"><Phone size={12} />{t.phone}</span>}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{t.subjects.length ? t.subjects.join(", ") : "—"}</td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{t.classes.length ? t.classes.join(", ") : "—"}</td>
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
