"use client";

import { useEffect, useState, FormEvent } from "react";
import { BookOpen, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import type { Subject } from "@/lib/types";
import { colors } from "@/lib/colors";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<Subject[]>("/subjects").then(setSubjects).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function createSubject(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/subjects", { name, code, color: colors.primary, icon: "book" });
      setShowForm(false);
      setName("");
      setCode("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Admin pekee anaweza kuongeza somo.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Masomo"
        subtitle="Masomo yote yanayofundishwa madrasani"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={15} />
            {showForm ? "Ghairi" : "Ongeza somo"}
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createSubject} className="grid gap-3 sm:grid-cols-3">
            <input required placeholder="Jina" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
            <input required placeholder="Nambari (mf. QUR)" value={code} onChange={(e) => setCode(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
            <button type="submit" className="rounded-full px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: colors.primary }}>
              Hifadhi
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: colors.line, borderLeftWidth: 3, borderLeftColor: colors.primary }}
          >
            <BookOpen size={20} style={{ color: colors.primary }} strokeWidth={1.75} />
            <h3 className="mt-2 font-serif text-base font-semibold" style={{ color: colors.ink }}>{s.name}</h3>
            <p className="text-xs" style={{ color: colors.stone }}>{s.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
