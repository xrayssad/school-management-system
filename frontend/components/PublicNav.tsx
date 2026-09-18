"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";

const links = [
  { href: "/#home", label: "Nyumbani" },
  { href: "/#about", label: "Kuhusu Sisi" },
  { href: "/#services", label: "Huduma Zetu" },
  { href: "/#contact", label: "Mawasiliano" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const portalHref =
    user?.role === "committee" || user?.role === "admin"
      ? "/committee/dashboard"
      : user?.role === "teacher"
        ? "/teacher/dashboard"
        : user
          ? "/dashboard"
          : "/login";

  return (
    <>
      <div className="text-sm" style={{ backgroundColor: colors.deep, color: colors.sage }}>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-6 py-2">
          <span>+255 776 475 792 · +255 652 929 146</span>
          <span>habibielmustwafa@gmail.com</span>
        </div>
      </div>
      <header style={{ backgroundColor: colors.primary }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo2.jpg"
              alt="Nembo"
              width={52}
              height={52}
              className="rounded-full border-2 object-cover"
              style={{ borderColor: colors.sage, width: 52, height: "auto" }}
            />
            <div>
              <p className="font-serif text-base leading-tight text-white" style={{ fontFamily: "Amiri, Lora, serif" }}>
                مدرسة الحبيب المصطفى
              </p>
              <p className="text-sm font-semibold text-white">Madrasa Habib el Mustwafa</p>
            </div>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <Link
                href={portalHref}
                className="rounded-full px-5 py-2 text-sm font-semibold"
                style={{ backgroundColor: colors.sage, color: colors.deep }}
              >
                Portal yangu
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-white/90 hover:text-white">
                  Ingia
                </Link>
                <Link
                  href="/register"
                  className="rounded-full px-5 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: colors.deep }}
                >
                  Jisajili
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="text-white md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menyu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </header>
      <nav style={{ backgroundColor: colors.deep }}>
        <div className="mx-auto max-w-6xl px-6">
          <ul className="hidden justify-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="block px-5 py-3 text-sm font-medium text-white/90 transition hover:text-white"
                  style={{ borderBottom: "2px solid transparent" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderBottomColor = colors.sage;
                    (e.currentTarget as HTMLElement).style.color = colors.sage;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderBottomColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "";
                  }}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/register" className="block px-5 py-3 text-sm font-medium" style={{ color: colors.sage }}>
                Jisajili
              </Link>
            </li>
          </ul>
          {open && (
            <div className="flex flex-col gap-2 py-4 md:hidden">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-white">
                  {l.label}
                </a>
              ))}
              <Link href="/register" onClick={() => setOpen(false)} className="text-sm font-semibold" style={{ color: colors.sage }}>
                Jisajili
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm text-white">
                Ingia
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
