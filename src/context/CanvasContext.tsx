"use client";

import React, { createContext, useContext, useState } from "react";

export type ShapeType = "globe" | "cpu" | "shield" | "p2p";

interface CanvasContextProps {
  activeShape: ShapeType;
  setActiveShape: (shape: ShapeType) => void;
}

const CanvasContext = createContext<CanvasContextProps | undefined>(undefined);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [activeShape, setActiveShape] = useState<ShapeType>("globe");

  return (
    <CanvasContext.Provider value={{ activeShape, setActiveShape }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}
