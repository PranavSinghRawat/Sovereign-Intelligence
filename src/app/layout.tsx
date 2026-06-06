import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CanvasProvider } from "@/context/CanvasContext";
import { BackgroundCanvas } from "@/components/ui/BackgroundCanvas";

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sentinel Intelligence Layer",
  description: "Private, Edge-Native Agentic Framework for Decentralized Community Resource Access",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sansFont.variable} ${monoFont.variable} min-h-screen`} suppressHydrationWarning>
      <body className="antialiased bg-radial-gradient text-foreground min-h-screen font-sans" suppressHydrationWarning>
        <CanvasProvider>
          <BackgroundCanvas />
          {children}
        </CanvasProvider>
      </body>
    </html>
  );
}

