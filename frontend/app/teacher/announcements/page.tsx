"use client";

import { useEffect, useState, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api, ApiError } from "@/lib/api";
import type { Announcement } from "@/lib/types";

const CLASS_OPTIONS = ["Darasa la 3", "Darasa la 4", "Darasa la 5", "Darasa la 6"];

export default function TeacherAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [classFilter, setClassFilter] = useState<string>("");
  const [priority, setPriority] = useState("normal");

  function load() {
    api.get<Announcement[]>(`/announcements${classFilter ? `?class_name=${encodeURIComponent(classFilter)}` : "?class_name=Darasa la 3"}`).then(setItems).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/announcements", { title, message, class_name: classFilter || null, priority });
      setShowForm(false);
      setTitle("");
      setMessage("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not post announcement.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Post updates to your students"
        action={
          <button onClick={() => setShowForm((s) => !s)} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            {showForm ? "Cancel" : "New announcement"}
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={create} className="grid gap-3">
            <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <textarea required placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm">
                <option value="">Whole school</option>
                {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button type="submit" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
              Post announcement
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState title="No announcements yet" />
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-lg font-semibold text-ink">{a.title}</h3>
                {a.priority !== "normal" && <Badge tone={a.priority === "urgent" ? "red" : "gold"}>{a.priority}</Badge>}
              </div>
              <p className="mt-2 text-sm text-ink-600">{a.message}</p>
              <p className="mt-3 text-xs text-ink-400">{a.class_name ?? "Whole school"} &middot; {new Date(a.created_at).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
