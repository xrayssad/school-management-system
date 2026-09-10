'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Calendar, Plus, CheckCircle, Clock } from 'lucide-react';
import { committeeApi } from '@/lib/api';
import type { SchoolClass, SubjectItem, TeacherItem, CommitteeTimetableEntry } from '@/lib/types';
import { colors } from '@/lib/colors';

const DAYS = [
  { value: 0, label: 'Jumatatu' },
  { value: 1, label: 'Jumanne' },
  { value: 2, label: 'Jumatano' },
  { value: 3, label: 'Alhamisi' },
  { value: 4, label: 'Ijumaa' },
  { value: 5, label: 'Jumamosi' },
];

export default function CommitteeTimetablePage() {
  const [items, setItems] = useState<CommitteeTimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('0');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
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
      setError(err instanceof Error ? err.message : 'Imeshindikana kupakia ratiba.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!subjectId || !teacherId || !classId || !startTime || !endTime) {
      setError('Jaza sehemu zote za kipindi.');
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
      setSubjectId('');
      setTeacherId('');
      setClassId('');
      setStartTime('');
      setEndTime('');
      setSuccess('Kipindi kimeongezwa kama rasimu.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kuhifadhi kipindi.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishAll() {
    setError('');
    setSuccess('');
    try {
      const result = await committeeApi.publishTimetable();
      setSuccess(`Ratiba imechapishwa (vipindi ${result.updated}).`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kuchapisha ratiba.');
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Ratiba ya Masomo</h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>Panga ratiba ya kawaida kisha uichapishe kwa wanafunzi</p>
        </div>
        <button type="button" onClick={handlePublishAll} className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
          <CheckCircle size={16} />
          Chapisha ratiba yote
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>{error}</div>
      )}
      {success && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>{success}</div>
      )}

      <div className="mb-8 rounded-xl border bg-white p-6" style={{ borderColor: colors.line }}>
        <div className="mb-5 flex items-center gap-2">
          <Plus size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Ongeza kipindi kipya (rasimu)</h2>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Siku</label>
            <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }}>
              {DAYS.map((day) => (<option key={day.value} value={day.value}>{day.label}</option>))}
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
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Mwalimu</label>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
              <option value="">Chagua mwalimu</option>
              {teachers.map((teacher) => (<option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Darasa</label>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
              <option value="">Chagua darasa</option>
              {classes.map((schoolClass) => (<option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Muda wa kuanza</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Muda wa kuisha</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
              {saving ? 'Inahifadhi...' : 'Hifadhi kipindi'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: colors.line }}>
          <Calendar size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Vipindi vilivyopo</h2>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm" style={{ color: colors.stone }}>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: colors.primary }} />
            Inapakia...
          </div>
        ) : items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna vipindi bado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: colors.soft }}>
                <tr>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Siku</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>
                    <div className="flex items-center gap-1.5"><Clock size={14} />Muda</div>
                  </th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Somo</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Mwalimu</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Darasa</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Hali</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="px-5 py-3">{item.day_name}</td>
                    <td className="px-5 py-3" style={{ color: colors.stone }}>{item.start_time}–{item.end_time}</td>
                    <td className="px-5 py-3">{item.subject_name}</td>
                    <td className="px-5 py-3">{item.teacher_name}</td>
                    <td className="px-5 py-3">{item.class_name}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: item.status === 'published' ? colors.sage : colors.soft, color: colors.primary }}>
                        {item.status === 'published' ? 'Imechapishwa' : 'Rasimu'}
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
