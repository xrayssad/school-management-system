"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";

const links = [
  { href: "/#programs", label: "Programu" },
  { href: "/#about", label: "Kuhusu" },
  { href: "/#contact", label: "Mawasiliano" },
];

export default function PublicNav({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const portalHref =
    user?.role === "committee"
      ? "/committee/dashboard"
      : user?.role === "teacher" || user?.role === "admin"
        ? "/teacher/dashboard"
        : "/dashboard";

  return (
    <header className="absolute left-0 right-0 top-0 z-50 px-4 pt-5 md:px-6">
      <div
        className="mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-full border px-3 py-2 shadow-lg backdrop-blur-md md:px-5"
        style={{
          backgroundColor: transparent ? "rgba(255,255,255,0.92)" : "#fff",
          borderColor: "rgba(24,69,59,0.12)",
        }}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5 pl-1">
          <Image
            src="/images/logo2.jpg"
            alt="Nembo"
            width={32}
            height={32}
            className="rounded-full object-cover"
            style={{ width: 32, height: 32 }}
          />
          <span className="hidden font-serif text-sm font-semibold sm:block" style={{ color: colors.primary }}>
            Madrasatul Habiib
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: colors.ink }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href={portalHref}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: colors.primary }}
            >
              Portal
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border px-4 py-2 text-sm font-semibold sm:inline-block"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Ingia
              </Link>
              <Link
                href="/register"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Jisajili
              </Link>
            </>
          )}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border md:hidden"
            style={{ borderColor: colors.line }}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="mx-auto mt-2 max-w-4xl rounded-2xl border bg-white p-4 shadow-lg md:hidden"
          style={{ borderColor: colors.line }}
        >
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium"
                style={{ color: colors.ink }}
              >
                {l.label}
              </a>
            ))}
            {!user && (
              <Link href="/login" className="text-sm font-semibold" style={{ color: colors.primary }}>
                Ingia
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
