"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import type { UserRole } from "@/lib/types";

const CLASS_OPTIONS = ["Darasa la 3", "Darasa la 4", "Darasa la 5", "Darasa la 6"];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-6 py-12">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <Image src="/images/logo2.jpg" alt="Madrasa logo" width={44} height={44} className="rounded-full object-cover" />
          <span className="font-serif text-lg font-semibold text-teal-900">Al Madrasat Habiib</span>
        </Link>

        <div className="rounded-xl2 border border-teal-100/60 bg-white p-8 shadow-soft">
          <h1 className="font-serif text-2xl font-semibold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-ink-400">Register as a student or a teacher.</p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-full bg-sage p-1">
            {(["student", "teacher"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-full py-2 text-sm font-medium capitalize transition-colors ${
                  role === r ? "bg-teal-700 text-white" : "text-ink-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Full name">
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
            </Field>
            <Field label="Email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </Field>
            <Field label="Password">
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
            </Field>
            <Field label="Phone (optional)">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+255 ..." />
            </Field>

            {role === "student" && (
              <>
                <Field label="Class">
                  <select value={className} onChange={(e) => setClassName(e.target.value)} className="input">
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Guardian name (optional)">
                  <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="input" />
                </Field>
                <Field label="Guardian phone (optional)">
                  <input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} className="input" />
                </Field>
              </>
            )}

            {role === "teacher" && (
              <Field label="Specialization (optional)">
                <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="input" placeholder="e.g. Quran & Tajweed" />
              </Field>
            )}

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-teal-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60"
            >
              {submitting ? "Creating account\u2026" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-teal-700 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #cfe4df;
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .input:focus {
          outline: none;
          border-color: #0f5f53;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-600">{label}</label>
      {children}
    </div>
  );
}
