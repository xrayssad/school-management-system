"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Spinner, EmptyState } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { colors } from "@/lib/colors";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    api.get<User[]>("/teachers").then(setTeachers).finally(() => setLoading(false));
  }, []);

  async function sendMessage(recipientId: string) {
    try {
      await api.post("/messages", {
        recipient_id: recipientId,
        subject: "Ujumbe kutoka portali ya mwanafunzi",
        body,
      });
      setStatus("Ujumbe umetumwa.");
      setOpenId(null);
      setBody("");
    } catch (err) {
      setStatus(err instanceof ApiError ? err.message : "Imeshindikana kutuma.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Walimu" subtitle="Kutana na walimu wa madrasa" />
      {status && (
        <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: colors.soft, color: colors.primary }}>{status}</p>
      )}
      {teachers.length === 0 ? (
        <EmptyState title="Hakuna walimu" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <div key={t.id} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full font-serif text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
                {t.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <h3 className="mt-3 font-serif text-base font-semibold" style={{ color: colors.ink }}>{t.full_name}</h3>
              <p className="text-sm" style={{ color: colors.stone }}>{t.teacher_profile?.specialization ?? "Mwalimu wa madrasa"}</p>
              <p className="mt-1 text-xs" style={{ color: colors.primary }}>Miaka {t.teacher_profile?.experience_years ?? 0} ya ualimu</p>
              {openId === t.id ? (
                <div className="mt-3 space-y-2">
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: colors.line }} placeholder="Andika ujumbe…" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => sendMessage(t.id)} className="rounded-full px-4 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: colors.primary }}>Tuma</button>
                    <button type="button" onClick={() => setOpenId(null)} className="rounded-full border px-4 py-1.5 text-xs font-medium" style={{ borderColor: colors.line, color: colors.stone }}>Ghairi</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setOpenId(t.id)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: colors.primary }}>
                  <MessageSquare size={14} /> Tuma ujumbe
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
