"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ChevronRight, Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Close mobile menu on any navigation (pathname drives this, menu closes via onClick on links)

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

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6" aria-label="Global navigation">
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
                <span className="absolute bottom-0 left-2 right-2 h-[1px] bg-zinc-200 rounded-full" />
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

      {/* Mobile hamburger trigger */}
      <button
        className="md:hidden p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 mx-6 mt-2 p-4 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-2xl z-50 md:hidden flex flex-col gap-2 animate-fade-in">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`font-mono text-sm px-4 py-3 rounded-xl transition-all duration-200 block ${
                  isActive
                    ? "text-zinc-100 font-bold bg-zinc-800/50"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-zinc-800 mt-2 pt-2">
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition-all duration-200 font-mono text-sm text-zinc-100 flex items-center justify-between cursor-pointer"
            >
              Agent Workspace <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
