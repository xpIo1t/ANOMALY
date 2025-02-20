import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'AINARCHY - The Unfiltered Jailbreak Chat AI',
  description: 'Experience the raw, unfiltered power of AINARCHY - the AI chat interface with no filters or censorship.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'AINARCHY - The Unfiltered Jailbreak Chat AI',
    description: 'Experience the raw, unfiltered power of AINARCHY - the AI chat interface with no filters or censorship.',
    images: [
      {
        url: '/banner.png',
        width: 800,
        height: 600,
        alt: 'ANARCHY Banner',
      },
    ],
  },
}; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
