"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Megaphone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api, ApiError } from "@/lib/api";
import type { Announcement } from "@/lib/types";
import { colors } from "@/lib/colors";

const CLASS_OPTIONS = ["Darasa la 1", "Darasa la 2", "Darasa la 3", "Darasa la 4", "Darasa la 5"];

export default function TeacherAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [priority, setPriority] = useState("normal");

  function load() {
    api
      .get<Announcement[]>(
        `/announcements${classFilter ? `?class_name=${encodeURIComponent(classFilter)}` : ""}`
      )
      .then(setItems)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/announcements", {
        title,
        message,
        class_name: classFilter || null,
        priority,
      });
      setShowForm(false);
      setTitle("");
      setMessage("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Imeshindikana kutuma tangazo.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Matangazo"
        subtitle="Tuma taarifa kwa wanafunzi wako"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={15} />
            {showForm ? "Ghairi" : "Tangazo jipya"}
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={create} className="grid gap-3">
            <input required placeholder="Kichwa" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
            <textarea required placeholder="Ujumbe" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }} />
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
                <option value="">Shule nzima</option>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: colors.line }}>
                <option value="normal">Kawaida</option>
                <option value="important">Muhimu</option>
                <option value="urgent">Dharura</option>
              </select>
            </div>
            <button type="submit" className="rounded-full px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: colors.primary }}>
              Tuma tangazo
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState title="Hakuna matangazo bado" />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: colors.soft, color: colors.primary }}>
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold" style={{ color: colors.ink }}>{a.title}</h3>
                    <p className="mt-1 text-sm" style={{ color: colors.stone }}>{a.message}</p>
                    <p className="mt-2 text-xs" style={{ color: colors.stone }}>
                      {a.class_name ?? "Shule nzima"} · {new Date(a.created_at).toLocaleDateString("sw-TZ")}
                    </p>
                  </div>
                </div>
                {a.priority !== "normal" && (
                  <Badge tone={a.priority === "urgent" ? "red" : "gold"}>{a.priority}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
