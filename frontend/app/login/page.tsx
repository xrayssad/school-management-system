"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { colors } from "@/lib/colors";
import Slideshow, { type Slide } from "@/components/Slideshow";

const LOGIN_SLIDES: Slide[] = [
  { src: "/images/pici1.jpg", alt: "Wanafunzi", caption: "Karibu tena — endelea na safari yako" },
  { src: "/images/q1.jpg", alt: "Qurani", caption: "Qurani ndio msingi wa kila somo" },
  { src: "/images/pici2.jpg", alt: "Darasa", caption: "Mazingira tulivu ya kujifunza" },
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
.auth-book .book-page input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 12px 40px 12px 34px;
  font-size: 14px;
  color: #1A231F;
  caret-color: #18453B;
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2318453B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E") 2 22, text;
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
  border-radius: 6px;
}
`;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === "committee") router.push("/committee/dashboard");
      else if (user.role === "teacher" || user.role === "admin") router.push("/teacher/dashboard");
      else router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Imeshindikana kuingia. Jaribu tena.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="auth-book flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundColor: colors.soft }}
    >
      <style dangerouslySetInnerHTML={{ __html: BOOK_CSS }} />
      <div
        className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-white lg:grid-cols-12"
        style={{ borderColor: colors.line }}
      >
        <div className="col-span-full flex items-center justify-center p-8 sm:p-10 lg:col-span-6">
          <div className="w-full max-w-sm">
            <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
              <Image src="/images/logo2.jpg" alt="Nembo" width={40} height={40} className="rounded-full object-cover" style={{ width: 40, height: 40 }} />
              <div>
                <p className="font-serif text-sm font-semibold" style={{ color: colors.primary }}>Al Madrasat Habiib</p>
                <p className="text-[11px]" style={{ color: colors.stone }}>Kigorofani, Zanzibar</p>
              </div>
            </Link>

            <h1 className="font-serif text-3xl font-semibold" style={{ color: colors.primary }}>Karibu tena</h1>
          
            

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Namba ya usajili au barua pepe</label>
                <div className="book-field">
                  <div className="book-spine" aria-hidden />
                  <div className="book-page">
                    <Mail size={15} className="ico" />
                    <input type="text" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Namba ya usajili au email" />
                  </div>
                  <div className="book-edge" aria-hidden />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Nenosiri</label>
                <div className="book-field">
                  <div className="book-spine" aria-hidden />
                  <div className="book-page">
                    <Lock size={15} className="ico" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Namba ya usajili au email"
                    />
                    <button type="button" className="book-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Ficha" : "Onyesha"}>
                      {showPassword ? <EyeOff size={14} style={{ color: colors.stone }} /> : <Eye size={14} style={{ color: colors.stone }} />}
                    </button>
                  </div>
                  <div className="book-edge" aria-hidden />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs" style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", color: "#991B1B" }}>
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="group flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: colors.primary }}>
                {submitting ? "Inaingia…" : "Ingia"}
                {!submitting && <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
          
            <p className="mt-3 text-center text-sm">
              <Link href="/forgot-password" className="font-medium hover:underline" style={{ color: colors.primary }}>
                Umesahau nenosiri?
              </Link>
            </p>

            <p className="mt-6 text-center text-xs" style={{ color: colors.stone }}>
              Hauna akaunti?{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: colors.primary }}>Jisajili</Link>
            </p>

            <div className="mt-8 rounded-xl border p-3" style={{ borderColor: colors.line, backgroundColor: colors.soft }}>
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck size={13} style={{ color: colors.primary }} />
              </div>
              <div className="grid gap-1.5">
                </div>
            </div>
          </div>
        </div>

        <div className="relative hidden flex-col overflow-hidden lg:col-span-6 lg:flex" style={{ backgroundColor: colors.primary }}>
          <div className="relative flex flex-1 flex-col p-6">
            <div className="flex items-center gap-2 text-white/70">
              <BookOpen size={14} />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em]">Madrasa ya Kiislamu</span>
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold leading-snug text-white">Kila somo ni hatua moja karibu na Qurani.</h2>
            <div className="mt-5 flex-1"><Slideshow slides={LOGIN_SLIDES} intervalMs={4800} showDots /></div>
            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="font-serif text-sm italic text-white/85">&ldquo;Bora wenu ni yule anayejifunza Qurani na kuifundisha.&rdquo;</p>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-white/45">Hadith — Bukhari</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}