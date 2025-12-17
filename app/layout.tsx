// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { LoadingProvider } from "@/components/global/loading-manager";
import { GlobalLoading } from "@/components/global/global-loading";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A-LUXE REALTY",
  description: "Luxury Real Estate Platform - Invest Smart. Live Luxe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}
      >
        <LoadingProvider>
          <AuthProvider>
            <GlobalLoading />
            {children}
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}