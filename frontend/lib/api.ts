const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("madrasa_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("madrasa_token", token);
  else localStorage.removeItem("madrasa_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  get: <T,>(path: string) => request<T>(path, { method: "GET" }),
  post: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  delete: <T,>(path: string) => request<T>(path, { method: "DELETE" }),
  put: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T,>(path: string) => request<T>(path, { method: "DELETE" }),
};

import type {
  CommitteeAnnouncement,
  CommitteeDashboardStats,
  CommitteeTimetableEntry,
  Collection,
  ExamSchedule,
  Expense,
  FinanceSummary,
  SalaryRecord,
  SchoolClass,
  StudentItem,
  SubjectItem,
  TeacherAssignment,
  TeacherItem,
} from "./types";

export const committeeApi = {
  dashboard: () => api.get<CommitteeDashboardStats>("/committee/dashboard"),

  listAnnouncements: () =>
    api.get<CommitteeAnnouncement[]>("/committee/announcements"),
  createAnnouncement: (data: {
    title: string;
    content: string;
    target_class_id: string | null;
  }) => api.post<CommitteeAnnouncement>("/committee/announcements", data),

  listTeachers: () => api.get<TeacherItem[]>("/committee/teachers"),
  createTeacher: (data: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
  }) => api.post<TeacherItem>("/committee/teachers", data),
  listAssignments: (teacherId: string) =>
    api.get<TeacherAssignment[]>(`/committee/teachers/${teacherId}/assignments`),
  assignTeacher: (data: {
    teacher_id: string;
    subject_id: string;
    class_id: string;
  }) => api.post<TeacherAssignment>("/committee/teacher-assignments", data),
  removeAssignment: (id: string) =>
    api.del<void>(`/committee/teacher-assignments/${id}`),

  financeSummary: (month: string) =>
    api.get<FinanceSummary>(
      `/committee/finance/summary?month=${encodeURIComponent(month)}`
    ),
  listSalaries: (month: string) =>
    api.get<SalaryRecord[]>(
      `/committee/finance/salaries?month=${encodeURIComponent(month)}`
    ),
  listExpenses: (month: string) =>
    api.get<Expense[]>(
      `/committee/finance/expenses?month=${encodeURIComponent(month)}`
    ),
  listCollections: (month: string) =>
    api.get<Collection[]>(
      `/committee/finance/collections?month=${encodeURIComponent(month)}`
    ),
  createSalary: (data: {
    teacher_id: string;
    amount: number;
    month: string;
    paid_at: string;
    notes: string;
  }) => api.post<SalaryRecord>("/committee/finance/salaries", data),
  createExpense: (data: {
    amount: number;
    category: string;
    month: string;
    description: string;
    recorded_at: string;
  }) => api.post<Expense>("/committee/finance/expenses", data),
  createCollection: (data: {
    amount: number;
    source: string;
    month: string;
    recorded_at: string;
  }) => api.post<Collection>("/committee/finance/collections", data),

  listClasses: () => api.get<SchoolClass[]>("/committee/classes"),
  listSubjects: () => api.get<SubjectItem[]>("/committee/subjects"),
  listStudentsByClass: (classId: string) =>
    api.get<StudentItem[]>(`/committee/classes/${classId}/students`),

  listExamSchedules: () => api.get<ExamSchedule[]>("/committee/exam-schedules"),
  createExamSchedule: (data: {
    subject_id: string;
    class_id: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    room: string;
  }) => api.post<ExamSchedule>("/committee/exam-schedules", data),
  publishExamSchedule: (id: string) =>
    api.post<ExamSchedule>(`/committee/exam-schedules/${id}/publish`),

  listTimetable: () =>
    api.get<CommitteeTimetableEntry[]>("/committee/timetable"),
  createTimetableEntry: (data: {
    subject_id: string;
    teacher_id: string;
    class_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }) => api.post<CommitteeTimetableEntry>("/committee/timetable", data),
  publishTimetable: () =>
    api.post<{ updated: number }>("/committee/timetable/publish"),
};
