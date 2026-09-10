'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Users, Plus, BookOpen, Mail, Phone, Award } from 'lucide-react';
import { committeeApi } from '@/lib/api';
import type { SchoolClass, SubjectItem, TeacherAssignment, TeacherItem } from '@/lib/types';
import { colors } from '@/lib/colors';

export default function CommitteeTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');

  async function loadTeachersData() {
    setLoading(true);
    setError('');
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
      setError(err instanceof Error ? err.message : 'Imeshindikana kupakia walimu.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeachersData();
  }, []);

  async function selectTeacher(teacherId: string) {
    setSelectedTeacherId(teacherId);
    setError('');
    if (!teacherId) {
      setAssignments([]);
      return;
    }
    try {
      const teacherAssignments = await committeeApi.listAssignments(teacherId);
      setAssignments(teacherAssignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kupakia masomo ya mwalimu.');
    }
  }

  async function handleCreateTeacher(event: FormEvent) {
    event.preventDefault();
    setSuccess('');
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Jaza jina, barua pepe na nenosiri.');
      return;
    }

    if (password.length < 6) {
      setError('Nenosiri liwe na herufi 6 au zaidi.');
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
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setSuccess('Mwalimu ameongezwa kwa mafanikio.');
      await loadTeachersData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kuongeza mwalimu.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(event: FormEvent) {
    event.preventDefault();

    if (!selectedTeacherId || !subjectId || !classId) {
      setError('Chagua mwalimu, somo na darasa.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await committeeApi.assignTeacher({
        teacher_id: selectedTeacherId,
        subject_id: subjectId,
        class_id: classId,
      });
      setSubjectId('');
      setClassId('');
      setSuccess('Mwalimu amepangiwa somo na darasa.');
      await selectTeacher(selectedTeacherId);
      await loadTeachersData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kupanga somo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Usimamizi wa Walimu</h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>Ongeza walimu na uwapangie masomo na madarasa</p>
      </div>

      {error && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>{error}</div>
      )}
      {success && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>{success}</div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6" style={{ borderColor: colors.line }}>
          <div className="mb-5 flex items-center gap-2">
            <Plus size={18} style={{ color: colors.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Ongeza mwalimu mpya</h2>
          </div>
          <form onSubmit={handleCreateTeacher} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Jina kamili</label>
              <input placeholder="Mfano: Sheikh Ahmed Ali" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Barua pepe</label>
              <input type="email" placeholder="mwalimu@almadrasat.ac.tz" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Simu</label>
              <input placeholder="+255 123 456 789" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Nenosiri la kuingia</label>
              <input type="password" placeholder="Herufi 6 au zaidi" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required minLength={6} />
            </div>
            <button type="submit" disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
              {saving ? 'Inahifadhi...' : 'Hifadhi mwalimu'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-6" style={{ borderColor: colors.line }}>
          <div className="mb-5 flex items-center gap-2">
            <BookOpen size={18} style={{ color: colors.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Pangia somo na darasa</h2>
          </div>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Mwalimu</label>
              <select value={selectedTeacherId ?? ''} onChange={(e) => selectTeacher(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
                <option value="">Chagua mwalimu</option>
                {teachers.map((teacher) => (<option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Somo</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
                <option value="">Chagua somo</option>
                {subjects.map((subject) => (<option key={subject.id} value={subject.id}>{subject.name}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Darasa</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
                <option value="">Chagua darasa</option>
                {classes.map((schoolClass) => (<option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>))}
              </select>
            </div>
            <button type="submit" disabled={saving || !selectedTeacherId} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
              {saving ? 'Inahifadhi...' : 'Panga somo'}
            </button>
          </form>
          {selectedTeacherId && assignments.length > 0 && (
            <div className="mt-5 border-t pt-4" style={{ borderColor: colors.line }}>
              <p className="mb-2 text-xs font-semibold" style={{ color: colors.primary }}>Masomo aliyopangiwa:</p>
              <ul className="space-y-1">
                {assignments.map((assignment) => (
                  <li key={assignment.id} className="flex items-center gap-2 text-sm" style={{ color: colors.stone }}>
                    <Award size={12} style={{ color: colors.gold }} />
                    {assignment.subject_name} · {assignment.class_name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: colors.line }}>
          <Users size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Orodha ya walimu</h2>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm" style={{ color: colors.stone }}>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: colors.primary }} />
            Inapakia...
          </div>
        ) : teachers.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna walimu bado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: colors.soft }}>
                <tr>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Jina</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>
                    <div className="flex items-center gap-1.5"><Mail size={14} />Mawasiliano</div>
                  </th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Masomo</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Madarasa</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="px-5 py-3" style={{ color: colors.ink }}>{teacher.full_name}</td>
                    <td className="px-5 py-3" style={{ color: colors.stone }}>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} />{teacher.email}
                        {teacher.phone && (<><span>·</span><Phone size={12} />{teacher.phone}</>)}
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: colors.stone }}>{teacher.subjects.length ? teacher.subjects.join(', ') : '—'}</td>
                    <td className="px-5 py-3" style={{ color: colors.stone }}>{teacher.classes.length ? teacher.classes.join(', ') : '—'}</td>
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
