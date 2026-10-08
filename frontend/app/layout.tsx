import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Madrasatul Habiib El Mustwafaa | Kigorofani, Zanzibar",
  description:
    "Madrasa ya Kiislamu Kigorofani, Zanzibar — Qur'ani, Tajweed, Hadith na elimu ya dini.",
  icons: { icon: "/images/logo2.jpg", apple: "/images/logo2.jpg" },
  openGraph: {
    title: "Madrasatul Habiib El Mustwafaa",
    description: "Elimu yenye msingi wa Qur'ani — Kigorofani, Zanzibar",
    locale: "sw_TZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sw">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
