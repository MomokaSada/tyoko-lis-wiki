import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { IpBanGate } from "../components/auth/IpBanGate";
import { AccountBanGate } from "../components/auth/AccountBanGate";
import { ToastProvider } from "../components/ui/toast";

import { headers } from "next/headers";
import { HEADER_USER_ROLE } from "@/lib/auth/constants";

const inter = localFont({
  src: "./fonts/Inter-Latin.woff2",
  variable: "--font-inter",
});

const defaultTitle = "ちょこちょこ大百科";
const defaultDescription = "ちょこれとちょこれリスナーの公式大百科";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tyokore.com';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${defaultTitle}`,
  },
  description: defaultDescription,
  alternates: {
    canonical: '/',
    languages: {
      'ja': '/',
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    siteName: defaultTitle,
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: '/images/app-icon.webp',
        width: 1000,
        height: 1000,
        alt: defaultTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/images/app-icon.webp'],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);

  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-stone-50 text-stone-900 font-sans antialiased flex flex-col`}
      >
        <Header userRole={userRole} />
        <ToastProvider>
          <main className="flex-1">
            <AccountBanGate>
              <IpBanGate>
                {children}
              </IpBanGate>
            </AccountBanGate>
          </main>
        </ToastProvider>
        <Footer />
      </body>
    </html>
  );
}
