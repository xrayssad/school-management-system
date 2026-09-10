export type UserRole = "admin" | "teacher" | "student" | "committee";

export interface StudentProfile {
  id: string;
  student_code: string;
  class_name: string;
  date_of_birth: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  address: string | null;
  enrollment_date: string;
}

export interface TeacherProfile {
  id: string;
  staff_code: string;
  specialization: string | null;
  experience_years: number;
  bio: string | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  student_profile: StudentProfile | null;
  teacher_profile: TeacherProfile | null;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
}

export interface TimetableEntry {
  id: string;
  day_of_week: string;
  class_name: string;
  subject: Subject | null;
  teacher_id: string | null;
  teacher_name: string | null;
  start_time: string;
  end_time: string;
  room: string | null;
  entry_type: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: Subject | null;
  class_name: string;
  exam_date: string;
  total_marks: number;
  created_at: string;
}

export interface Grade {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  grade_letter: string;
  remarks: string | null;
  graded_at: string;
  exam: Exam | null;
}

export interface AttendanceSummary {
  total_days: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  subject: Subject | null;
  class_name: string;
  due_date: string;
  total_marks: number;
  created_at: string;
  submission_count: number;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  status: "pending" | "submitted" | "graded" | "late";
  marks_obtained: number | null;
  feedback: string | null;
  submitted_at: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  teacher_id: string | null;
  teacher_name: string | null;
  subject_id: string | null;
  class_name: string | null;
  priority: "normal" | "important" | "urgent";
  created_at: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  category: string;
  image_url: string | null;
  created_at: string;
}

export interface MessageItem {
  id: string;
  sender_id: string;
  sender_name: string | null;
  recipient_id: string;
  recipient_name: string | null;
  subject: string;
  body: string;
  is_read: boolean;
  sent_at: string;
}

export interface StudentDashboard {
  student: { name: string; class_name: string; student_code: string };
  average_percentage: number;
  attendance_percentage: number;
  total_subjects_graded: number;
  pending_assignments: number;
  upcoming_events: { id: string; title: string; event_date: string }[];
  recent_announcements: { id: string; title: string; message: string; created_at: string }[];
}

export interface TeacherDashboard {
  role: "teacher" | "admin";
  teacher_name?: string;
  classes?: string[];
  student_count?: number;
  assignment_count?: number;
  exam_count?: number;
  pending_grading?: number;
  total_students?: number;
  total_teachers?: number;
  total_classes?: number;
}

export interface TeacherAnalytics {
  grade_distribution: Record<string, number>;
  attendance_by_class: Record<string, number>;
  subject_averages: Record<string, number>;
}

/* ========== Kamati (Committee) ========== */

export interface CommitteeDashboardStats {
  total_students: number;
  total_teachers: number;
  month_collections: number;
  month_expenses: number;
  recent_announcements: {
    id: string;
    title: string;
    created_at: string;
    target_class_name: string | null;
  }[];
}

export interface CommitteeAnnouncement {
  id: string;
  title: string;
  content: string;
  target_class_id: string | null;
  target_class_name: string | null;
  created_by: string;
  created_at: string;
  reach_count: number;
}

export interface TeacherItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subjects: string[];
  classes: string[];
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  subject_name: string;
  class_id: string;
  class_name: string;
}

export interface SalaryRecord {
  id: string;
  teacher_id: string;
  teacher_name: string;
  amount: number;
  month: string;
  paid_at: string;
  notes: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  month: string;
  description: string;
  recorded_at: string;
}

export interface Collection {
  id: string;
  amount: number;
  source: string;
  month: string;
  recorded_at: string;
}

export interface FinanceSummary {
  month: string;
  total_salaries: number;
  total_expenses: number;
  total_collections: number;
  balance: number;
}

export interface StudentItem {
  id: string;
  full_name: string;
  date_of_birth: string;
  parent_name: string;
  parent_phone: string;
  class_name: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  student_count: number;
}

export interface SubjectItem {
  id: string;
  name: string;
}

export type PublishStatus = "draft" | "published";

export interface ExamSchedule {
  id: string;
  subject_id: string;
  subject_name: string;
  class_id: string;
  class_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room: string;
  status: PublishStatus;
}

export interface CommitteeTimetableEntry {
  id: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  class_id: string;
  class_name: string;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  status: PublishStatus;
}
