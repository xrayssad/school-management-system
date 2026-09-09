"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function AppShell({
  children,
  navItems,
  allowedRoles,
  portalLabel,
}: {
  children: ReactNode;
  navItems: NavItem[];
  allowedRoles: UserRole[];
  portalLabel: string;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(user.role === "student" ? "/dashboard" : "/teacher/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <p className="text-sm text-ink-400">Loading your portal&hellip;</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sand-200">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-teal-100/60 bg-teal-900 text-white md:flex">
        <SidebarContent navItems={navItems} pathname={pathname} portalLabel={portalLabel} user={user} onLogout={logout} />
      </aside>

      {/* Sidebar - mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 bg-teal-900 text-white">
            <SidebarContent
              navItems={navItems}
              pathname={pathname}
              portalLabel={portalLabel}
              user={user}
              onLogout={logout}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-teal-100/60 bg-white/90 px-6 py-3 backdrop-blur md:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6 text-teal-800" />
          </button>
          <span className="font-serif text-base font-semibold text-teal-800">{portalLabel}</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  navItems,
  pathname,
  portalLabel,
  user,
  onLogout,
  onNavigate,
}: {
  navItems: NavItem[];
  pathname: string;
  portalLabel: string;
  user: { full_name: string; role: string };
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <Image src="/images/logo2.jpg" alt="Logo" width={36} height={36} className="rounded-full object-cover" />
        <div>
          <p className="font-serif text-sm font-semibold leading-tight">Al Madrasat Habiib</p>
          <p className="text-xs text-teal-200">{portalLabel}</p>
        </div>
        <button className="ml-auto md:hidden" onClick={onNavigate} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-white text-teal-900" : "text-teal-50 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-sm font-medium">{user.full_name}</p>
        <p className="text-xs capitalize text-teal-200">{user.role}</p>
        <button onClick={onLogout} className="mt-3 flex items-center gap-2 text-sm text-teal-100 hover:text-white">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  );
}
