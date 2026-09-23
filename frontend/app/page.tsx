"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import PublicNav from "@/components/PublicNav";
import HeroSlideshow, { SLIDES } from "@/components/HeroSlideshow";
import { colors } from "@/lib/colors";

const PROGRAMS = [
  {
    name: "Qur'an & Tajweed",
    desc: "Usomaji, hifadhi na matamshi sahihi ya Qur'ani Tukufu.",
    icon: BookOpen,
  },
  {
    name: "Hadith & Fiqh",
    desc: "Mafundisho ya Mtume na sheria za maisha ya kila siku.",
    icon: GraduationCap,
  },
  {
    name: "Arabic & Aqeedah",
    desc: "Lugha ya Kiarabu na misingi ya imani.",
    icon: Users,
  },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const caption = SLIDES[slide]?.caption ?? "";

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.paper }}>
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <HeroSlideshow />

        <PublicNav transparent />

        {/* Maneno — LAZIMA z-10 juu ya picha */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-28 text-center">
          <p className="mb-5 inline-flex items-center rounded-full border border-white/35 bg-white/20 px-3 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm">
            Kigorofani, Zanzibar · Elimu ya Kiislamu
          </p>

          <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight text-white drop-shadow-md md:text-5xl lg:text-6xl">
            Elimu yenye msingi wa Qur&apos;ani.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 drop-shadow md:text-lg">
            Madrasatul Habiib El Mustwafaa — mafunzo ya Qur&apos;an, Tajweed na maadili
            kwa watoto wa kila umri, katika mazingira tulivu.
          </p>

          {/* Caption ya slide — inabadilika kila 7s */}
          <p
            key={slide}
            className="mt-5 max-w-md text-sm font-medium text-white/95 transition-opacity duration-700 md:text-base"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}
          >
            {caption}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold shadow-lg transition hover:bg-white/95"
              style={{ color: colors.primary }}
            >
              Anza sasa
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              Ingia akaunti
            </Link>
          </div>

          {/* Dots */}
          <div className="mt-8 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === slide ? 22 : 8,
                  backgroundColor: i === slide ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center">
          <a
            href="#programs"
            className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm"
          >
            Scroll
            <ChevronDown size={12} />
          </a>
        </div>
      </section>

      <section id="programs" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: colors.stone }}>
          Programu
        </p>
        <h2 className="mt-2 text-center font-serif text-3xl font-semibold" style={{ color: colors.primary }}>
          Tunachofundisha
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PROGRAMS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className="rounded-2xl border bg-white p-6 shadow-sm"
                style={{ borderColor: colors.line }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: colors.soft }}
                >
                  <Icon size={20} style={{ color: colors.primary }} />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold" style={{ color: colors.primary }}>
                  {p.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.stone }}>
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="about"
        className="border-y py-16"
        style={{ borderColor: colors.line, backgroundColor: colors.soft }}
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-2xl font-semibold md:text-3xl" style={{ color: colors.primary }}>
            Kuhusu madrasa
          </h2>
          <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: colors.stone }}>
            Tunajenga kizazi chenye maarifa ya dini, adabu na uelewa wa Qur&apos;ani —
            kwa ufuatiliaji wa karibu wa Kamati, walimu na wazazi.
          </p>
        </div>
      </section>

      <footer id="contact" className="px-6 py-14" style={{ backgroundColor: colors.primary }}>
        <div className="mx-auto grid max-w-6xl gap-10 text-white md:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-semibold">Madrasatul Habiib El Mustwafaa</p>
            <p className="mt-2 text-sm text-white/70">Kigorofani, Zanzibar</p>
          </div>
          <div className="space-y-2 text-sm text-white/80">
            <p className="flex items-center gap-2">
              <MapPin size={14} /> Kigorofani, Mbuyu Mnene
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} /> +255 776 475 792
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} /> habibielmustwafa@gmail.com
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/register" className="text-white/90 underline-offset-2 hover:underline">
              Jisajili
            </Link>
            <Link href="/login" className="text-white/90 underline-offset-2 hover:underline">
              Ingia
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-white/50">
          © {new Date().getFullYear()} Madrasatul Habiib El Mustwafaa. Haki zote zimehifadhiwa.
        </p>
      </footer>
    </div>
  );
}
