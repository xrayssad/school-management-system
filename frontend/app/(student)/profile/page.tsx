"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { useState, FormEvent } from "react";
import { User, Lock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [guardianName, setGuardianName] = useState(user?.student_profile?.guardian_name ?? "");
  const [guardianPhone, setGuardianPhone] = useState(user?.student_profile?.guardian_phone ?? "");
  const [address, setAddress] = useState(user?.student_profile?.address ?? "");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  if (!user) return null;

  const fld: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${colors.line}`,
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    marginTop: 4,
  };

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    try {
      await api.put("/users/me", {
        full_name: fullName,
        phone,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        address,
      });
      await refreshUser();
      setSavedMsg("Wasifu umehifadhiwa.");
    } catch (err) {
      setSavedMsg(err instanceof ApiError ? err.message : "Imeshindikana kuhifadhi.");
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    try {
      await api.post("/users/me/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwMsg("Nenosiri limebadilishwa.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPwMsg(err instanceof ApiError ? err.message : "Imeshindikana kubadilisha nenosiri.");
    }
  }

  // loading handled
  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <PageHeader
        title="Wasifu wangu"
        subtitle={`${user.student_profile?.class_name ?? ""} · ${user.student_profile?.student_code ?? ""}`}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
            <User size={18} />
            <h2 className="font-serif text-lg font-semibold">Taarifa binafsi</h2>
          </div>
          <form onSubmit={saveProfile} className="space-y-3">
            <label className="block text-sm" style={{ color: colors.stone }}>Jina kamili<input value={fullName} onChange={(e) => setFullName(e.target.value)} style={fld} /></label>
            <label className="block text-sm" style={{ color: colors.stone }}>Simu<input value={phone} onChange={(e) => setPhone(e.target.value)} style={fld} /></label>
            <label className="block text-sm" style={{ color: colors.stone }}>Jina la mzazi<input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} style={fld} /></label>
            <label className="block text-sm" style={{ color: colors.stone }}>Simu ya mzazi<input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} style={fld} /></label>
            <label className="block text-sm" style={{ color: colors.stone }}>Anwani<textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} style={fld} /></label>
            {savedMsg && <p className="text-sm" style={{ color: colors.primary }}>{savedMsg}</p>}
            <button type="submit" className="rounded-full px-5 py-2 text-sm font-medium text-white" style={{ backgroundColor: colors.primary }}>Hifadhi</button>
          </form>
        </Card>
        <Card>
          <div className="mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
            <Lock size={18} />
            <h2 className="font-serif text-lg font-semibold">Badilisha nenosiri</h2>
          </div>
          <form onSubmit={changePassword} className="space-y-3">
            <label className="block text-sm" style={{ color: colors.stone }}>Nenosiri la sasa<input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={fld} /></label>
            <label className="block text-sm" style={{ color: colors.stone }}>Nenosiri jipya<input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={fld} /></label>
            {pwMsg && <p className="text-sm" style={{ color: colors.primary }}>{pwMsg}</p>}
            <button type="submit" className="rounded-full border px-5 py-2 text-sm font-medium" style={{ borderColor: colors.primary, color: colors.primary }}>Sasisha nenosiri</button>
          </form>
        </Card>
      </div>
    </div>
  );
}
