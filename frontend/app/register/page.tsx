"use client";

import { useState, FormEvent } from "react";
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
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { colors } from "@/lib/colors";
import type { UserRole } from "@/lib/types";

const CLASS_OPTIONS = ["Darasa la 3", "Darasa la 4", "Darasa la 5", "Darasa la 6"];

const ROLE_OPTIONS: {
  value: UserRole;
  label: string;
  desc: string;
  icon: typeof User;
}[] = [
  {
    value: "student",
    label: "Mwanafunzi",
    desc: "Jiunge kama mwanafunzi",
    icon: GraduationCap,
  },
  {
    value: "teacher",
    label: "Mwalimu",
    desc: "Jiunge kama mwalimu",
    icon: Users,
  },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [className, setClassName] = useState(CLASS_OPTIONS[0]);
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
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
      const payload: Record<string, unknown> = {
        email,
        password,
        full_name: fullName,
        role,
        phone: phone || undefined,
      };
      if (role === "student") {
        payload.class_name = className;
        payload.guardian_name = guardianName || undefined;
        payload.guardian_phone = guardianPhone || undefined;
      } else if (role === "teacher") {
        payload.specialization = specialization || undefined;
      }
      const user = await register(payload);
      router.push(user.role === "student" ? "/dashboard" : "/teacher/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Imeshindikana kufungua akaunti. Tafadhali jaribu tena."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const passwordStrength = getPasswordStrength(password);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-6"
      style={{ backgroundColor: colors.soft }}
    >
      <div
        className="grid w-full max-w-6xl overflow-hidden rounded-2xl border bg-white lg:grid-cols-12"
        style={{ borderColor: colors.line }}
      >
        {/* ========== LEFT: FORM ========== */}
        <div className="col-span-full p-8 lg:col-span-8 lg:p-10">
          <div className="w-full">
            {/* Brand */}
            <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
             <Image
  src="/images/logo2.jpg"
  alt="Nembo ya madrasa"
  width={36}
  height={36}
  className="rounded-full object-cover"
  style={{ width: "auto", height: "auto" }}
/>
              <div>
                <p
                  className="font-serif text-sm font-semibold leading-tight"
                  style={{ color: colors.primary }}
                >
                  Al Madrasat Habiib
                </p>
                <p className="text-[11px]" style={{ color: colors.stone }}>
                  Kigorofani, Zanzibar
                </p>
              </div>
            </Link>

            {/* Heading + Role selector on same row */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1
                  className="font-serif text-3xl font-semibold leading-tight"
                  style={{ color: colors.primary }}
                >
                  Fungua akaunti yako.
                </h1>
                <p className="mt-1 text-sm" style={{ color: colors.stone }}>
                  Jiunge na madrasa kama mwanafunzi au mwalimu.
                </p>
              </div>

              <div className="flex gap-2">
                {ROLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setRole(option.value);
                        setError(null);
                      }}
                      className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 transition-colors"
                      style={{
                        borderColor: isActive ? colors.primary : colors.line,
                        backgroundColor: isActive ? colors.soft : "transparent",
                      }}
                    >
                      <Icon
                        size={15}
                        strokeWidth={1.75}
                        style={{ color: isActive ? colors.primary : colors.stone }}
                      />
                      <div className="text-left">
                        <p
                          className="text-xs font-semibold leading-none"
                          style={{ color: isActive ? colors.primary : colors.ink }}
                        >
                          {option.label}
                        </p>
                        <p
                          className="mt-0.5 text-[10px] leading-none"
                          style={{ color: colors.stone }}
                        >
                          {option.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form — 2-column grid on desktop to avoid scrolling */}
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Jina Kamili">
                  <div className="relative">
                    <User
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: colors.stone }}
                    />
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-colors"
                      style={{ borderColor: colors.line, color: colors.ink }}
                      placeholder="Mfano: Ahmed Ali"
                    />
                  </div>
                </Field>

                <Field label="Barua Pepe">
                  <div className="relative">
                    <Mail
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: colors.stone }}
                    />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-colors"
                      style={{ borderColor: colors.line, color: colors.ink }}
                      placeholder="jina@madrasa.sc.tz"
                    />
                  </div>
                </Field>

                <Field label="Nenosiri">
                  <div className="relative">
                    <Lock
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: colors.stone }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-colors"
                      style={{ borderColor: colors.line, color: colors.ink }}
                      placeholder="Herufi 6 au zaidi"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors hover:bg-[#F4F8F7]"
                      aria-label={showPassword ? "Ficha nenosiri" : "Onyesha nenosiri"}
                    >
                      {showPassword ? (
                        <EyeOff size={14} style={{ color: colors.stone }} />
                      ) : (
                        <Eye size={14} style={{ color: colors.stone }} />
                      )}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#E6EFED]">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${passwordStrength.score}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </Field>

                <Field label="Simu (si lazima)">
                  <div className="relative">
                    <Phone
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: colors.stone }}
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-colors"
                      style={{ borderColor: colors.line, color: colors.ink }}
                      placeholder="+255 123 456 789"
                    />
                  </div>
                </Field>
              </div>

              {role === "student" && (
                <div className="border-t pt-4" style={{ borderColor: colors.line }}>
                  <p
                    className="mb-3 text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    Taarifa za mwanafunzi
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Darasa">
                      <select
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: colors.line, color: colors.ink }}
                      >
                        {CLASS_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Jina la Mzazi (si lazima)">
                      <input
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: colors.line, color: colors.ink }}
                        placeholder="Fatuma Mohammed"
                      />
                    </Field>

                    <Field label="Simu ya Mzazi (si lazima)">
                      <input
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: colors.line, color: colors.ink }}
                        placeholder="+255 123 456 789"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {role === "teacher" && (
                <div className="border-t pt-4" style={{ borderColor: colors.line }}>
                  <p
                    className="mb-3 text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    Taarifa za mwalimu
                  </p>
                  <Field label="Utaalamu (si lazima)">
                    <input
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none sm:max-w-md"
                      style={{ borderColor: colors.line, color: colors.ink }}
                      placeholder="Mfano: Qur'ani na Tajweed"
                    />
                  </Field>
                </div>
              )}

              {error && (
                <div
                  className="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs"
                  style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", color: "#991B1B" }}
                >
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col-reverse items-center gap-3 border-t pt-4 sm:flex-row sm:justify-between" style={{ borderColor: colors.line }}>
                <p className="text-xs" style={{ color: colors.stone }}>
                  Una akaunti tayari?{" "}
                  <Link
                    href="/login"
                    className="font-medium hover:underline"
                    style={{ color: colors.primary }}
                  >
                    Ingia hapa
                  </Link>
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-60 sm:w-auto"
                  style={{ backgroundColor: colors.primary }}
                >
                  {submitting ? "Inafungua akaunti..." : "Fungua akaunti"}
                  {!submitting && (
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ========== RIGHT: BRAND PANEL ========== */}
        <div
          className="relative hidden overflow-hidden lg:col-span-4 lg:flex lg:flex-col lg:justify-between"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="geo-pattern absolute inset-0 opacity-[0.08]" aria-hidden />

          <div className="relative p-8">
            <div className="flex items-center gap-2 text-white/70">
              <BookOpen size={14} strokeWidth={1.75} />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                Jiunge Nasi
              </span>
            </div>

            <h2 className="mt-6 font-serif text-2xl font-semibold leading-[1.2] text-white">
              Safari yako ya kujifunza Qur'ani inaanza hapa.
            </h2>

            <p className="mt-4 text-xs leading-relaxed text-white/70">
              Fungua akaunti kwa dakika chache na uanze kufuatilia masomo, mitihani na maendeleo yako.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: CheckCircle2,
                  title: "Usajili Rahisi",
                  desc: "Hatua chache tu na unaanza.",
                },
                {
                  icon: BookOpen,
                  title: "Masomo 9",
                  desc: "Qur'ani, Tajweed, Fiqh na zaidi.",
                },
                {
                  icon: ShieldCheck,
                  title: "Usalama",
                  desc: "Taarifa zako zinalindwa.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                      <Icon size={14} className="text-white" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-serif text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative border-t border-white/10 p-8">
            <p className="font-serif text-sm italic leading-relaxed text-white/80">
              &ldquo;Mwenye kutafuta elimu, Mwenyezi Mungu humfungulia njia ya Pepo.&rdquo;
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/50">
              Hadith — Muslim
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
        style={{ color: colors.primary }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (password.length === 0) {
    return { score: 0, label: "", color: colors.line };
  }
  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 15;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  if (score < 40) return { score, label: "Dhaifu", color: "#DC2626" };
  if (score < 70) return { score, label: "Wastani", color: "#D97706" };
  return { score: 100, label: "Imara", color: "#059669" };
}
