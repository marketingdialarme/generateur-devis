import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dialarme - Générateur de Devis",
  description: "Générateur de devis professionnel pour Dialarme - Systèmes d'alarme, vidéosurveillance et solutions de sécurité",
  keywords: ["Dialarme", "générateur de devis", "PDF", "systèmes d'alarme", "vidéosurveillance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

