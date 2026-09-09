"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api, ApiError } from "@/lib/api";
import type { Assignment } from "@/lib/types";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    api
      .get<Assignment[]>("/assignments")
      .then(setAssignments)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function submit(id: string) {
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post(`/assignments/${id}/submit`, { content });
      setMessage("Submitted successfully!");
      setOpenId(null);
      setContent("");
      load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Could not submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Homework and coursework for your class" />
      {message && <p className="mb-4 rounded-lg bg-sage px-3 py-2 text-sm text-teal-800">{message}</p>}

      {assignments.length === 0 ? (
        <EmptyState title="No assignments" description="You're all caught up." />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const overdue = new Date(a.due_date) < new Date();
            return (
              <Card key={a.id} style={{ borderLeftWidth: 4, borderLeftColor: a.subject?.color ?? "#0B4F45" } as React.CSSProperties}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-ink-400">{a.subject?.name ?? "General"}</p>
                    <h3 className="font-serif text-lg font-semibold text-ink">{a.title}</h3>
                    <p className="mt-1 text-sm text-ink-600">{a.description}</p>
                  </div>
                  <Badge tone={overdue ? "red" : "gold"}>Due {new Date(a.due_date).toLocaleDateString()}</Badge>
                </div>

                {openId === a.id ? (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-teal-100 p-3 text-sm focus:border-teal-600 focus:outline-none"
                      placeholder="Write your answer or notes here..."
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => submit(a.id)}
                        disabled={submitting}
                        className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                      >
                        {submitting ? "Submitting\u2026" : "Submit"}
                      </button>
                      <button onClick={() => setOpenId(null)} className="rounded-full border border-teal-100 px-5 py-2 text-sm font-medium text-ink-600">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setOpenId(a.id)}
                    className="mt-4 rounded-full border border-teal-700 px-5 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
                  >
                    Submit assignment
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
