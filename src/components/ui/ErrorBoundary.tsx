"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Global Error Boundary - Prevents full white-screen crashes.
 * 
 * Catches unhandled React rendering errors from WebGPU initialization failures,
 * SQLite WASM exceptions, and malformed API responses. Displays a graceful
 * recovery UI instead of a blank screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught unhandled React error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-center">
          <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 max-w-lg space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-red-400">Runtime Error Detected</h1>
            <p className="text-sm text-white/60 font-mono break-words">
              {this.state.errorMessage || "An unexpected error occurred in the local engine."}
            </p>
            <p className="text-xs text-white/40">
              This may be caused by WebGPU incompatibility, insufficient device memory, or a browser restriction.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: "" });
                window.location.reload();
              }}
              className="px-6 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-mono text-sm transition-colors"
            >
              Reload Application
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
