"use client";

import AppShell from "@/components/AppShell";
import { teacherNav } from "@/lib/nav";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell navItems={teacherNav} allowedRoles={["teacher", "admin"]} portalLabel="Teacher Portal">
      {children}
    </AppShell>
  );
}
