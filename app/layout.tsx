import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import WebVitalsReporter from "@/lib/WebVitalsReporter";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Pulse — Stay in the moment",
  description: "A social platform built around what's happening right now.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-ink-900 text-mist-100 font-body`}
      >
        <WebVitalsReporter />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
