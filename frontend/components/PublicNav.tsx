"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/#programs", label: "Programs" },
  { href: "/#teachers", label: "Teachers" },
  { href: "/#events", label: "Events" },
  { href: "/#about", label: "About" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const portalHref = user?.role === "teacher" || user?.role === "admin" ? "/teacher/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-teal-100/60 bg-sand-100/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/logo2.jpg" alt="Madrasa logo" width={40} height={40} className="rounded-full object-cover" />
          <span className="font-serif text-lg font-semibold leading-tight text-teal-800">
            Al Madrasat Habiib
            <br />
            <span className="text-sm font-normal text-ink-400">El Mustwafaa &mdash; Kigorofani</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-ink-600 transition-colors hover:text-teal-700">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href={portalHref} className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800">
              Go to my portal
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ink-600 hover:text-teal-700">
                Log in
              </Link>
              <Link href="/register" className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800">
                Enroll now
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-teal-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{open ? "\u2715" : "\u2630"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-teal-100/60 bg-sand-100 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-ink-600">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-3">
              {user ? (
                <Link href={portalHref} className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white">
                  My portal
                </Link>
              ) : (
                <>
                  <Link href="/login" className="rounded-full border border-teal-700 px-5 py-2 text-sm font-medium text-teal-700">
                    Log in
                  </Link>
                  <Link href="/register" className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white">
                    Enroll now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
