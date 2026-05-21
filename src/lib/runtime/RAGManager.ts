/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "../store/sqlite-db";

export interface DocumentInfo {
  name: string;
  size: number;
  chunk_count: number;
  created_at?: string;
}

export interface SearchResult {
  documentName: string;
  chunkIndex: number;
  textContent: string;
  score: number;
}

export class RAGManager {
  private static instance: RAGManager;
  private worker: Worker | null = null;
  private initPromise: Promise<void> | null = null;
  private pendingResolves = new Map<string, (val: any) => void>();
  private statusListeners: ((status: string) => void)[] = [];
  private progressListeners: ((percent: number, msg: string) => void)[] = [];

  private constructor() {
    if (typeof window !== "undefined") {
      this.initWorker();
    }
  }

  static getInstance(): RAGManager {
    if (!RAGManager.instance) {
      RAGManager.instance = new RAGManager();
    }
    return RAGManager.instance;
  }

  private initWorker() {
    try {
      this.worker = new Worker(new URL("./rag.worker.ts", import.meta.url));
      this.worker.onmessage = (e) => {
        const { type, payload } = e.data;
        
        if (type === "status") {
          this.statusListeners.forEach(listener => listener(payload));
        } else if (type === "progress") {
          const { percent, message } = payload;
          this.progressListeners.forEach(listener => listener(percent, message));
        } else if (type === "init-complete") {
          const resolve = this.pendingResolves.get("init");
          if (resolve) resolve(null);
        } else if (type === "complete") {
          const resolve = this.pendingResolves.get("indexing");
          if (resolve) resolve(payload);
        } else if (type === "embed-query-complete") {
          const resolve = this.pendingResolves.get(`query-${payload.query}`);
          if (resolve) resolve(payload.vector);
        } else if (type === "error") {
          console.error("[RAG Worker Error]:", payload);
          // Alert and reject pending promises
          this.pendingResolves.forEach((resolve) => resolve({ error: payload }));
          this.pendingResolves.clear();
        }
      };
    } catch (err) {
      console.error("[RAGManager] Failed to instantiate worker:", err);
    }
  }

  addStatusListener(listener: (status: string) => void) {
    this.statusListeners.push(listener);
  }

  removeStatusListener(listener: (status: string) => void) {
    this.statusListeners = this.statusListeners.filter(l => l !== listener);
  }

  addProgressListener(listener: (percent: number, msg: string) => void) {
    this.progressListeners.push(listener);
  }

  removeProgressListener(listener: (percent: number, msg: string) => void) {
    this.progressListeners = this.progressListeners.filter(l => l !== listener);
  }

  async initializeModel(): Promise<void> {
    if (!this.worker) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      this.pendingResolves.set("init", resolve);
      this.worker?.postMessage({ type: "init" });
    });

    return this.initPromise;
  }

  async indexPDF(file: File): Promise<DocumentInfo> {
    await this.initializeModel();
    if (!this.worker) {
      throw new Error("RAG Ingestion Engine not available (Worker not initialized)");
    }
    const arrayBuffer = await file.arrayBuffer();

    const result = await new Promise<{ name: string; chunks: any[] }>((resolve, reject) => {
      this.pendingResolves.set("indexing", (val) => {
        if (val && val.error) reject(new Error(val.error));
        else resolve(val);
      });
      this.worker?.postMessage({
        type: "extract-and-embed",
        payload: {
          arrayBuffer,
          name: file.name
        }
      });
    });

    // Save metadata and chunks into SQLite
    await this.saveDocumentToDb(result.name, file.size, result.chunks);

    return {
      name: result.name,
      size: file.size,
      chunk_count: result.chunks.length
    };
  }

  private async saveDocumentToDb(name: string, size: number, chunks: any[]): Promise<void> {
    try {
      await db.exec("DELETE FROM documents WHERE name = ?;", [name]);
    } catch {
      // ignore
    }

    await db.exec(
      "INSERT INTO documents (name, size, chunk_count) VALUES (?, ?, ?);",
      [name, size, chunks.length]
    );

    for (const chunk of chunks) {
      await db.exec(
        `INSERT INTO document_chunks (document_name, chunk_index, text_content, embedding_json)
         VALUES (?, ?, ?, ?);`,
        [name, chunk.chunkIndex, chunk.textContent, JSON.stringify(chunk.embedding)]
      );
    }
  }

  async deleteDocument(name: string): Promise<void> {
    await db.exec("DELETE FROM documents WHERE name = ?;", [name]);
  }

  async getDocuments(): Promise<DocumentInfo[]> {
    try {
      const rows = await db.exec("SELECT name, size, chunk_count, created_at FROM documents ORDER BY created_at DESC;");
      const results = rows as unknown as unknown[][];
      if (!Array.isArray(results)) return [];
      
      return results.map((v: any) => ({
        name: v[0],
        size: v[1],
        chunk_count: v[2],
        created_at: v[3]
      }));
    } catch (err) {
      console.error("[RAGManager] Error loading documents:", err);
      return [];
    }
  }

  private dotProduct(a: number[], b: number[]): number {
    let dot = 0;
    const len = a.length;
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
    }
    return dot;
  }

  async getQueryEmbedding(query: string): Promise<number[]> {
    await this.initializeModel();
    if (!this.worker) {
      throw new Error("RAG Worker not available");
    }
    return new Promise<number[]>((resolve, reject) => {
      const key = `query-${query}`;
      this.pendingResolves.set(key, (val) => {
        if (val && val.error) reject(new Error(val.error));
        else resolve(val);
      });
      this.worker?.postMessage({
        type: "embed-query",
        payload: { query }
      });
    });
  }

  async semanticSearch(query: string, topK = 3, threshold = 0.35): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    try {
      // 1. Generate query embedding
      const queryVector = await this.getQueryEmbedding(query);

      // 2. Load all chunks from SQLite
      const rows = await db.exec("SELECT document_name, chunk_index, text_content, embedding_json FROM document_chunks;");
      const results = rows as unknown as unknown[][];
      if (!Array.isArray(results) || results.length === 0) return [];

      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const searchResults: SearchResult[] = [];

      for (const row of results) {
        if (!Array.isArray(row) || row.length < 4) continue;
        const docName = row[0] as string;
        const chunkIndex = row[1] as number;
        const textContent = row[2] as string;
        const embedding = JSON.parse(row[3] as string) as number[];

        // Cosine similarity (since embeddings are normalised to unit length, simple dot product computes cosine similarity)
        let score = this.dotProduct(queryVector, embedding);

        // Hybrid Lexical Match Boost
        if (queryWords.length > 0) {
          const chunkTextLower = textContent.toLowerCase();
          let wordMatches = 0;
          for (const word of queryWords) {
            if (chunkTextLower.includes(word)) {
              wordMatches++;
            }
          }
          const boost = Math.min(3, wordMatches) * 0.04;
          score += boost;
        }

        if (score >= threshold) {
          searchResults.push({
            documentName: docName,
            chunkIndex,
            textContent,
            score
          });
        }
      }

      // 3. Sort by score descending and return topK
      return searchResults.sort((a, b) => b.score - a.score).slice(0, topK);
    } catch (err) {
      console.error("[RAGManager] Search failed:", err);
      return [];
    }
  }
}

export const ragManager = RAGManager.getInstance();
