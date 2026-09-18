
import { api } from "@/lib/api";

export type RegistrationRequest = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  class_name: string;
  date_of_birth?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  address?: string | null;
  photo_url?: string | null;
  status: "pending" | "approved" | "rejected";
  student_code?: string | null;
  rejection_reason?: string | null;
  created_at: string;
};

export const registrationApi = {
  list: (status?: string) =>
    api.get<RegistrationRequest[]>(
      `/committee/registrations${status ? `?status_filter=${status}` : ""}`
    ),
  approve: (id: string, student_code: string) =>
    api.post<RegistrationRequest>(`/committee/registrations/${id}/approve`, {
      student_code,
    }),
  reject: (id: string, reason?: string) =>
    api.post<RegistrationRequest>(`/committee/registrations/${id}/reject`, {
      reason: reason || null,
    }),
  importCsv: async (file: File) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("madrasa_token")
        : null;
    const base =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${base}/committee/students/import-csv`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || res.statusText);
    }
    return res.json() as Promise<{
      created: number;
      skipped: number;
      errors: string[];
    }>;
  },
};
