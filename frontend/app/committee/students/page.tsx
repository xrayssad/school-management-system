'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, User, Phone } from 'lucide-react';
import { committeeApi } from '@/lib/api';
import type { SchoolClass, StudentItem } from '@/lib/types';
import { colors } from '@/lib/colors';

export default function CommitteeStudentsPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClasses() {
      setLoading(true);
      setError('');
      try {
        const classList = await committeeApi.listClasses();
        setClasses(classList);
        if (classList.length > 0) setSelectedClassId(String(classList[0].id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Imeshindikana kupakia madarasa.');
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
      setError('');
      try {
        const studentList = await committeeApi.listStudentsByClass(selectedClassId);
        if (!cancelled) setStudents(studentList);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Imeshindikana kupakia wanafunzi.');
      } finally {
        if (!cancelled) setLoadingStudents(false);
      }
    }

    loadStudents();
    return () => { cancelled = true; };
  }, [selectedClassId]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Wanafunzi kwa Darasa</h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>Chagua darasa ili kuona orodha ya wanafunzi</p>
      </div>

      {error && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>{error}</div>
      )}

      <div className="mb-6 max-w-xs">
        <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Darasa</label>
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} disabled={loading} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }}>
          {classes.length === 0 && <option value="">Hakuna madarasa</option>}
          {classes.map((schoolClass) => (
            <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name} ({schoolClass.student_count} wanafunzi)</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: colors.line }}>
          <GraduationCap size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Orodha ya wanafunzi</h2>
        </div>
        {loadingStudents ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm" style={{ color: colors.stone }}>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: colors.primary }} />
            Inapakia...
          </div>
        ) : students.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna wanafunzi katika darasa hili.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: colors.soft }}>
                <tr>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>
                    <div className="flex items-center gap-1.5"><User size={14} />Jina kamili</div>
                  </th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Tarehe ya kuzaliwa</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>Mzazi / Mlezi</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: colors.primary }}>
                    <div className="flex items-center gap-1.5"><Phone size={14} />Simu</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="px-5 py-3" style={{ color: colors.ink }}>{student.full_name}</td>
                    <td className="px-5 py-3" style={{ color: colors.stone }}>{student.date_of_birth || '—'}</td>
                    <td className="px-5 py-3" style={{ color: colors.stone }}>{student.parent_name || '—'}</td>
                    <td className="px-5 py-3" style={{ color: colors.stone }}>{student.parent_phone || '—'}</td>
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
