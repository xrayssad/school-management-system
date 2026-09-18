import { api } from "@/lib/api";

export type StudentFee = {
  id: string;
  student_user_id: string;
  student_name: string;
  student_code: string;
  class_name: string;
  phone?: string | null;
  photo_url?: string | null;
  month: string;
  amount: number;
  status: "unpaid" | "paid" | "waived";
  notes?: string | null;
  paid_at?: string | null;
  created_at: string;
};

export const feesApi = {
  listCommittee: (month: string, status_filter?: string) => {
    const q = new URLSearchParams({ month });
    if (status_filter) q.set("status_filter", status_filter);
    return api.get<StudentFee[]>(`/fees/committee?${q}`);
  },
  generate: (month: string, amount: number, class_name?: string) =>
    api.post<{ created: number; skipped: number }>("/fees/committee/generate", {
      month,
      amount,
      class_name: class_name || null,
    }),
  markPaid: (id: string, notes?: string) =>
    api.post<StudentFee>(`/fees/committee/${id}/mark-paid`, { notes: notes || null }),
  markUnpaid: (id: string) => api.post<StudentFee>(`/fees/committee/${id}/mark-unpaid`),
  myFees: () => api.get<StudentFee[]>("/fees/me"),
};

export function formatMoney(n: number) {
  return `TSh ${Number(n).toLocaleString("sw-TZ")}`;
}
