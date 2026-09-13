"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Home,
  BookOpen,
  Users,
  CalendarDays,
  Info,
  Menu,
  X,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";

const links = [
  { href: "/", label: "Nyumbani", icon: Home },
  { href: "/#programs", label: "Masomo", icon: BookOpen },
  { href: "/#teachers", label: "Walimu", icon: Users },
  { href: "/#events", label: "Matukio", icon: CalendarDays },
  { href: "/#about", label: "Kuhusu", icon: Info },
];

function portalPath(role?: string) {
  if (role === "committee") return "/committee/dashboard";
  if (role === "teacher" || role === "admin") return "/teacher/dashboard";
  return "/dashboard";
}

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const portalHref = portalPath(user?.role);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ backgroundColor: colors.paper, borderColor: colors.line }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/images/logo2.jpg"
            alt="Nembo ya Madrasa"
            width={40}
            height={40}
            className="rounded-full object-cover"
            style={{ width: 40, height: 40 }}
          />
          <span
            className="hidden font-serif text-[15px] font-semibold leading-tight sm:block"
            style={{ color: colors.primary }}
          >
            Al Madrasat Habiib
            <span className="block text-xs font-normal" style={{ color: colors.stone }}>
              El Mustwafaa · Kigorofani
            </span>
          </span>
        </Link>

        {/* ========== FREMU YA KITABU (desktop) ========== */}
        <nav className="hidden md:block" aria-label="Menyu kuu">
          <div
            className="relative flex items-stretch"
            style={{
              border: `2px solid ${colors.primary}`,
              borderRadius: "4px 12px 12px 4px",
              backgroundColor: colors.white,
              boxShadow: `inset 8px 0 0 0 ${colors.primary}`,
            }}
          >
            {/* Mgongo wa kitabu (spine) */}
            <div
              className="w-2 shrink-0"
              style={{
                background: `repeating-linear-gradient(
                  to bottom,
                  ${colors.deep} 0px,
                  ${colors.deep} 3px,
                  ${colors.primary} 3px,
                  ${colors.primary} 6px
                )`,
              }}
              aria-hidden
            />

            {/* Kurasa / viungo */}
            <div className="flex items-stretch px-1 py-1">
              {links.map((l, i) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="group flex min-w-[4.5rem] flex-col items-center justify-center gap-1 px-3 py-2 transition-colors"
                    style={{
                      borderRight:
                        i < links.length - 1 ? `1px solid ${colors.line}` : "none",
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.75}
                      style={{ color: colors.primary }}
                      className="opacity-90 group-hover:opacity-100"
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: colors.primary }}
                    >
                      {l.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Ukingo wa kulia wa ukurasa */}
            <div
              className="w-1.5 shrink-0 self-stretch"
              style={{
                background: `linear-gradient(to right, ${colors.line}, transparent)`,
              }}
              aria-hidden
            />
          </div>
        </nav>

        {/* Vitendo */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link
              href={portalHref}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <LayoutDashboard size={15} strokeWidth={1.75} />
              Portali yangu
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium"
                style={{ color: colors.primary }}
              >
                <LogIn size={15} />
                Ingia
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: colors.primary }}
              >
                <UserPlus size={15} />
                Jisajili
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border md:hidden"
          style={{ borderColor: colors.line, color: colors.primary }}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Funga menyu" : "Fungua menyu"}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile: kitabu wima */}
      {open && (
        <div className="border-t px-4 py-4 md:hidden" style={{ borderColor: colors.line }}>
          <div
            className="overflow-hidden"
            style={{
              border: `2px solid ${colors.primary}`,
              borderRadius: "4px 10px 10px 4px",
              boxShadow: `inset 6px 0 0 0 ${colors.primary}`,
              backgroundColor: colors.white,
            }}
          >
            <div className="flex">
              <div
                className="w-1.5 shrink-0"
                style={{ backgroundColor: colors.deep }}
                aria-hidden
              />
              <div className="grid flex-1 grid-cols-3 gap-0 p-2">
                {links.map((l) => {
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center gap-1 rounded-md px-2 py-3"
                    >
                      <Icon size={18} style={{ color: colors.primary }} strokeWidth={1.75} />
                      <span className="text-[11px] font-medium" style={{ color: colors.primary }}>
                        {l.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {user ? (
              <Link
                href={portalHref}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full py-2.5 text-center text-sm font-medium text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Portali yangu
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border py-2.5 text-center text-sm font-medium"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  Ingia
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full py-2.5 text-center text-sm font-medium text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  Jisajili
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
