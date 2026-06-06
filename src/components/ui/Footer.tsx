"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-zinc-800/60 flex flex-col sm:flex-row justify-between items-center z-10 text-xs text-zinc-500 gap-4 relative">
      <div>© 2026 Sentinel Intelligence Layer. Local-first Open Source.</div>
      <div className="flex gap-6">
        <Link href="/chat" className="hover:text-zinc-300 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none rounded px-1">Workspace</Link>
        <a href="https://github.com/PranavSinghRawat/Sentinel-Intelligence" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none rounded px-1">GitHub</a>
      </div>
    </footer>
  );
}
