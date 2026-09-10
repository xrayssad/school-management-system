'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { committeeApi } from '@/lib/api';
import type { Collection, Expense, FinanceSummary, SalaryRecord, TeacherItem } from '@/lib/types';
import { colors } from '@/lib/colors';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatMoney(amount: number): string {
  return `TSh ${amount.toLocaleString('sw-TZ')}`;
}

type TabType = 'salary' | 'expense' | 'collection';

export default function CommitteeFinancePage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('salary');

  const [teacherId, setTeacherId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [dateValue, setDateValue] = useState(() => new Date().toISOString().slice(0, 10));

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [summaryData, salaryList, expenseList, collectionList, teacherList] = await Promise.all([
        committeeApi.financeSummary(month),
        committeeApi.listSalaries(month),
        committeeApi.listExpenses(month),
        committeeApi.listCollections(month),
        committeeApi.listTeachers(),
      ]);
      setSummary(summaryData);
      setSalaries(salaryList);
      setExpenses(expenseList);
      setCollections(collectionList);
      setTeachers(teacherList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kupakia taarifa za fedha.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [month]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Weka kiasi sahihi.');
      return;
    }

    setSaving(true);
    try {
      if (activeTab === 'salary') {
        if (!teacherId) {
          setError('Chagua mwalimu.');
          setSaving(false);
          return;
        }
        await committeeApi.createSalary({
          teacher_id: teacherId,
          amount: numericAmount,
          month,
          paid_at: dateValue,
          notes: notes.trim(),
        });
        setSuccess('Rekodi ya mshahara imehifadhiwa.');
      } else if (activeTab === 'expense') {
        if (!category.trim()) {
          setError('Weka aina ya matumizi.');
          setSaving(false);
          return;
        }
        await committeeApi.createExpense({
          amount: numericAmount,
          category: category.trim(),
          month,
          description: description.trim(),
          recorded_at: dateValue,
        });
        setSuccess('Rekodi ya matumizi imehifadhiwa.');
      } else {
        if (!source.trim()) {
          setError('Weka chanzo cha mkusanyo.');
          setSaving(false);
          return;
        }
        await committeeApi.createCollection({
          amount: numericAmount,
          source: source.trim(),
          month,
          recorded_at: dateValue,
        });
        setSuccess('Rekodi ya mkusanyo imehifadhiwa.');
      }

      setAmount('');
      setNotes('');
      setCategory('');
      setDescription('');
      setSource('');
      setTeacherId('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kuhifadhi rekodi.');
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: TabType; label: string; icon: typeof Wallet }[] = [
    { key: 'salary', label: 'Mshahara', icon: Wallet },
    { key: 'expense', label: 'Matumizi', icon: TrendingDown },
    { key: 'collection', label: 'Mkusanyo', icon: TrendingUp },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Fedha</h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>Mishahara, matumizi na makusanyo</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Mwezi</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>{error}</div>
      )}
      {success && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>{success}</div>
      )}

      {summary && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Mapato', value: formatMoney(summary.total_collections), icon: TrendingUp },
            { label: 'Mishahara', value: formatMoney(summary.total_salaries), icon: Wallet },
            { label: 'Matumizi mengine', value: formatMoney(summary.total_expenses), icon: TrendingDown },
            { label: 'Salio', value: formatMoney(summary.balance), icon: PiggyBank },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: colors.soft }}>
                  <Icon size={20} style={{ color: colors.primary }} />
                </div>
                <p className="text-xs" style={{ color: colors.stone }}>{stat.label}</p>
                <p className="mt-1 text-lg font-semibold" style={{ color: colors.primary }}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-8 rounded-xl border bg-white p-6" style={{ borderColor: colors.line }}>
        <div className="mb-5 flex items-center gap-2">
          <Plus size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Ongeza rekodi mpya</h2>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors" style={{ backgroundColor: isActive ? colors.primary : colors.soft, color: isActive ? colors.white : colors.primary }}>
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activeTab === 'salary' && (
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Mwalimu</label>
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
                <option value="">Chagua mwalimu</option>
                {teachers.map((teacher) => (<option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>))}
              </select>
            </div>
          )}

          {activeTab === 'expense' && (
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Aina ya matumizi</label>
              <input placeholder="Mfano: Umeme, Maji, Karatasi" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
            </div>
          )}

          {activeTab === 'collection' && (
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Chanzo cha mkusanyo</label>
              <input placeholder="Mfano: Ada za wanafunzi, Michango" value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Kiasi (TSh)</label>
            <input type="number" min="1" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Tarehe</label>
            <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          </div>

          {activeTab === 'salary' && (
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Maelezo (si lazima)</label>
              <input placeholder="Maelezo ya ziada..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} />
            </div>
          )}

          {activeTab === 'expense' && (
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Maelezo</label>
              <input placeholder="Maelezo ya matumizi..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} />
            </div>
          )}

          <div className="md:col-span-2">
            <button type="submit" disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
              {saving ? 'Inahifadhi...' : 'Hifadhi rekodi'}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: colors.stone }}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: colors.primary }} />
          Inapakia...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <FinanceList title="Mishahara" icon={Wallet} rows={salaries.map((salary) => ({ id: salary.id, primary: salary.teacher_name, secondary: `${formatMoney(salary.amount)} · ${salary.paid_at}` }))} />
          <FinanceList title="Matumizi" icon={TrendingDown} rows={expenses.map((expense) => ({ id: expense.id, primary: expense.category, secondary: `${formatMoney(expense.amount)} · ${expense.recorded_at}` }))} />
          <FinanceList title="Makusanyo" icon={TrendingUp} rows={collections.map((collection) => ({ id: collection.id, primary: collection.source, secondary: `${formatMoney(collection.amount)} · ${collection.recorded_at}` }))} />
        </div>
      )}
    </div>
  );
}

function FinanceList({ title, icon: Icon, rows }: { title: string; icon: typeof Wallet; rows: { id: number; primary: string; secondary: string }[] }) {
  return (
    <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
      <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: colors.line }}>
        <Icon size={16} style={{ color: colors.primary }} />
        <h3 className="text-sm font-semibold" style={{ color: colors.primary }}>{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm" style={{ color: colors.stone }}>Hakuna rekodi.</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id} className="border-b px-5 py-3 last:border-b-0" style={{ borderColor: colors.line }}>
              <p className="text-sm font-medium" style={{ color: colors.ink }}>{row.primary}</p>
              <p className="mt-0.5 text-xs" style={{ color: colors.stone }}>{row.secondary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
