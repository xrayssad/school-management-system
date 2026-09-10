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
  Users,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { colors } from "@/lib/colors";

const PORTAL_USERS = [
  {
    role: "Mwalimu",
    email: "ahmed.ali@madrasa.sc.tz",
    password: "Teacher@123",
  },
  {
    role: "Mwanafunzi",
    email: "ahmed.mohammed@student.madrasa.sc.tz",
    password: "Student@123",
  },
];

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
      const user = await login(email, password);

      if (user.role === "committee") {
        router.push("/committee/dashboard");
      } else if (user.role === "teacher" || user.role === "admin") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Imeshindikana kuingia. Tafadhali jaribu tena."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(user: (typeof PORTAL_USERS)[number]) {
    setEmail(user.email);
    setPassword(user.password);
    setActiveDemo(user.role);
    setError(null);
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{ backgroundColor: colors.soft }}
    >
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border bg-white lg:grid-cols-12"
        style={{ borderColor: colors.line }}
      >
        {/* ========== LEFT: FORM ========== */}
        <div className="col-span-full flex items-center justify-center p-8 sm:p-10 lg:col-span-7">
          <div className="w-full max-w-sm">
            {/* Brand */}
            <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
             <Image
  src="/images/logo2.jpg"
  alt="Nembo ya madrasa"
  width={38}
  height={38}
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

            {/* Heading */}
            <h1
              className="font-serif text-3xl font-semibold leading-tight"
              style={{ color: colors.primary }}
            >
              Karibu tena.
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: colors.stone }}>
              Ingia kwenye portal yako ya madrasa.
            </p>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                  style={{ color: colors.primary }}
                >
                  Barua Pepe
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: colors.stone }}
                  />
                  <input
                    id="email"
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
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    Nenosiri
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-medium hover:underline"
                    style={{ color: colors.primary }}
                  >
                    Umesahau?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: colors.stone }}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-colors"
                    style={{ borderColor: colors.line, color: colors.ink }}
                    placeholder="Weka nenosiri lako"
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
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs"
                  style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", color: "#991B1B" }}
                >
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-60"
                style={{ backgroundColor: colors.primary }}
              >
                {submitting ? "Inaingia..." : "Ingia kwenye portal"}
                {!submitting && (
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-xs" style={{ color: colors.stone }}>
              Hauna akaunti bado?{" "}
              <Link
                href="/register"
                className="font-medium hover:underline"
                style={{ color: colors.primary }}
              >
                Fungua akaunti mpya
              </Link>
            </p>

            {/* Demo credentials */}
            <div
              className="mt-8 rounded-xl border p-4"
              style={{ borderColor: colors.line, backgroundColor: colors.soft }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} style={{ color: colors.primary }} />
                <p
                  className="text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: colors.primary }}
                >
                  Akaunti za majaribio
                </p>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: colors.stone }}>
                Bonyeza mojawapo ili kujaza taarifa moja kwa moja.
              </p>

              <div className="mt-3 grid gap-1.5">
                {PORTAL_USERS.map((user) => {
                  const isActive = activeDemo === user.role;
                  return (
                    <button
                      key={user.role}
                      type="button"
                      onClick={() => fillDemo(user)}
                      className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-left transition-colors"
                      style={{
                        borderColor: isActive ? colors.primary : colors.line,
                      }}
                    >
                      <div className="min-w-0">
                        <p
                          className="text-xs font-medium"
                          style={{ color: isActive ? colors.primary : colors.ink }}
                        >
                          {user.role}
                        </p>
                        <p
                          className="mt-0.5 truncate text-[10px]"
                          style={{ color: colors.stone }}
                        >
                          {user.email}
                        </p>
                      </div>
                      <span
                        className="ml-2 shrink-0 text-[10px] font-medium"
                        style={{ color: isActive ? colors.primary : colors.stone }}
                      >
                        {isActive ? "Imejazwa" : "Jaza"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ========== RIGHT: BRAND PANEL ========== */}
        <div
          className="relative hidden overflow-hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-between"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="geo-pattern absolute inset-0 opacity-[0.08]" aria-hidden />

          <div className="relative p-8">
            <div className="flex items-center gap-2 text-white/70">
              <BookOpen size={14} strokeWidth={1.75} />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                Madrasa ya Kiislamu
              </span>
            </div>

            <h2 className="mt-6 font-serif text-2xl font-semibold leading-[1.2] text-white">
              Kila somo ni hatua moja karibu zaidi na Qur'ani.
            </h2>

            <p className="mt-4 text-xs leading-relaxed text-white/70">
              Portal inawaunganisha wanafunzi, walimu na wazazi katika safari moja ya kujifunza.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: BookOpen, title: "Mtaala Kamili", desc: "Masomo 9 ya msingi." },
                { icon: Users, title: "Walimu wa Uzoefu", desc: "Ufuatiliaji wa kila mwanafunzi." },
                { icon: ShieldCheck, title: "Usalama", desc: "Taarifa zako zinalindwa." },
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
              &ldquo;Bora wenu ni yule anayejifunza Qur'ani na kuifundisha.&rdquo;
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/50">
              Hadith — Bukhari
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
