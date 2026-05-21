"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ensure scroll is reset to top on navigation before transitions start
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // We want chat route to transition instantly or have a softer entry
  const isChat = pathname === "/chat";

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: isChat ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 min-h-screen"
    >
      {children}
    </motion.div>
  );
}
