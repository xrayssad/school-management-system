"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";

export default function CommitteeGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "committee" && user.role !== "admin") {
      if (user.role === "teacher") router.replace("/teacher/dashboard");
      else router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm"
        style={{ backgroundColor: "#F0F5F2", color: "#4A554F" }}
      >
        Inahakiki ruhusa...
      </div>
    );
  }

  if (user.role !== "committee" && user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
