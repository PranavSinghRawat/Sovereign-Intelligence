import React, { useState, useEffect, useCallback } from "react";
import { UploadCloud, FileText, Trash2, Loader2, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ragManager, DocumentInfo } from "@/lib/runtime/RAGManager";
import { cn } from "@/lib/utils";

export const RAGSidebarTab: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [indexingState, setIndexingState] = useState<{
    status: "idle" | "loading" | "indexing" | "complete" | "error";
    message: string;
    percent: number;
  }>({
    status: "idle",
    message: "",
    percent: 0,
  });

  const loadDocuments = useCallback(async () => {
    const docs = await ragManager.getDocuments();
    setDocuments(docs);
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      const docs = await ragManager.getDocuments();
      if (active) setDocuments(docs);
    };
    init();

    const onStatus = (status: string) => {
      setIndexingState(prev => ({
        ...prev,
        status: status.includes("Generating embeddings") || status.includes("Extracting") ? "indexing" : "loading",
        message: status
      }));
    };

    const onProgress = (percent: number, msg: string) => {
      setIndexingState(prev => ({
        ...prev,
        status: "indexing",
        percent,
        message: msg
      }));
    };

    ragManager.addStatusListener(onStatus);
    ragManager.addProgressListener(onProgress);

    return () => {
      active = false;
      ragManager.removeStatusListener(onStatus);
      ragManager.removeProgressListener(onProgress);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    
    if (!pdfFile) {
      setIndexingState({
        status: "error",
        message: "Only PDF documents are supported for local semantic index.",
        percent: 0
      });
      return;
    }

    try {
      setIndexingState({
        status: "loading",
        message: "Initializing PDF ingestion engine...",
        percent: 0
      });
      await ragManager.indexPDF(pdfFile);
      setIndexingState({
        status: "complete",
        message: `Successfully indexed "${pdfFile.name}"!`,
        percent: 100
      });
      setTimeout(() => {
        setIndexingState(prev => prev.status === "complete" ? { status: "idle", message: "", percent: 0 } : prev);
      }, 3000);
      loadDocuments();
    } catch (err) {
      const error = err as Error;
      setIndexingState({
        status: "error",
        message: error?.message || "Failed to parse PDF.",
        percent: 0
      });
    }
  };

  const handleDelete = async (name: string) => {
    await ragManager.deleteDocument(name);
    loadDocuments();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-4 text-[10px] font-mono">
      {/* Upload Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border border-dashed rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 cursor-pointer select-none",
          isDragging ? "border-zinc-300 bg-zinc-900/40 scale-[1.02]" : "border-zinc-800 bg-zinc-950/20 hover:border-zinc-700/80 hover:bg-zinc-950/40",
          indexingState.status === "loading" || indexingState.status === "indexing" ? "pointer-events-none opacity-60 border-zinc-800" : ""
        )}
      >
        <input 
          type="file" 
          accept=".pdf"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                setIndexingState({
                  status: "loading",
                  message: "Initializing PDF ingestion engine...",
                  percent: 0
                });
                await ragManager.indexPDF(file);
                setIndexingState({
                  status: "complete",
                  message: `Successfully indexed "${file.name}"!`,
                  percent: 100
                });
                setTimeout(() => {
                  setIndexingState(prev => prev.status === "complete" ? { status: "idle", message: "", percent: 0 } : prev);
                }, 3000);
                loadDocuments();
              } catch (err) {
                const error = err as Error;
                setIndexingState({
                  status: "error",
                  message: error?.message || "Failed to parse PDF.",
                  percent: 0
                });
              }
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        
        <AnimatePresence mode="wait">
          {indexingState.status === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center gap-2"
            >
              <UploadCloud className="w-6 h-6 text-zinc-500 animate-pulse" />
              <span className="text-zinc-400 font-semibold uppercase tracking-wider">Drag & Drop PDF</span>
              <span className="text-zinc-650 text-[9px]">Ingested entirely locally on your device</span>
            </motion.div>
          )}

          {(indexingState.status === "loading" || indexingState.status === "indexing") && (
            <motion.div 
              key="indexing"
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              className="w-full flex flex-col items-center gap-2"
            >
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
              <span className="text-zinc-355 font-semibold animate-pulse uppercase tracking-wider">Indexing Document...</span>
              <span className="text-zinc-500 text-[9px] truncate max-w-full px-4">{indexingState.message}</span>
              
              {indexingState.status === "indexing" && (
                <div className="w-4/5 bg-zinc-900 h-1 rounded-full overflow-hidden mt-1 relative">
                  <motion.div 
                    className="h-full bg-zinc-150 rounded-full" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${indexingState.percent}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {indexingState.status === "complete" && (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-emerald-450 font-bold uppercase tracking-wider">Index Completed</span>
              <span className="text-zinc-550 text-[9px] px-4 truncate max-w-full">{indexingState.message}</span>
            </motion.div>
          )}

          {indexingState.status === "error" && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center gap-2"
            >
              <AlertCircle className="w-6 h-6 text-red-500" />
              <span className="text-red-400 font-semibold uppercase tracking-wider">Ingestion Error</span>
              <span className="text-zinc-500 text-[8px] max-h-12 overflow-y-auto px-4">{indexingState.message}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIndexingState({ status: "idle", message: "", percent: 0 });
                }}
                className="mt-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Reset
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Document Inventory */}
      <div className="flex flex-col gap-2 mt-2">
        <span className="text-zinc-500 uppercase tracking-wider font-bold">Local Knowledge Base ({documents.length})</span>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
          <AnimatePresence initial={false}>
            {documents.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-zinc-650 py-6 border border-zinc-950 rounded-xl bg-zinc-950/5"
              >
                No documents indexed. Drop a PDF to begin.
              </motion.div>
            ) : (
              documents.map((doc) => (
                <motion.div 
                  key={doc.name}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-900/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] hover:border-zinc-800/40 group transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0 shadow-sm">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-zinc-300 truncate pr-2" title={doc.name}>
                        {doc.name}
                      </span>
                      <span className="text-[8px] text-zinc-550 mt-0.5">
                        {formatBytes(doc.size)} • {doc.chunk_count} chunks
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(doc.name)}
                    className="p-1.5 rounded-lg border border-transparent hover:border-red-900/40 hover:bg-red-950/20 text-zinc-600 hover:text-red-400 cursor-pointer transition-all duration-200"
                    title="Delete document index"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
