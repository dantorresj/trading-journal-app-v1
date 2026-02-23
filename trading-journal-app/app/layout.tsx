import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// Fuentes configuradas
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KintEdge - Trading Journal",
  description: "Convierte tus pérdidas en oro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${sourceSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
