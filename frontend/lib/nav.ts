import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  ClipboardList,
  CheckSquare,
  Megaphone,
  PartyPopper,
  Users,
  UserCircle,
  BookOpen,
  BarChart3,
  MessageSquare,
  FileText,
} from "lucide-react";
import type { NavItem } from "@/components/AppShell";

export const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/exams", label: "Exams & Grades", icon: GraduationCap },
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/attendance", label: "Attendance", icon: CheckSquare },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/events", label: "Events", icon: PartyPopper },
  { href: "/teachers", label: "Teachers", icon: Users },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export const teacherNav: NavItem[] = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/subjects", label: "Subjects", icon: BookOpen },
  { href: "/teacher/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/teacher/exams", label: "Exams & Grades", icon: GraduationCap },
  { href: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/teacher/attendance", label: "Attendance", icon: CheckSquare },
  { href: "/teacher/announcements", label: "Announcements", icon: Megaphone },
  { href: "/teacher/messages", label: "Messages", icon: MessageSquare },
  { href: "/teacher/reports", label: "Reports", icon: FileText },
  { href: "/teacher/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/teacher/profile", label: "Profile", icon: UserCircle },
];
