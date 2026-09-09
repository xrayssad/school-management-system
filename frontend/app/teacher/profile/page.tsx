"use client";

import { useState, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function TeacherProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [specialization, setSpecialization] = useState(user?.teacher_profile?.specialization ?? "");
  const [experienceYears, setExperienceYears] = useState(user?.teacher_profile?.experience_years ?? 0);
  const [bio, setBio] = useState(user?.teacher_profile?.bio ?? "");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  if (!user) return null;

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    try {
      await api.put("/users/me", { full_name: fullName, phone, specialization, experience_years: experienceYears, bio });
      await refreshUser();
      setSavedMsg("Profile updated.");
    } catch (err) {
      setSavedMsg(err instanceof ApiError ? err.message : "Could not save changes.");
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    try {
      await api.post("/users/me/change-password", { current_password: currentPassword, new_password: newPassword });
      setPwMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPwMsg(err instanceof ApiError ? err.message : "Could not change password.");
    }
  }

  return (
    <div>
      <PageHeader title="My profile" subtitle={user.teacher_profile?.staff_code ?? ""} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-lg font-semibold text-ink">Personal & professional details</h2>
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <Field label="Full name"><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="fld" /></Field>
            <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className="fld" /></Field>
            <Field label="Specialization"><input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="fld" /></Field>
            <Field label="Years of experience"><input type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} className="fld" /></Field>
            <Field label="Bio"><textarea value={bio} onChange={(e) => setBio(e.target.value)} className="fld" rows={3} /></Field>
            {savedMsg && <p className="text-sm text-teal-700">{savedMsg}</p>}
            <button type="submit" className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800">
              Save changes
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="font-serif text-lg font-semibold text-ink">Change password</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <Field label="Current password"><input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="fld" /></Field>
            <Field label="New password"><input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="fld" /></Field>
            {pwMsg && <p className="text-sm text-teal-700">{pwMsg}</p>}
            <button type="submit" className="rounded-full border border-teal-700 px-5 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50">
              Update password
            </button>
          </form>
        </Card>
      </div>

      <style jsx global>{`
        .fld { width: 100%; border: 1px solid #cfe4df; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; margin-top: 0.25rem; }
        .fld:focus { outline: none; border-color: #0f5f53; }
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
