import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sovereign Intelligence Layer",
  description: "Private, Edge-Native Agentic Framework for Decentralized Community Resource Access",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased bg-background text-foreground h-full overflow-hidden">
        {children}
      </body>
    </html>
  );
}
