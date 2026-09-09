import Image from "next/image";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import Slideshow from "@/components/Slideshow";

const PROGRAMS = [
  { name: "Qur'an", icon: "📖", color: "#0B4F45", desc: "Recitation, memorization and understanding of the Holy Qur'an." },
  { name: "Tajweed", icon: "🎵", color: "#1976D2", desc: "Correct pronunciation and articulation (makharij) of Arabic letters." },
  { name: "Hadith", icon: "📚", color: "#D32F2F", desc: "Study of the sayings and traditions of the Prophet Muhammad (S.A.W)." },
  { name: "Tahfeedh", icon: "💫", color: "#B8862F", desc: "Structured Qur'an memorization with juz-by-juz progress tracking." },
  { name: "Sira", icon: "🕌", color: "#7B1FA2", desc: "The life history and biography of the Prophet Muhammad (S.A.W)." },
  { name: "Fiqh", icon: "⚖️", color: "#0097A7", desc: "Islamic jurisprudence and everyday religious practice." },
  { name: "Aqeedah", icon: "🌟", color: "#3A443F", desc: "Foundations of Islamic belief and creed." },
  { name: "Arabic", icon: "🔤", color: "#388E3C", desc: "Arabic language, grammar and vocabulary for beginners to advanced." },
  { name: "Tafsir", icon: "📖", color: "#7B1FA2", desc: "In-depth explanation and interpretation of Qur'anic verses." },
];

const TEACHERS = [
  { name: "Sheikh Ahmed Ali", role: "Quran & Tajweed", exp: "15 years", initials: "AA" },
  { name: "Ustadh Mohammed Hassan", role: "Islamic Law (Hadith & Fiqh)", exp: "12 years", initials: "MH" },
  { name: "Ustadha Fatima Noor", role: "Quran Memorization", exp: "10 years", initials: "FN" },
  { name: "Sheikh Ibrahim Omar", role: "Islamic History", exp: "18 years", initials: "IO" },
];

const EVENTS = [
  { title: "Parents Meeting", when: "This week", desc: "Kikao cha wazazi na walimu kujadili maendeleo ya wanafunzi." },
  { title: "Mtihani wa Muhula", when: "In 2 weeks", desc: "Mtihani wa mwisho wa muhula kwa wanafunzi wote." },
  { title: "Maulid Celebration", when: "In 3 weeks", desc: "Sherehe ya Maulid ya Mtume (S.A.W) shuleni." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-sand">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="geo-pattern pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="relative">
            <p className="font-serif text-base italic text-gold-700">Kigorofani, Zanzibar</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.1] text-teal-900 sm:text-5xl">
              Learning Qur&apos;an, Tajweed &amp; Islamic Studies, taught with care
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-600">
              Al Madrasat Habiib El Mustwafaa has guided students of all ages through the Qur&apos;an and Islamic
              sciences for over a decade. This portal keeps students, teachers and guardians connected to every
              lesson, exam and announcement.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-teal-800">
                Enroll as a student
              </Link>
              <Link href="/login" className="rounded-full border border-teal-700 px-6 py-3 text-sm font-medium text-teal-800 transition-colors hover:bg-teal-50">
                I&apos;m a teacher
              </Link>
            </div>
            <div className="mt-10 flex gap-8">
              <Stat value="9" label="subjects taught" />
              <Stat value="5+" label="dedicated teachers" />
              <Stat value="4" label="class levels" />
            </div>
          </div>
          <Slideshow />
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-lg">
          <h2 className="font-serif text-3xl font-semibold text-teal-900">What students study here</h2>
          <p className="mt-3 text-ink-600">
            A complete curriculum covering recitation, memorization, jurisprudence and Arabic language, taught
            across four class levels.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <div key={p.name} className="rounded-xl2 border border-teal-100/60 bg-white p-5" style={{ borderLeftWidth: 4, borderLeftColor: p.color }}>
              <span className="text-2xl">{p.icon}</span>
              <h3 className="mt-3 font-serif text-lg font-semibold text-ink">{p.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About strip with q1 image */}
      <section id="about" className="bg-teal-900 py-16 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-semibold">A place where the Qur&apos;an comes first</h2>
            <p className="mt-4 max-w-md leading-relaxed text-teal-100">
              Every school day begins and ends with the Book of Allah. Students progress at their own pace through
              memorization, tajweed and understanding &mdash; with teachers who track their journey closely, and a
              digital portal that keeps guardians informed every step of the way.
            </p>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl2">
            <Image src="/images/q1.jpg" alt="Qur'an resting on a wooden stand" fill className="object-cover" sizes="(max-width: 768px) 90vw, 480px" />
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section id="teachers" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-serif text-3xl font-semibold text-teal-900">Meet a few of our teachers</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEACHERS.map((t) => (
            <div key={t.name} className="rounded-xl2 border border-teal-100/60 bg-white p-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage font-serif text-lg font-semibold text-teal-800">
                {t.initials}
              </div>
              <h3 className="mt-4 font-serif text-base font-semibold text-ink">{t.name}</h3>
              <p className="mt-1 text-sm text-ink-400">{t.role}</p>
              <p className="mt-2 text-xs text-gold-700">{t.exp} teaching</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section id="events" className="bg-sage/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl font-semibold text-teal-900">What&apos;s coming up</h2>
          <div className="mt-10 space-y-4">
            {EVENTS.map((e, i) => (
              <div key={e.title} className="flex gap-5 rounded-xl2 border border-teal-100/60 bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 font-serif text-sm font-semibold text-white">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gold-700">{e.when}</p>
                  <h3 className="font-serif text-lg font-semibold text-ink">{e.title}</h3>
                  <p className="mt-1 text-sm text-ink-400">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl2 bg-teal-800 p-10 text-white md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Ready to join the madrasa?</h2>
            <p className="mt-2 max-w-md text-teal-100">Create an account to enroll your child or register as a teacher.</p>
          </div>
          <Link href="/register" className="shrink-0 rounded-full bg-gold-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-700">
            Create an account
          </Link>
        </div>
      </section>

      <footer className="border-t border-teal-100/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-ink-400 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Al Madrasat Habiib El Mustwafaa, Kigorofani.</p>
          <p>Built for the students, teachers and guardians of the madrasa.</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-2xl font-semibold text-teal-800">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
    </div>
  );
}
