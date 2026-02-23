import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ARES34 — Tu Consejo de Administración con IA",
  description: "9 directores de IA que cuestionan cada decisión antes de que la tomes. CEO Virtual, Consejo Directivo y Junta de Inversionistas para CEOs y directores.",
  openGraph: {
    title: "ARES34 — Tu Consejo de Administración con IA",
    description: "9 directores de IA que cuestionan cada decisión antes de que la tomes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} font-sans antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
