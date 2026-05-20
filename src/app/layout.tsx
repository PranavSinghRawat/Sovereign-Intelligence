import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sovereign Intelligence Layer",
  description: "Private, Edge-Native Agentic Framework for Decentralized Community Resource Access",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="antialiased bg-radial-gradient text-foreground h-full overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
