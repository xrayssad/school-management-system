"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<User[]>("/teachers")
      .then(setTeachers)
      .finally(() => setLoading(false));
  }, []);

  async function sendMessage(recipientId: string) {
    try {
      await api.post("/messages", { recipient_id: recipientId, subject: "Message from student portal", body });
      setStatus("Message sent!");
      setOpenId(null);
      setBody("");
    } catch (err) {
      setStatus(err instanceof ApiError ? err.message : "Could not send message.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Teachers" subtitle="Meet the teaching staff" />
      {status && <p className="mb-4 rounded-lg bg-sage px-3 py-2 text-sm text-teal-800">{status}</p>}
      {teachers.length === 0 ? (
        <EmptyState title="No teachers found" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <Card key={t.id}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage font-serif text-base font-semibold text-teal-800">
                {t.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <h3 className="mt-3 font-serif text-base font-semibold text-ink">{t.full_name}</h3>
              <p className="text-sm text-ink-400">{t.teacher_profile?.specialization ?? "Madrasa teacher"}</p>
              <p className="mt-1 text-xs text-gold-700">{t.teacher_profile?.experience_years ?? 0} years experience</p>

              {openId === t.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-teal-100 p-2 text-sm focus:border-teal-600 focus:outline-none"
                    placeholder="Write a message..."
                  />
                  <div className="flex gap-2">
                    <button onClick={() => sendMessage(t.id)} className="rounded-full bg-teal-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-teal-800">
                      Send
                    </button>
                    <button onClick={() => setOpenId(null)} className="rounded-full border border-teal-100 px-4 py-1.5 text-xs font-medium text-ink-600">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setOpenId(t.id)} className="mt-3 text-sm font-medium text-teal-700 hover:underline">
                  Send a message
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
