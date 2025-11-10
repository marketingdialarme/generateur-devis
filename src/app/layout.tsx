import type { Metadata } from "next";
import Script from "next/script";
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
      <head>
        {/* Load jsPDF from CDN */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}