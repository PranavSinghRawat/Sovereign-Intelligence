/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach, beforeAll } from "vitest";

// Mock the SQLite OPFS database dependency
const mockDbExec = vi.fn();
vi.mock("../lib/store/sqlite-db", () => {
  return {
    db: {
      exec: (...args: any[]) => mockDbExec(...args),
      getDb: vi.fn(() => ({})),
    }
  };
});

// Mock Web Worker class globally before importing RAGManager
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;

  postMessage(message: any) {
    const { type, payload } = message;
    if (type === "init") {
      // Simulate progress status events then completion
      this.onmessage?.({ data: { type: "status", payload: "Loading model..." } } as MessageEvent);
      this.onmessage?.({ data: { type: "init-complete" } } as MessageEvent);
    } else if (type === "extract-and-embed") {
      this.onmessage?.({ data: { type: "status", payload: "Parsing..." } } as MessageEvent);
      this.onmessage?.({ data: { type: "progress", payload: { percent: 50, message: "Embedding..." } } } as MessageEvent);
      this.onmessage?.({
        data: {
          type: "complete",
          payload: {
            name: payload.name,
            chunks: [
              { chunkIndex: 0, textContent: "This is test chunk 1", embedding: [0.8, 0.6, 0.0] },
              { chunkIndex: 1, textContent: "This is test chunk 2", embedding: [0.0, 0.8, 0.6] }
            ]
          }
        }
      } as MessageEvent);
    } else if (type === "embed-query") {
      this.onmessage?.({
        data: {
          type: "embed-query-complete",
          payload: {
            query: payload.query,
            vector: [0.8, 0.6, 0.0] // Norm of this vector is 1.0
          }
        }
      } as MessageEvent);
    }
  }

  terminate() {}
}

vi.stubGlobal("Worker", MockWorker);

import { ragManager } from "../lib/runtime/RAGManager";

describe("RAGManager - On-Device Orchestrator", () => {
  beforeAll(() => {
    // Force worker initialization in test environment where window is undefined
    (ragManager as any).initWorker();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockDbExec.mockReset();
  });

  it("should initialize model and communicate with worker", async () => {
    // Should resolve without error using MockWorker
    await expect(ragManager.initializeModel()).resolves.toBeNull();
  });

  it("should index a PDF file and save chunks and metadata to SQLite", async () => {
    mockDbExec.mockResolvedValue([]);

    const file = new File(["dummy content"], "test-doc.pdf", { type: "application/pdf" });
    const result = await ragManager.indexPDF(file);

    expect(result.name).toBe("test-doc.pdf");
    expect(result.chunk_count).toBe(2);
    expect(result.size).toBe(13); // "dummy content" length

    // Verify DB calls were made to clear existing and insert new documents/chunks
    expect(mockDbExec).toHaveBeenCalledWith("DELETE FROM documents WHERE name = ?;", ["test-doc.pdf"]);
    expect(mockDbExec).toHaveBeenCalledWith(
      "INSERT INTO documents (name, size, chunk_count) VALUES (?, ?, ?);",
      ["test-doc.pdf", 13, 2]
    );
    expect(mockDbExec).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO document_chunks"),
      ["test-doc.pdf", 0, "This is test chunk 1", JSON.stringify([0.8, 0.6, 0.0])]
    );
    expect(mockDbExec).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO document_chunks"),
      ["test-doc.pdf", 1, "This is test chunk 2", JSON.stringify([0.0, 0.8, 0.6])]
    );
  });

  it("should delete a document and cascade delete its chunks from SQLite", async () => {
    mockDbExec.mockResolvedValue([]);
    await ragManager.deleteDocument("test-doc.pdf");
    expect(mockDbExec).toHaveBeenCalledWith("DELETE FROM documents WHERE name = ?;", ["test-doc.pdf"]);
  });

  it("should fetch all documents from SQLite", async () => {
    // Return array of arrays representation of rows
    const mockRows = [
      ["test-doc.pdf", 1024, 5, "2026-05-21 12:00:00"]
    ];
    mockDbExec.mockResolvedValue(mockRows);

    const docs = await ragManager.getDocuments();

    expect(docs).toHaveLength(1);
    expect(docs[0]).toEqual({
      name: "test-doc.pdf",
      size: 1024,
      chunk_count: 5,
      created_at: "2026-05-21 12:00:00"
    });
    expect(mockDbExec).toHaveBeenCalledWith(expect.stringContaining("SELECT name, size, chunk_count, created_at FROM documents"));
  });

  it("should compute cosine similarity and perform hybrid lexical search", async () => {
    // Mock the retrieval of all document chunks
    const mockChunks = [
      ["doc-a.pdf", 0, "This is test chunk 1 containing specific term.", JSON.stringify([0.8, 0.6, 0.0])],
      ["doc-a.pdf", 1, "This is test chunk 2 containing other words.", JSON.stringify([0.0, 0.8, 0.6])]
    ];
    mockDbExec.mockResolvedValue(mockChunks);

    // Query is embedded by worker returning [0.8, 0.6, 0.0]
    // Chunk 0 embedding is [0.8, 0.6, 0.0], dot product = 0.8*0.8 + 0.6*0.6 = 1.0 (exact match)
    // Chunk 1 embedding is [0.0, 0.8, 0.6], dot product = 0.0*0.8 + 0.8*0.6 + 0.6*0.0 = 0.48
    // Let's search with lexical match boost for word "specific" (should boost Chunk 0 score)
    const results = await ragManager.semanticSearch("specific term", 2, 0.3);

    expect(results).toHaveLength(2);
    // Chunk 0 has score 1.0 (semantic) + 2 * 0.04 (lexical matches: 'specific', 'term') = 1.08
    expect(results[0].documentName).toBe("doc-a.pdf");
    expect(results[0].chunkIndex).toBe(0);
    expect(results[0].score).toBeCloseTo(1.08, 2);

    // Chunk 1 has score 0.48 (semantic) + 0.0 (no matching lexical words) = 0.48
    expect(results[1].documentName).toBe("doc-a.pdf");
    expect(results[1].chunkIndex).toBe(1);
    expect(results[1].score).toBeCloseTo(0.48, 2);
  });
});
