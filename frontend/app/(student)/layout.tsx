"use client";

import AppShell from "@/components/AppShell";
import { studentNav } from "@/lib/nav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell navItems={studentNav} allowedRoles={["student"]} portalLabel="Student Portal">
      {children}
    </AppShell>
  );
}
