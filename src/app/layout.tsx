import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dialarme Quote Generator",
  description: "Professional PDF quote generator for Dialarme - Alarm systems, video surveillance, and security solutions",
  keywords: ["Dialarme", "quote generator", "PDF", "alarm systems", "video surveillance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

