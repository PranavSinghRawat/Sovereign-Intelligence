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
        <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-950 text-center">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 max-w-lg space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <span className="text-sm">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Runtime Error Detected</h1>
            <p className="text-sm text-zinc-400 font-mono break-words leading-relaxed">
              {this.state.errorMessage || "An unexpected error occurred in the local engine."}
            </p>
            <p className="text-xs text-zinc-500 max-w-prose leading-relaxed">
              This may be caused by WebGPU incompatibility, insufficient device memory, or a browser restriction.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: "" });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus:outline-none"
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
