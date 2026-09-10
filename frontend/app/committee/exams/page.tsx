'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CalendarClock, Plus, CheckCircle } from 'lucide-react';
import { committeeApi } from '@/lib/api';
import type { ExamSchedule, SchoolClass, SubjectItem } from '@/lib/types';
import { colors } from '@/lib/colors';

export default function CommitteeExamsPage() {
  const [items, setItems] = useState<ExamSchedule[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
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
      setError(err instanceof Error ? err.message : 'Imeshindikana kupakia ratiba za mitihani.');
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

    if (!subjectId || !classId || !examDate || !startTime || !endTime || !room.trim()) {
      setError('Jaza sehemu zote za ratiba.');
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
      setSubjectId('');
      setClassId('');
      setExamDate('');
      setStartTime('');
      setEndTime('');
      setRoom('');
      setSuccess('Ratiba ya mtihani imeongezwa kama rasimu.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kuhifadhi ratiba.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(id: number) {
    setError('');
    setSuccess('');
    try {
      await committeeApi.publishExamSchedule(id);
      setSuccess('Ratiba imechapishwa kwa mafanikio.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kuchapisha ratiba.');
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Ratiba za Mitihani</h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>Panga na chapisha ratiba za mitihani kwa somo, darasa na chumba</p>
      </div>

      {error && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>
          {success}
        </div>
      )}

      <div className="mb-8 rounded-xl border bg-white p-6" style={{ borderColor: colors.line }}>
        <div className="mb-5 flex items-center gap-2">
          <Plus size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Ratiba mpya (rasimu)</h2>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Tarehe ya mtihani</label>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Chumba</label>
            <input placeholder="Mfano: Chumba 1" value={room} onChange={(e) => setRoom(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
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
              {saving ? 'Inahifadhi...' : 'Hifadhi rasimu'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: colors.line }}>
          <CalendarClock size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Ratiba zilizopo</h2>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm" style={{ color: colors.stone }}>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: colors.primary }} />
            Inapakia...
          </div>
        ) : items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna ratiba bado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: colors.soft }}>
                <tr>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Somo</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Darasa</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Tarehe / Muda</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Chumba</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Hali</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Kitendo</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="px-5 py-3">{item.subject_name}</td>
                    <td className="px-5 py-3">{item.class_name}</td>
                    <td className="px-5 py-3" style={{ color: colors.stone }}>{item.exam_date} · {item.start_time}–{item.end_time}</td>
                    <td className="px-5 py-3">{item.room}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: item.status === 'published' ? colors.sage : colors.soft, color: colors.primary }}>
                        {item.status === 'published' ? 'Imechapishwa' : 'Rasimu'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {item.status === 'draft' && (
                        <button type="button" onClick={() => handlePublish(item.id)} className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: colors.primary }}>
                          <CheckCircle size={12} />
                          Chapisha
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
