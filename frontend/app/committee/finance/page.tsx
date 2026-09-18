"use client";
import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { committeeApi } from "@/lib/api";
import type { Collection, Expense, FinanceSummary, SalaryRecord, TeacherItem } from "@/lib/types";
import { colors } from "@/lib/colors";

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMoney(amount: number) {
  return `TSh ${amount.toLocaleString("sw-TZ")}`;
}

type TabType = "salary" | "expense" | "collection";

export default function CommitteeFinancePage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("salary");

  const [teacherId, setTeacherId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [dateValue, setDateValue] = useState(() => new Date().toISOString().slice(0, 10));

  async function loadData() {
    setLoading(true);
    setError("");
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
      setError(err instanceof Error ? err.message : "Imeshindikana kupakia fedha.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [month]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Weka kiasi sahihi.");
      return;
    }
    setSaving(true);
    try {
      if (activeTab === "salary") {
        if (!teacherId) {
          setError("Chagua mwalimu.");
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
        setSuccess("Mshahara umehifadhiwa.");
      } else if (activeTab === "expense") {
        if (!category.trim()) {
          setError("Weka aina ya matumizi.");
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
        setSuccess("Matumizi yamehifadhiwa.");
      } else {
        if (!source.trim()) {
          setError("Weka chanzo.");
          setSaving(false);
          return;
        }
        await committeeApi.createCollection({
          amount: numericAmount,
          source: source.trim(),
          month,
          recorded_at: dateValue,
        });
        setSuccess("Mkusanyo umehifadhiwa.");
      }
      setAmount("");
      setNotes("");
      setCategory("");
      setDescription("");
      setSource("");
      setTeacherId("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kuhifadhi.");
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: TabType; label: string; icon: typeof Wallet }[] = [
    { key: "salary", label: "Mshahara", icon: Wallet },
    { key: "expense", label: "Matumizi", icon: TrendingDown },
    { key: "collection", label: "Mkusanyo", icon: TrendingUp },
  ];

  const balancePositive = (summary?.balance ?? 0) >= 0;

  if (loading) return <MadrasaLoader />;
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Fedha</h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>Mishahara, matumizi na makusanyo</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: colors.primary }}>Mwezi</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} />
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>{error}</div>}
      {success && <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>{success}</div>}

      {summary && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Mapato", value: formatMoney(summary.total_collections), icon: TrendingUp },
            { label: "Mishahara", value: formatMoney(summary.total_salaries), icon: Wallet },
            { label: "Matumizi mengine", value: formatMoney(summary.total_expenses), icon: TrendingDown },
            { label: "Salio", value: formatMoney(summary.balance), icon: PiggyBank, accent: balancePositive },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: colors.soft }}>
                  <Icon size={18} style={{ color: colors.primary }} />
                </div>
                <p className="text-xs" style={{ color: colors.stone }}>{stat.label}</p>
                <p className="mt-0.5 text-lg font-semibold" style={{ color: "accent" in stat && !stat.accent ? "#b91c1c" : colors.primary }}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-6 rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Ongeza rekodi</h2>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const on = activeTab === tab.key;
            return (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: on ? colors.primary : colors.soft, color: on ? "#fff" : colors.primary }}>
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          {activeTab === "salary" && (
            <div className="md:col-span-2">
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required>
                <option value="">Chagua mwalimu</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
          )}
          {activeTab === "expense" && (
            <div className="md:col-span-2">
              <input placeholder="Aina (mf. Umeme)" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
            </div>
          )}
          {activeTab === "collection" && (
            <div className="md:col-span-2">
              <input placeholder="Chanzo (mf. Ada)" value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
            </div>
          )}
          <input type="number" min={1} placeholder="Kiasi (TSh)" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft }} required />
          {activeTab === "salary" && (
            <input placeholder="Maelezo (si lazima)" value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm md:col-span-2" style={{ borderColor: colors.line, backgroundColor: colors.soft }} />
          )}
          {activeTab === "expense" && (
            <input placeholder="Maelezo" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm md:col-span-2" style={{ borderColor: colors.line, backgroundColor: colors.soft }} />
          )}
          <button type="submit" disabled={saving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2" style={{ backgroundColor: colors.primary }}>
            {saving ? "Inahifadhi…" : "Hifadhi"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: colors.stone }}>…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <FinanceList title="Mishahara" icon={Wallet} rows={salaries.map((s) => ({ id: s.id, primary: s.teacher_name, secondary: `${formatMoney(s.amount)} · ${s.paid_at}` }))} />
          <FinanceList title="Matumizi" icon={TrendingDown} rows={expenses.map((e) => ({ id: e.id, primary: e.category, secondary: `${formatMoney(e.amount)} · ${e.recorded_at}` }))} />
          <FinanceList title="Makusanyo" icon={TrendingUp} rows={collections.map((c) => ({ id: c.id, primary: c.source, secondary: `${formatMoney(c.amount)} · ${c.recorded_at}` }))} />
        </div>
      )}
    </div>
  );
}

function FinanceList({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof Wallet;
  rows: { id: number; primary: string; secondary: string }[];
}) {
  return (
    <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: colors.line }}>
        <Icon size={16} style={{ color: colors.primary }} />
        <h3 className="text-sm font-semibold" style={{ color: colors.primary }}>{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm" style={{ color: colors.stone }}>Hakuna rekodi.</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id} className="border-b px-4 py-3 last:border-0" style={{ borderColor: colors.line }}>
              <p className="text-sm font-medium" style={{ color: colors.ink }}>{row.primary}</p>
              <p className="text-xs" style={{ color: colors.stone }}>{row.secondary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
