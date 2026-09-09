"use client";

import { useEffect, useState, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import type { Subject } from "@/lib/types";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#0B4F45");
  const [icon, setIcon] = useState("📖");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<Subject[]>("/subjects").then(setSubjects).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function createSubject(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/subjects", { name, code, color, icon });
      setShowForm(false);
      setName("");
      setCode("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Only admins can add subjects.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle="All subjects taught at the madrasa"
        action={
          <button onClick={() => setShowForm((s) => !s)} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            {showForm ? "Cancel" : "Add subject"}
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createSubject} className="grid gap-4 sm:grid-cols-4">
            <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <input required placeholder="Code (e.g. QUR)" value={code} onChange={(e) => setCode(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full rounded-lg border border-teal-100" />
            <input placeholder="Icon emoji" value={icon} onChange={(e) => setIcon(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 sm:col-span-4">
              Create subject
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <Card key={s.id} style={{ borderLeftWidth: 4, borderLeftColor: s.color }}>
            <span className="text-2xl">{s.icon}</span>
            <h3 className="mt-2 font-serif text-base font-semibold text-ink">{s.name}</h3>
            <p className="text-xs text-ink-400">{s.code}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
