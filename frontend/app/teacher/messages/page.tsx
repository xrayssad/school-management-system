"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api, ApiError } from "@/lib/api";
import type { MessageItem, User } from "@/lib/types";

export default function MessagesPage() {
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api.get<MessageItem[]>(`/messages/${tab}`).then(setMessages).finally(() => setLoading(false));
  }

  useEffect(load, [tab]);
  useEffect(() => {
    api.get<string[]>("/students/classes").then((classes) => {
      if (classes[0]) api.get<User[]>(`/students?class_name=${encodeURIComponent(classes[0])}`).then(setStudents);
    });
  }, []);

  async function send(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/messages", { recipient_id: recipientId, subject, body });
      setShowCompose(false);
      setSubject("");
      setBody("");
      if (tab === "sent") load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send message.");
    }
  }

  async function markRead(id: string) {
    await api.put(`/messages/${id}/read`);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Communicate directly with students and guardians"
        action={
          <button onClick={() => setShowCompose((s) => !s)} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            {showCompose ? "Cancel" : "Compose"}
          </button>
        }
      />

      {showCompose && (
        <Card className="mb-6">
          <form onSubmit={send} className="grid gap-3">
            <select required value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm">
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
            <input required placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <textarea required placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="rounded-lg border border-teal-100 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
              Send message
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </Card>
      )}

      <div className="mb-4 flex gap-2">
        {(["inbox", "sent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-teal-700 text-white" : "bg-sage text-ink-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : messages.length === 0 ? (
        <EmptyState title={`No ${tab} messages`} />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-400">
                    {tab === "inbox" ? `From ${m.sender_name}` : `To ${m.recipient_name}`} &middot; {new Date(m.sent_at).toLocaleString()}
                  </p>
                  <h3 className="mt-1 font-medium text-ink">{m.subject}</h3>
                  <p className="mt-1 text-sm text-ink-600">{m.body}</p>
                </div>
                {tab === "inbox" && !m.is_read && (
                  <button onClick={() => markRead(m.id)} className="shrink-0">
                    <Badge tone="gold">Mark read</Badge>
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
