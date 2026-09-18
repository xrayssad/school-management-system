"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import PublicNav from "@/components/PublicNav";
import { colors } from "@/lib/colors";
import { BookOpen, GraduationCap, Heart, MapPin, Phone, Mail } from "lucide-react";

const SLIDES = [
  {
    src: "/images/pici1.jpg",
    title: "Elimu Bora ya Kiislamu",
    caption: "Mafunzo ya Qur'an, Tajwid na maadili kwa watoto wa kila umri.",
  },
  {
    src: "/images/pici2.jpg",
    title: "Walimu Wenye Ujuzi",
    caption: "Wanazuoni wenye uzoefu wa miaka mingi wa ufundishaji.",
  },
  {
    src: "/images/pici3.jpg",
    title: "Mazingira Salama",
    caption: "Mahali salama na tulivu pa kujifunzia kwa watoto wetu.",
  },
];

const SERVICES = [
  {
    title: "Qur'an na Tajwid",
    items: ["Kusoma Qur'an kwa usahihi", "Masomo ya Tajwid na mahadhi", "Ufahamu wa maana za aya", "Mazoezi ya usikivu wa Qur'an"],
    icon: BookOpen,
  },
  {
    title: "Hifdh ya Qur'an",
    items: ["Kuhifadhi surate mbalimbali", "Mbinu za kukariri kwa urahisi", "Mazoezi ya kudurusu kila siku", "Mifumo ya kukumbuka kwa muda mrefu"],
    icon: GraduationCap,
  },
  {
    title: "Masomo ya Dini",
    items: ["Fiqh na ibada za kila siku", "Hadith za Mtume (SAW)", "Akhlaq na maadili", "Historia ya Kiislamu na lugha ya Kiarabu"],
    icon: Heart,
  },
];

export default function HomePage() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ backgroundColor: colors.paper, color: colors.ink }}>
      <PublicNav />

      {/* Hero */}
      <section id="home" className="grid border-b lg:grid-cols-2" style={{ backgroundColor: colors.soft, borderColor: colors.line }}>
        <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:py-16">
          <p className="mb-3 font-serif text-xl" style={{ color: colors.primary, fontFamily: "Amiri, serif" }}>
            بسم الله الرحمن الرحيم
          </p>
          <h1 className="font-serif text-3xl font-semibold italic leading-snug md:text-4xl" style={{ color: colors.deep }}>
            Msingi wa dini huanzia kwenye herufi ya kwanza.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed md:text-base" style={{ color: colors.stone }}>
            Tunafundisha Qur&apos;an, Tajwid na maadili ya Kiislamu kwa watoto na vijana, kwa mbinu zenye mpangilio na uangalizi wa karibu wa mwalimu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded px-6 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: colors.primary }}
            >
              Jisajili sasa
            </Link>
            <a
              href="#about"
              className="rounded border px-6 py-3 text-sm font-semibold"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              Soma zaidi kutuhusu
            </a>
          </div>
        </div>
        <div className="relative min-h-[320px] lg:min-h-[420px]">
          {SLIDES.map((s, i) => (
            <div
              key={s.src}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === idx ? 1 : 0 }}
            >
              <Image src={s.src} alt={s.title} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority={i === 0} />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white" style={{ background: "rgba(15,47,40,0.88)" }}>
                <h3 className="font-serif text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 max-w-sm text-sm text-white/85">{s.caption}</p>
              </div>
            </div>
          ))}
          <div className="absolute bottom-5 right-5 z-10 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIdx(i)}
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: i === idx ? colors.sage : "rgba(255,255,255,0.45)" }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold" style={{ color: colors.primary }}>
            Kuhusu Sisi
          </p>
          <h2 className="mt-2 max-w-xl font-serif text-2xl font-semibold md:text-3xl" style={{ color: colors.deep }}>
            Kituo cha elimu ya Kiislamu kinachozingatia kina na uangalifu
          </h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <p
              className="border-l-[3px] pl-5 font-serif text-lg italic leading-relaxed"
              style={{ borderColor: colors.sage, color: colors.deep }}
            >
              Tunaamini kuwa elimu ya dini ni msingi wa maisha mema, hivyo tunajishughulisha na kuwafundisha watoto na vijana kusoma Qur&apos;an, Tajwid, na maadili kwa mujibu wa mafundisho ya Mtume Muhammad (SAW).
            </p>
            <ul className="space-y-0">
              {[
                ["Misioni yetu", "Kuwapa wanafunzi msingi imara wa dini na maadili yatakayowaongoza katika maisha ya kila siku."],
                ["Dira yetu", "Kuwa kituo bora cha elimu ya Kiislamu katika mkoa wetu, kinachowafikia watoto wote bila ubaguzi."],
                ["Thamani zetu", "Uadilifu, ujitolea, upendo na heshima kwa kila mwanafunzi anayepitia madrasa hii."],
              ].map(([h, p]) => (
                <li key={h} className="border-t py-4" style={{ borderColor: colors.line }}>
                  <h3 className="font-serif text-base font-semibold" style={{ color: colors.primary }}>
                    {h}
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: colors.stone }}>
                    {p}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-y px-6 py-16" style={{ backgroundColor: colors.soft, borderColor: colors.line }}>
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold" style={{ color: colors.primary }}>
            Huduma Zetu
          </p>
          <h2 className="mt-2 max-w-2xl font-serif text-2xl font-semibold md:text-3xl" style={{ color: colors.deep }}>
            Mafunzo yanayofuata mpangilio, kwa umri wa miaka mitano hadi kumi na minane
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-0">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className={`md:px-8 ${i > 0 ? "md:border-l" : ""}`}
                  style={{ borderColor: colors.line }}
                >
                  <Icon size={22} style={{ color: colors.primary }} strokeWidth={1.75} />
                  <h3 className="mt-3 font-serif text-lg font-semibold" style={{ color: colors.primary }}>
                    {s.title}
                  </h3>
                  <ul className="mt-4">
                    {s.items.map((item, j) => (
                      <li
                        key={item}
                        className={`py-2 text-sm ${j > 0 ? "border-t" : ""}`}
                        style={{ borderColor: colors.line, color: colors.stone }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-6 py-12 text-center" style={{ backgroundColor: colors.paper }}>
        <p className="font-serif text-xl font-semibold" style={{ color: colors.deep }}>
          Karibu ujisajili — ombi litakaguliwa na Kamati
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm" style={{ color: colors.stone }}>
          Baada ya kuidhinishwa utapata namba ya usajili na uweze kuingia kwenye portal ya mwanafunzi.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/register" className="rounded px-6 py-3 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
            Jisajili
          </Link>
          <Link href="/login" className="rounded border px-6 py-3 text-sm font-semibold" style={{ borderColor: colors.primary, color: colors.primary }}>
            Ingia
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-6 py-16 text-white" style={{ backgroundColor: colors.primary }}>
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold" style={{ color: colors.sage }}>
            Mawasiliano
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-white">
            Wasiliana nasi kwa maswali au usajili
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { icon: Phone, title: "Simu", lines: ["+255 776 475 792", "+255 652 929 146"] },
              { icon: Mail, title: "Barua pepe", lines: ["habibielmustwafa@gmail.com"] },
              { icon: MapPin, title: "Eneo", lines: ["Kigorofani, Mbuyu Mnene", "Mombasa, Zanzibar"] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="border-t border-white/20 pt-5">
                <Icon size={18} style={{ color: colors.sage }} />
                <h3 className="mt-3 font-serif text-base font-semibold text-white">{title}</h3>
                {lines.map((l) => (
                  <p key={l} className="mt-1 text-sm text-white/80">
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-12 text-white/85" style={{ backgroundColor: colors.deep }}>
        <div className="mx-auto grid max-w-6xl gap-8 border-b border-white/10 pb-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Image
              src="/images/logo2.jpg"
              alt="Nembo"
              width={56}
              height={56}
              className="rounded-full border-2 object-cover"
              style={{ borderColor: colors.sage, width: 56, height: "auto" }}
            />
            <p className="mt-3 max-w-sm text-sm text-white/70">
              Kituo cha elimu ya Kiislamu kilichojikita katika mafunzo ya Qur&apos;an, Tajwid na maadili kwa watoto wa kila umri.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-base font-semibold text-white">Mawasiliano</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li>Kigorofani, Mbuyu Mnene, Mombasa Zanzibar</li>
              <li>+255 776 475 792</li>
              <li>habibielmustwafa@gmail.com</li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-white/50">
          © {new Date().getFullYear()} Madrasa Habib el Mustwafa. Haki zote zimehifadhiwa.
        </p>
      </footer>
    </div>
  );
}
