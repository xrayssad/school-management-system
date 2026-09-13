import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Volume2,
  ScrollText,
  Library,
  Landmark,
  Scale,
  Heart,
  Languages,
  FileText,
  Users,
  CalendarDays,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import PublicNav from "@/components/PublicNav";
import Slideshow from "@/components/Slideshow";
import { colors } from "@/lib/colors";

const PROGRAMS = [
  { name: "Qurani", icon: BookOpen, desc: "Usomaji, uhifadhi na uelewa wa Qurani Tukufu." },
  { name: "Tajwid", icon: Volume2, desc: "Matamshi sahihi na makharij ya herufi." },
  { name: "Hadithi", icon: ScrollText, desc: "Mafundisho ya Mtume Muhammad (S.A.W)." },
  { name: "Tahfidh", icon: Library, desc: "Uhifadhi wa Qurani juzuu kwa juzuu." },
  { name: "Sira", icon: Landmark, desc: "Historia ya maisha ya Mtume (S.A.W)." },
  { name: "Fiqh", icon: Scale, desc: "Sheria za Kiislamu katika maisha ya kila siku." },
  { name: "Aqida", icon: Heart, desc: "Misingi ya imani na itikadi." },
  { name: "Kiarabu", icon: Languages, desc: "Lugha, sarufi na msamiati." },
  { name: "Tafsiri", icon: FileText, desc: "Ufafanuzi wa aya za Qurani." },
];

const PILLARS = [
  {
    title: "Qurani kwanza",
    text: "Kila siku inaanza na kuisha na Kitabu cha Allah — usomaji, tajwid na uelewa.",
  },
  {
    title: "Ufuatiliaji wa karibu",
    text: "Walimu hufuatilia maendeleo ya kila mwanafunzi; wazazi hupata taarifa kupitia portali.",
  },
  {
    title: "Mazingira ya utulivu",
    text: "Madarasa yaliyopangwa vizuri, ratiba wazi, na msisitizo wa adabu na nidhamu.",
  },
];

const TEACHERS = [
  { name: "Sheikh Ahmed Ali", role: "Qurani na Tajwid", exp: "Miaka 15", initials: "AA" },
  { name: "Ustadh Mohammed Hassan", role: "Hadithi na Fiqh", exp: "Miaka 12", initials: "MH" },
  { name: "Ustadha Fatima Noor", role: "Uhifadhi wa Qurani", exp: "Miaka 10", initials: "FN" },
  { name: "Sheikh Ibrahim Omar", role: "Historia ya Kiislamu", exp: "Miaka 18", initials: "IO" },
];

const EVENTS = [
  { title: "Mkutano wa Wazazi", when: "Wiki hii", desc: "Majadiliano ya maendeleo ya wanafunzi." },
  { title: "Mtihani wa Muhula", when: "Baada ya wiki 2", desc: "Mtihani wa mwisho wa muhula kwa madarasa yote." },
  { title: "Sherehe ya Maulid", when: "Baada ya wiki 3", desc: "Maulid ya Mtume (S.A.W) shuleni." },
];

const STEPS = [
  { n: "01", title: "Jisajili", text: "Fungua akaunti ya mwanafunzi au mwalimu." },
  { n: "02", title: "Pangiwa darasa", text: "Utapangiwa ngazi inayofaa kulingana na uwezo." },
  { n: "03", title: "Anza kujifunza", text: "Ratiba, mitihani na matangazo yote kwenye portali." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.paper }}>
      <PublicNav />

      {/* HERO — asymmetric */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-8 md:pt-20 md:pb-12">
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
                style={{ borderColor: colors.line, color: colors.primary, backgroundColor: colors.white }}
              >
                <MapPin size={13} />
                Kigorofani, Zanzibar
              </div>
              <h1
                className="font-serif text-[2.35rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl md:text-[3.25rem]"
                style={{ color: colors.primary }}
              >
                Elimu ya Qurani
                <span className="mt-1 block font-normal italic" style={{ color: colors.stone }}>
                  kwa utulivu na nidhamu
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed" style={{ color: colors.stone }}>
                Al Madrasat Habiib El Mustwafaa inafundisha Qurani, Tajwid na sayansi za Kiislamu.
                Portali hii inawaunganisha wanafunzi, walimu na wazazi — somo, mtihani na tangazo
                mahali pamoja.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  Sajili mwanafunzi
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  Ingia
                </Link>
              </div>
            </div>

            {/* Stats stack */}
            <div className="md:col-span-5">
              <Slideshow />
              <div className="mt-4" />
              <div
                className="overflow-hidden rounded-2xl border bg-white"
                style={{ borderColor: colors.line }}
              >
                <div className="border-b px-5 py-4" style={{ borderColor: colors.line, backgroundColor: colors.soft }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>
                    Kwa mtazamo wa haraka
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: colors.line }}>
                  {[
                    { v: "9", l: "Masomo yanayofundishwa", icon: BookOpen },
                    { v: "4", l: "Ngazi za madarasa", icon: GraduationCap },
                    { v: "5+", l: "Walimu wenye uzoefu", icon: Users },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.l} className="flex items-center gap-4 px-5 py-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: colors.soft, color: colors.primary }}
                        >
                          <Icon size={18} strokeWidth={1.75} />
                        </div>
                        <div className="flex-1">
                          <p className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
                            {s.v}
                          </p>
                          <p className="text-xs" style={{ color: colors.stone }}>
                            {s.l}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
</section>

      {/* PILARES — 3 columns unique */}
      <section className="border-y py-16" style={{ borderColor: colors.line, backgroundColor: colors.white }}>
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>
            Misingi yetu
          </p>
          <h2 className="mt-2 max-w-lg font-serif text-3xl font-semibold" style={{ color: colors.primary }}>
            Jinsi tunavyofundisha
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="relative pt-2">
                <span
                  className="font-serif text-5xl font-semibold leading-none opacity-15"
                  style={{ color: colors.primary }}
                >
                  0{i + 1}
                </span>
                <h3 className="-mt-6 font-serif text-xl font-semibold" style={{ color: colors.ink }}>
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.stone }}>
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS — featured + grid */}
      <section id="programs" className="py-16" style={{ backgroundColor: colors.paper }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>
                Mtaala
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold" style={{ color: colors.primary }}>
                Masomo yanayofundishwa
              </h2>
            </div>
            <p className="max-w-sm text-sm" style={{ color: colors.stone }}>
              Kutoka usomaji wa msingi hadi tafsiri — kila somo lina lengo wazi na ufuatiliaji.
            </p>
          </div>

          {/* Featured first row */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PROGRAMS.slice(0, 3).map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className="flex flex-col rounded-2xl border bg-white p-6"
                  style={{ borderColor: colors.line }}
                >
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary, color: colors.white }}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-serif text-xl font-semibold" style={{ color: colors.ink }}>
                    {p.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: colors.stone }}>
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Rest compact */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.slice(3).map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className="flex items-start gap-3 rounded-xl border bg-white px-4 py-3"
                  style={{ borderColor: colors.line }}
                >
                  <Icon size={18} className="mt-0.5 shrink-0" style={{ color: colors.primary }} strokeWidth={1.75} />
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: colors.ink }}>
                      {p.name}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: colors.stone }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT band */}
      <section id="about" className="py-16" style={{ backgroundColor: colors.primary }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.onPrimary }}>
              Kuhusu madrasa
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-white">
              Qurani inakuwa mbele ya kila kitu
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: colors.onPrimary }}>
              Wanafunzi wanaendelea kwa kasi yao wenyewe katika uhifadhi, tajwid na uelewa. Walimu
              hufuatilia safari yao; wazazi hupata taarifa kupitia portali.
            </p>
            <ul className="mt-6 space-y-2">
              {["Ratiba ya wiki wazi", "Mitihani na alama", "Matangazo ya haraka"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 size={16} style={{ color: colors.onPrimary }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/q1.jpg"
              alt="Qurani"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 480px"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16" style={{ backgroundColor: colors.white }}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-serif text-3xl font-semibold" style={{ color: colors.primary }}>
            Hatua tatu za kuanza
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="text-center">
                <p className="font-serif text-4xl font-semibold" style={{ color: colors.soft }}>
                  {s.n}
                </p>
                <h3 className="-mt-4 font-serif text-lg font-semibold" style={{ color: colors.ink }}>
                  {s.title}
                </h3>
                <p className="mt-2 text-sm" style={{ color: colors.stone }}>
                  {s.text}
                </p>
                {i < STEPS.length - 1 && (
                  <div className="mx-auto mt-4 hidden h-px w-16 md:block" style={{ backgroundColor: colors.line }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEACHERS */}
      <section id="teachers" className="py-16" style={{ backgroundColor: colors.paper }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>
                Timu
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold" style={{ color: colors.primary }}>
                Walimu wetu
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEACHERS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border bg-white p-5"
                style={{ borderColor: colors.line }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full font-serif text-sm font-semibold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  {t.initials}
                </div>
                <h3 className="mt-4 font-serif text-base font-semibold" style={{ color: colors.ink }}>
                  {t.name}
                </h3>
                <p className="mt-1 text-sm" style={{ color: colors.stone }}>
                  {t.role}
                </p>
                <p className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: colors.primary }}>
                  <Clock3 size={12} />
                  {t.exp}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS timeline-ish */}
      <section id="events" className="py-16" style={{ backgroundColor: colors.white }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} style={{ color: colors.primary }} />
            <h2 className="font-serif text-3xl font-semibold" style={{ color: colors.primary }}>
              Matukio yanayokuja
            </h2>
          </div>
          <div className="mt-10 space-y-0">
            {EVENTS.map((e, i) => (
              <div key={e.title} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {i + 1}
                  </div>
                  {i < EVENTS.length - 1 && (
                    <div className="w-px flex-1" style={{ backgroundColor: colors.line, minHeight: 40 }} />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.primary }}>
                    {e.when}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold" style={{ color: colors.ink }}>
                    {e.title}
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: colors.stone }}>
                    {e.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div
            className="relative overflow-hidden rounded-2xl px-8 py-12 md:px-12"
            style={{ backgroundColor: colors.primary }}
          >
            <div className="relative z-10 max-w-xl">
              <h2 className="font-serif text-3xl font-semibold text-white">
                Anza safari ya elimu leo
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: colors.onPrimary }}>
                Sajili mwanafunzi au fungua akaunti ya mwalimu. Portali itakuongoza hatua kwa hatua.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold"
                  style={{ color: colors.primary }}
                >
                  Fungua akaunti
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white"
                >
                  Nina akaunti tayari
                </Link>
              </div>
            </div>
            <GraduationCap
              className="pointer-events-none absolute -right-6 -bottom-6 opacity-10 text-white"
              size={200}
              strokeWidth={1}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: colors.line, backgroundColor: colors.soft }}>
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>
              Al Madrasat Habiib El Mustwafaa
            </p>
            <p className="mt-1 text-sm" style={{ color: colors.stone }}>
              Kigorofani, Zanzibar
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.primary }}>
              Mawasiliano
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm" style={{ color: colors.stone }}>
              <Phone size={14} /> +255 123 456 789
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: colors.stone }}>
              <Mail size={14} /> info@almadrasat.ac.tz
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.primary }}>
              Viungo
            </p>
            <Link href="/register" className="mt-2 block text-sm" style={{ color: colors.stone }}>
              Jisajili
            </Link>
            <Link href="/login" className="mt-1 block text-sm" style={{ color: colors.stone }}>
              Ingia
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-6 text-center text-xs" style={{ color: colors.stone }}>
          © {new Date().getFullYear()} Al Madrasat Habiib El Mustwafaa. Haki zote zimehifadhiwa.
        </p>
      </footer>
    </div>
  );
}
