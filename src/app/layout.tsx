import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ares34.com"),
  title: "ARES34 — Tu Consejo de Administración con IA",
  description:
    "12 entidades de IA que deliberan cada decisión antes de que la tomes. Deliberación ejecutiva, contratos, cumplimiento legal, escenarios, brief diario y más. Para CEOs y directores de PyMEs en México.",
  openGraph: {
    title: "ARES34 — Tu Consejo de Administración con IA",
    description:
      "12 entidades de IA organizadas en 3 niveles de gobierno corporativo. 7 módulos ejecutivos integrados. Para CEOs que facturan $5M–$100M al año.",
    type: "website",
    locale: "es_MX",
    siteName: "ARES34",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARES34 — Tu Consejo de Administración con IA",
    description:
      "12 entidades de IA que deliberan cada decisión antes de que la tomes.",
  },
  alternates: {
    canonical: "/",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${dmSans.variable} ${playfair.variable} ${ibmPlexMono.variable} font-sans antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
