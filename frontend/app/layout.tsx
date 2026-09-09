import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Al Madrasat Habiib El Mustwafaa | Kigorofani",
  description:
    "School management system for Al Madrasat Habiib El Mustwafaa — Qur'an, Tajweed and Islamic studies in Kigorofani.",
  icons: { icon: "/images/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
