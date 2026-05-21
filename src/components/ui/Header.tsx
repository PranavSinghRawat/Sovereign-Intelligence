"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ChevronRight } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Simulator", href: "/simulator" },
    { label: "Roadmap", href: "/roadmap" },
  ];

  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10 relative">
      <Link href="/" className="flex items-center gap-3 focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none rounded">
        <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm">
          <Globe className="w-4 h-4 text-zinc-950" />
        </div>
        <span className="font-bold tracking-wider font-mono text-xs text-zinc-100">SOVEREIGN</span>
      </Link>
      <nav className="flex items-center gap-6" aria-label="Global navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`font-mono text-xs transition-all duration-200 focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none rounded px-2 py-1 relative ${
                isActive ? "text-zinc-100 font-bold" : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[1px] bg-zinc-200 rounded-full animate-fade-in" />
              )}
            </Link>
          );
        })}
        <Link
          href="/chat"
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all duration-200 ease-out font-mono text-xs text-zinc-100 flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus:outline-none"
        >
          Agent Workspace <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </nav>
    </header>
  );
}
