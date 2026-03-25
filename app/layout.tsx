import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ApiKeySettings from "@/components/ApiKeySettings";
import { APP_NAME } from "@/lib/config";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: `${APP_NAME} · Turn Subtitles Into Short-Form Clips`,
  description: "Analyze subtitle files, pick highlight moments, and export short-form video cuts with AI-generated edit direction.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: `${APP_NAME} · Turn Subtitles Into Short-Form Clips`,
    description: "Subtitle-first clip extraction for Shorts, Reels, and TikTok workflows.",
    images: ["/social-card.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} · Turn Subtitles Into Short-Form Clips`,
    description: "Subtitle-first clip extraction for creators.",
    images: ["/social-card.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body className="antialiased">
        <ApiKeySettings />
        {children}
      </body>
    </html>
  );
}
