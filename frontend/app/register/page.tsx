"use client";

import { useState, FormEvent, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { colors } from "@/lib/colors";
import Slideshow, { type Slide } from "@/components/Slideshow";

const CLASS_OPTIONS = ["Darasa la 1", "Darasa la 2", "Darasa la 3", "Darasa la 4", "Darasa la 5"];

const REGISTER_SLIDES: Slide[] = [
  { src: "/images/pici1.jpg", alt: "Wanafunzi", caption: "Masomo ya kila siku ya Qurani na Tajwid" },
  { src: "/images/pici2.jpg", alt: "Darasa", caption: "Mazingira tulivu ya kujifunza" },
  { src: "/images/q1.jpg", alt: "Qurani", caption: "Qurani ndio msingi wa kila somo" },
];

const BOOK_CSS = `
.auth-book .book-field {
  display: flex;
  align-items: stretch;
  min-height: 46px;
  background: #fff;
  border: 2px solid #18453B;
  border-radius: 3px 14px 14px 3px;
  box-shadow: 2px 2px 0 rgba(24,69,59,0.07);
  overflow: hidden;
  transition: box-shadow 0.15s ease;
}
.auth-book .book-field:focus-within {
  box-shadow: 0 0 0 3px rgba(24,69,59,0.14);
}
.auth-book .book-spine {
  width: 11px;
  flex-shrink: 0;
  background: repeating-linear-gradient(
    to bottom,
    #0F2F28 0px,
    #0F2F28 2px,
    #18453B 2px,
    #18453B 5px
  );
}
.auth-book .book-page {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #F4F8F6 0%, #FFFFFF 12%);
  min-width: 0;
}
.auth-book .book-edge {
  width: 7px;
  flex-shrink: 0;
  background: linear-gradient(to right, #D7E5DF, #F7FAF8);
  border-left: 1px solid #C5D4CC;
}
.auth-book .book-page .ico {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #18453B;
  pointer-events: none;
}
.auth-book .book-page input,
.auth-book .book-page select {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 12px 12px 12px 34px;
  font-size: 14px;
  color: #1A231F;
  caret-color: #18453B;
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2318453B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E") 2 22, text;
}
.auth-book .book-page input.no-ico,
.auth-book .book-page select.no-ico {
  padding-left: 12px;
}
.auth-book .book-toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  padding: 6px;
  cursor: pointer;
}
`;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [className, setClassName] = useState(CLASS_OPTIONS[0]);
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 3) {
      setError("Jina kamili liwe na herufi 3 au zaidi.");
      return;
    }
    if (password.length < 6) {
      setError("Nenosiri liwe na herufi 6 au zaidi.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role: "student",
        phone: phone || undefined,
        class_name: className,
        guardian_name: guardianName || undefined,
        guardian_phone: guardianPhone || undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Imeshindikana kufungua akaunti. Jaribu tena.");
    } finally {
      setSubmitting(false);
    }
  }

  const strength = passwordStrength(password);

  return (
    <div className="auth-book flex min-h-screen items-center justify-center px-4 py-6" style={{ backgroundColor: colors.soft }}>
      <style dangerouslySetInnerHTML={{ __html: BOOK_CSS }} />
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl border bg-white lg:grid-cols-12" style={{ borderColor: colors.line }}>
        <div className="col-span-full p-6 sm:p-8 lg:col-span-7 lg:p-10">
          <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
            <Image src="/images/logo2.jpg" alt="Nembo" width={36} height={36} className="rounded-full object-cover" style={{ width: 36, height: 36 }} />
            <div>
              <p className="font-serif text-sm font-semibold" style={{ color: colors.primary }}>Al Madrasat Habiib</p>
              <p className="text-[11px]" style={{ color: colors.stone }}>Kigorofani, Zanzibar</p>
            </div>
          </Link>

          <h1 className="font-serif text-3xl font-semibold" style={{ color: colors.primary }}>Fungua akaunti</h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>Jiunge kama mwanafunzi.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Labeled label="Jina kamili">
                <BookInput icon={<User size={15} className="ico" />}>
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ahmed Ali" />
                </BookInput>
              </Labeled>
              <Labeled label="Barua pepe">
                <BookInput icon={<Mail size={15} className="ico" />}>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jina@mfano.co.tz" />
                </BookInput>
              </Labeled>
              <Labeled label="Nenosiri">
                <BookInput
                  icon={<Lock size={15} className="ico" />}
                  trailing={
                    <button type="button" className="book-toggle" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? <EyeOff size={14} style={{ color: colors.stone }} /> : <Eye size={14} style={{ color: colors.stone }} />}
                    </button>
                  }
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Andika nenosiri…"
                    style={{ paddingRight: 40 }}
                  />
                </BookInput>
                {password.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: colors.line }}>
                      <div className="h-full transition-all" style={{ width: `${strength.score}%`, backgroundColor: strength.color }} />
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </Labeled>
              <Labeled label="Simu (si lazima)">
                <BookInput icon={<Phone size={15} className="ico" />}>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+255 …" />
                </BookInput>
              </Labeled>
            </div>

            <div className="border-t pt-4" style={{ borderColor: colors.line }}>
              <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>
                <Users size={13} /> Taarifa za mwanafunzi
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Labeled label="Darasa">
                  <BookInput>
                    <select className="no-ico" value={className} onChange={(e) => setClassName(e.target.value)}>
                      {CLASS_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </BookInput>
                </Labeled>
                <Labeled label="Mzazi (si lazima)">
                  <BookInput>
                    <input className="no-ico" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="Jina la mzazi" />
                  </BookInput>
                </Labeled>
                <Labeled label="Simu ya mzazi">
                  <BookInput>
                    <input className="no-ico" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="+255 …" />
                  </BookInput>
                </Labeled>
              </div>
            </div>

            {error && (
              <div className="flex gap-2 rounded-lg border px-3 py-2.5 text-xs" style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", color: "#991B1B" }}>
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse items-center gap-3 border-t pt-4 sm:flex-row sm:justify-between" style={{ borderColor: colors.line }}>
              <p className="text-xs" style={{ color: colors.stone }}>
                Una akaunti?{" "}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: colors.primary }}>Ingia</Link>
              </p>
              <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto" style={{ backgroundColor: colors.primary }}>
                {submitting ? "Inahifadhi…" : "Fungua akaunti"}
                {!submitting && <ArrowRight size={15} />}
              </button>
            </div>
          </form>
        </div>

        <div className="relative hidden flex-col lg:col-span-5 lg:flex" style={{ backgroundColor: colors.primary }}>
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-2 text-white/70">
              <BookOpen size={14} />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em]">Jiunge nasi</span>
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold text-white">Safari ya kujifunza Qurani inaanza hapa.</h2>
            <div className="mt-5"><Slideshow slides={REGISTER_SLIDES} intervalMs={5000} showDots /></div>
            <div className="mt-6 space-y-3">
              {[
                { icon: CheckCircle2, title: "Usajili rahisi", desc: "Hatua chache tu." },
                { icon: BookOpen, title: "Masomo 9", desc: "Qurani, Tajwid, Fiqh na zaidi." },
                { icon: ShieldCheck, title: "Usalama", desc: "Taarifa zako zinalindwa." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                      <Icon size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-[11px] text-white/60">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto border-t border-white/15 pt-5">
              <p className="font-serif text-sm italic text-white/85">&ldquo;Mwenye kutafuta elimu, Mwenyezi Mungu humfungulia njia ya Pepo.&rdquo;</p>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-white/45">Hadith — Muslim</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>{label}</label>
      {children}
    </div>
  );
}

function BookInput({
  icon,
  trailing,
  children,
}: {
  icon?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="book-field">
      <div className="book-spine" aria-hidden />
      <div className="book-page">
        {icon}
        {children}
        {trailing}
      </div>
      <div className="book-edge" aria-hidden />
    </div>
  );
}

function passwordStrength(password: string) {
  if (!password) return { score: 0, label: "", color: colors.line };
  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 15;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  if (score < 40) return { score, label: "Dhaifu", color: "#DC2626" };
  if (score < 70) return { score, label: "Wastani", color: "#D97706" };
  return { score: 100, label: "Imara", color: colors.primary };
}
