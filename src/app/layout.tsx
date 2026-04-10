import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

import { headers } from "next/headers";
import { HEADER_USER_ROLE } from "@/lib/auth/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ちょこちょこ大百科",
  description: "ちょこれとちょこれリスナーの公式大百科",
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
        className={`${inter.variable} min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-amber-100 antialiased flex flex-col`}
      >
        <Header userRole={userRole} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
