import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./Providers";
import ThemeDebug from "@/components/ThemeDebug";
import ThemeScript from "@/components/ThemeScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RailYatra - Book Train Tickets Easily",
  description: "India's premier train ticket booking platform. Search for trains, check schedules, and book tickets easily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={`${inter.className} bg-white dark:bg-gray-900`}>
        <ThemeScript />
        <Providers>
          <div className="flex flex-col min-h-screen text-gray-900 dark:text-white transition-colors duration-200">
            <Header />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
            {process.env.NODE_ENV !== 'production' && <ThemeDebug />}
          </div>
        </Providers>
      </body>
    </html>
  );
}
