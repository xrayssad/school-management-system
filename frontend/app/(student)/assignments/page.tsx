"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api, ApiError } from "@/lib/api";
import type { Assignment } from "@/lib/types";
import { colors } from "@/lib/colors";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    api.get<Assignment[]>("/assignments").then(setAssignments).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function submit(id: string) {
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post(`/assignments/${id}/submit`, { content });
      setMessage("Kazi imetumwa.");
      setOpenId(null);
      setContent("");
      load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Imeshindikana kutuma. Jaribu tena.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Kazi za darasani" subtitle="Kazi na zoezi za darasa lako" />
      {message && (
        <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: colors.soft, color: colors.primary }}>{message}</p>
      )}
      {assignments.length === 0 ? (
        <EmptyState title="Hakuna kazi" description="Huna kazi zinazosubiri." />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const overdue = new Date(a.due_date) < new Date();
            return (
              <div key={a.id} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: colors.soft, color: colors.primary }}>
                      <ClipboardList size={16} />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: colors.stone }}>{a.subject?.name ?? "Jumla"}</p>
                      <h3 className="font-serif text-lg font-semibold" style={{ color: colors.ink }}>{a.title}</h3>
                      <p className="mt-1 text-sm" style={{ color: colors.stone }}>{a.description}</p>
                    </div>
                  </div>
                  <Badge tone={overdue ? "red" : "gold"}>Mwisho {new Date(a.due_date).toLocaleDateString("sw-TZ")}</Badge>
                </div>
                {openId === a.id ? (
                  <div className="mt-4 space-y-3">
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full rounded-lg border p-3 text-sm outline-none" style={{ borderColor: colors.line }} placeholder="Andika jibu lako hapa…" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => submit(a.id)} disabled={submitting} className="rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
                        {submitting ? "Inatuma…" : "Tuma"}
                      </button>
                      <button type="button" onClick={() => setOpenId(null)} className="rounded-full border px-5 py-2 text-sm font-medium" style={{ borderColor: colors.line, color: colors.stone }}>Ghairi</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setOpenId(a.id)} className="mt-4 rounded-full border px-5 py-2 text-sm font-medium" style={{ borderColor: colors.primary, color: colors.primary }}>
                    Wasilisha kazi
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
