import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/contact-footer";
import { CommandPalette } from "@/components/sections/command-palette";
import { personal } from "@/data/config";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fauzan Alsyundawy — Network Engineer | BGP, OSPF, IPv4 Infrastructure",
  description: "Senior Network Engineer spesialis BGP multihoming, dan IPv4 engineering skala enterprise. Berbasis di Jakarta, Indonesia.",
  openGraph: {
    title: "Fauzan Alsyundawy — Network Engineer | BGP, OSPF, IPv4",
    description: "Senior Network Engineer spesialis BGP multihoming, IPv4 engineering skala enterprise.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: personal.name,
    jobTitle: personal.title,
    url: "https://yourdomain.com",
    sameAs: [personal.linkedin, personal.github, personal.gitlab],
  };

  return (
    <html lang="id" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        {/* Skip to main content — aksesibilitas screen reader */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:bg-signal focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
        >
          Langsung ke konten utama
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <CommandPalette />
        <Toaster position="bottom-right" richColors />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
