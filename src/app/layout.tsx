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
  title: "ARES34 — Tu Fortune 500 Personal",
  description: "Inteligencia ejecutiva bajo demanda para fundadores de PyMEs en México. 16 agentes de IA deliberan tus decisiones de negocio.",
  openGraph: {
    title: "ARES34 — Tu Fortune 500 Personal",
    description: "Gobernanza corporativa con IA para fundadores de PyMEs en México.",
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
