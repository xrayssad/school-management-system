import { api } from "@/lib/api";

export const committeePasswordApi = {
  setPassword: (userId: string, new_password: string) =>
    api.post<{ detail: string }>(`/committee/users/${userId}/set-password`, {
      new_password,
    }),
  sendResetEmail: (userId: string) =>
    api.post<{ detail: string; email?: string; dev_reset_link?: string }>(
      `/committee/users/${userId}/send-reset-email`
    ),
  selfResetEmail: () =>
    api.post<{ detail: string; email?: string; dev_reset_link?: string }>(
      `/committee/me/send-reset-email`
    ),
};
