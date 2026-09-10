"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Wallet,
  GraduationCap,
  CalendarClock,
  Calendar,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";

const navItems = [
  { href: "/committee/dashboard", label: "Dashibodi", icon: LayoutDashboard },
  { href: "/committee/announcements", label: "Matangazo", icon: Megaphone },
  { href: "/committee/teachers", label: "Walimu", icon: Users },
  { href: "/committee/finance", label: "Fedha", icon: Wallet },
  { href: "/committee/students", label: "Wanafunzi", icon: GraduationCap },
  { href: "/committee/exams", label: "Mitihani", icon: CalendarClock },
  { href: "/committee/timetable", label: "Ratiba", icon: Calendar },
];

export default function CommitteeSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className="flex h-screen w-60 flex-col border-r"
      style={{ backgroundColor: colors.white, borderColor: colors.line }}
    >
      <div
        className="border-b px-4 py-5"
        style={{ borderColor: colors.line, backgroundColor: colors.soft }}
      >
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
          Madrasa Habib el Mustwafa
        </p>
        <p className="mt-0.5 text-xs" style={{ color: colors.stone }}>
          Uongozi wa Kamati
        </p>
        {user && (
          <p className="mt-2 text-xs font-medium" style={{ color: colors.primary }}>
            {user.full_name}
          </p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="mb-0.5 flex items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? colors.primary : "transparent",
                color: active ? colors.white : colors.primary,
              }}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3" style={{ borderColor: colors.line }}>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium"
          style={{ color: "#b91c1c" }}
        >
          <LogOut size={17} />
          Toka
        </button>
      </div>
    </aside>
  );
}
