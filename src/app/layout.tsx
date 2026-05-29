import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LandscapeAI — Design Your Dream Yard",
  description: "Upload a photo of your yard and get AI-generated landscaping design variations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <span className="text-xl font-bold text-primary-600">LandscapeAI</span>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
