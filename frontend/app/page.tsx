import Image from "next/image";
import Link from "next/link";
import { BookOpen, GraduationCap, Users, Calendar, Star, Award, Clock, MapPin, Phone, Mail } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import Slideshow from "@/components/Slideshow";
import { colors } from "@/lib/colors";

const PROGRAMS = [
  { name: "Qur'an", icon: BookOpen, color: "#0B4F45", desc: "Usomaji, kuhifadhi na kuelewa Qur'ani Tukufu kwa kina." },
  { name: "Tajweed", icon: Star, color: "#1976D2", desc: "Matamshi sahihi na utoaji wa herufi za Kiarabu (makharij)." },
  { name: "Hadith", icon: BookOpen, color: "#D32F2F", desc: "Kusoma maneno na mafundisho ya Mtume Muhammad (S.A.W)." },
  { name: "Tahfeedh", icon: Award, color: "#B8862F", desc: "Kuhifadhi Qur'ani kwa mpangilio wa juzuu kwa juzuu." },
  { name: "Sira", icon: MapPin, color: "#7B1FA2", desc: "Historia ya maisha ya Mtume Muhammad (S.A.W)." },
  { name: "Fiqh", icon: BookOpen, color: "#0097A7", desc: "Sheria za Kiislamu na mazoea ya kila siku ya kidini." },
  { name: "Aqeedah", icon: Star, color: "#3A443F", desc: "Misingi ya imani na itikadi ya Kiislamu." },
  { name: "Arabic", icon: BookOpen, color: "#388E3C", desc: "Lugha ya Kiarabu, sarufi na msamiati kwa wanaoanza hadi wa juu." },
  { name: "Tafsir", icon: BookOpen, color: "#7B1FA2", desc: "Ufafanuzi wa kina wa aya za Qur'ani Tukufu." },
];

const TEACHERS = [
  { name: "Sheikh Ahmed Ali", role: "Qur'an na Tajweed", exp: "Miaka 15", initials: "AA" },
  { name: "Ustadh Mohammed Hassan", role: "Sheria ya Kiislamu (Hadith na Fiqh)", exp: "Miaka 12", initials: "MH" },
  { name: "Ustadha Fatima Noor", role: "Kuhifadhi Qur'ani", exp: "Miaka 10", initials: "FN" },
  { name: "Sheikh Ibrahim Omar", role: "Historia ya Kiislamu", exp: "Miaka 18", initials: "IO" },
];

const EVENTS = [
  { title: "Kikao cha Wazazi", when: "Wiki hii", desc: "Kikao cha wazazi na walimu kujadili maendeleo ya wanafunzi." },
  { title: "Mtihani wa Muhula", when: "Baada ya wiki 2", desc: "Mtihani wa mwisho wa muhula kwa wanafunzi wote." },
  { title: "Sherehe ya Maulid", when: "Baada ya wiki 3", desc: "Sherehe ya Maulid ya Mtume (S.A.W) shuleni." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.soft }}>
      <PublicNav />

      <section className="relative overflow-hidden" style={{ backgroundColor: colors.soft }}>
        <div className="geo-pattern pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="relative">
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={16} style={{ color: colors.gold }} />
              <p className="font-serif text-sm italic" style={{ color: colors.gold }}>Kigorofani, Zanzibar</p>
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-[1.1] sm:text-5xl" style={{ color: colors.primary }}>
              Kujifunza Qur'ani, Tajweed na Masomo ya Kiislamu kwa Umakini
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed" style={{ color: colors.stone }}>
              Al Madrasat Habiib El Mustwafaa imeongoza wanafunzi wa rika zote katika Qur'ani na sayansi za Kiislamu
              kwa zaidi ya muongo mmoja. Portal hii inawaunganisha wanafunzi, walimu na wazazi katika kila somo,
              mtihani na tangazo.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="rounded-full px-6 py-3 text-sm font-medium text-white transition-colors" style={{ backgroundColor: colors.primary }}>
                Jiunge kama mwanafunzi
              </Link>
              <Link href="/login" className="rounded-full border px-6 py-3 text-sm font-medium transition-colors" style={{ borderColor: colors.primary, color: colors.primary }}>
                Mimi ni mwalimu
              </Link>
            </div>
            <div className="mt-12 flex gap-10">
              <Stat value="9" label="masomo yanayofundishwa" />
              <Stat value="5+" label="walimu waliojitolea" />
              <Stat value="4" label="ngazi za madarasa" />
            </div>
          </div>
          <Slideshow />
        </div>
      </section>

      <section id="programs" className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-lg">
          <h2 className="font-serif text-3xl font-semibold" style={{ color: colors.primary }}>Wanafunzi wanajifunza nini hapa</h2>
          <p className="mt-3" style={{ color: colors.stone }}>
            Mtaala kamili unaojumuisha usomaji, kuhifadhi, sheria za Kiislamu na lugha ya Kiarabu, ukifundishwa katika ngazi nne za madarasa.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((program) => {
            const Icon = program.icon;
            return (
              <div key={program.name} className="rounded-xl border bg-white p-5 transition-shadow hover:shadow-md" style={{ borderColor: colors.line, borderLeftWidth: 4, borderLeftColor: program.color }}>
                <Icon size={24} style={{ color: program.color }} />
                <h3 className="mt-3 font-serif text-lg font-semibold" style={{ color: colors.ink }}>{program.name}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.stone }}>{program.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="about" className="py-20" style={{ backgroundColor: colors.primary }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-white">Mahali ambapo Qur'ani inakuja kwanza</h2>
            <p className="mt-6 max-w-md leading-relaxed" style={{ color: colors.sage }}>
              Kila siku ya shule huanza na kuisha na Kitabu cha Allah. Wanafunzi wanaendelea kwa kasi yao wenyewe
              kupitia kuhifadhi, tajweed na kuelewa — na walimu wanaofuatilia safari yao kwa karibu, na portal ya
              kidijitali inayowafahamisha wazazi kila hatua.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.gold }}>
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Mtaala wa Qur'ani</p>
                <p className="text-xs" style={{ color: colors.sage }}>Kuanzia ngazi ya msingi hadi ya juu</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl">
            <Image src="/images/q1.jpg" alt="Qur'ani juu ya stand ya mbao" fill className="object-cover" sizes="(max-width: 768px) 90vw, 480px" />
          </div>
        </div>
      </section>

      <section id="teachers" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-serif text-3xl font-semibold" style={{ color: colors.primary }}>Kutana na baadhi ya walimu wetu</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEACHERS.map((teacher) => (
            <div key={teacher.name} className="rounded-xl border bg-white p-6 text-center transition-shadow hover:shadow-md" style={{ borderColor: colors.line }}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full font-serif text-lg font-semibold" style={{ backgroundColor: colors.sage, color: colors.primary }}>
                {teacher.initials}
              </div>
              <h3 className="mt-4 font-serif text-base font-semibold" style={{ color: colors.ink }}>{teacher.name}</h3>
              <p className="mt-1 text-sm" style={{ color: colors.stone }}>{teacher.role}</p>
              <div className="mt-3 flex items-center justify-center gap-1">
                <Clock size={12} style={{ color: colors.gold }} />
                <p className="text-xs" style={{ color: colors.gold }}>{teacher.exp} ya kufundisha</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="events" className="py-20" style={{ backgroundColor: colors.sage }}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl font-semibold" style={{ color: colors.primary }}>Yanayokuja</h2>
          <div className="mt-12 space-y-4">
            {EVENTS.map((event, index) => (
              <div key={event.title} className="flex gap-5 rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} style={{ color: colors.gold }} />
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.gold }}>{event.when}</p>
                  </div>
                  <h3 className="mt-1 font-serif text-lg font-semibold" style={{ color: colors.ink }}>{event.title}</h3>
                  <p className="mt-1 text-sm" style={{ color: colors.stone }}>{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl p-10 md:flex-row md:items-center" style={{ backgroundColor: colors.primary }}>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-white">Uko tayari kujiunga na madrasa?</h2>
            <p className="mt-2 max-w-md" style={{ color: colors.sage }}>Fungua akaunti ili kuandikisha mtoto wako au kujiandikisha kama mwalimu.</p>
          </div>
          <Link href="/register" className="shrink-0 rounded-full px-6 py-3 text-sm font-medium text-white transition-colors" style={{ backgroundColor: colors.gold }}>
            Fungua akaunti
          </Link>
        </div>
      </section>

      <footer className="border-t py-12" style={{ borderColor: colors.line }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>Al Madrasat Habiib El Mustwafaa</h3>
              <p className="mt-2 text-sm" style={{ color: colors.stone }}>Kigorofani, Zanzibar</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: colors.primary }}>Mawasiliano</h4>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone size={14} style={{ color: colors.gold }} />
                  <p className="text-sm" style={{ color: colors.stone }}>+255 123 456 789</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} style={{ color: colors.gold }} />
                  <p className="text-sm" style={{ color: colors.stone }}>info@almadrasat.ac.tz</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: colors.primary }}>Viungo</h4>
              <div className="mt-3 space-y-2">
                <Link href="/register" className="block text-sm hover:underline" style={{ color: colors.stone }}>Jiunge nasi</Link>
                <Link href="/login" className="block text-sm hover:underline" style={{ color: colors.stone }}>Ingia</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t pt-6 text-center" style={{ borderColor: colors.line }}>
            <p className="text-sm" style={{ color: colors.stone }}>
              © {new Date().getFullYear()} Al Madrasat Habiib El Mustwafaa, Kigorofani. Haki zote zimehifadhiwa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>{value}</p>
      <p className="text-xs" style={{ color: colors.stone }}>{label}</p>
    </div>
  );
}
