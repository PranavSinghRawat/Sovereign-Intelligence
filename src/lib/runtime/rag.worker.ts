/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipeline, env } from "@xenova/transformers";
import * as pdfjs from "pdfjs-dist";

// Set worker source for pdfjs to standard cdnjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

env.allowLocalModels = false;

let extractor: any = null;

async function getExtractor(progressCallback: (status: string) => void) {
  if (extractor) return extractor;
  
  progressCallback("Loading embedding model (Xenova/all-MiniLM-L6-v2)...");
  extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  progressCallback("Embedding model loaded.");
  return extractor;
}

// Handle messages from the parent thread
self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === "init") {
    try {
      await getExtractor((status) => {
        self.postMessage({ type: "status", payload: status });
      });
      self.postMessage({ type: "init-complete" });
    } catch (err: any) {
      self.postMessage({ type: "error", payload: `Model initialization failed: ${err.message}` });
    }
  }

  if (type === "extract-and-embed") {
    const { arrayBuffer, name } = payload;
    try {
      const ext = await getExtractor((status) => {
        self.postMessage({ type: "status", payload: status });
      });

      self.postMessage({ type: "status", payload: "Parsing PDF document..." });
      
      // Load the PDF ArrayBuffer
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      
      let fullText = "";
      
      for (let i = 1; i <= numPages; i++) {
        self.postMessage({ 
          type: "status", 
          payload: `Extracting text page ${i}/${numPages}...` 
        });
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      self.postMessage({ type: "status", payload: "Chunking document text..." });
      const chunks = chunkText(fullText, 500, 100);

      if (chunks.length === 0) {
        throw new Error("No text content could be extracted from PDF.");
      }

      const totalChunks = chunks.length;
      const embeddedChunks = [];

      for (let idx = 0; idx < totalChunks; idx++) {
        self.postMessage({ 
          type: "progress", 
          payload: {
            percent: Math.round(((idx + 1) / totalChunks) * 100),
            message: `Generating embeddings: Chunk ${idx + 1}/${totalChunks}...`
          }
        });

        const chunkTextContent = chunks[idx];
        
        // Generate raw embedding
        const output = await ext(chunkTextContent, { pooling: "mean", normalize: true });
        const vector = Array.from(output.data) as number[];

        embeddedChunks.push({
          chunkIndex: idx,
          textContent: chunkTextContent,
          embedding: vector
        });
      }

      self.postMessage({
        type: "complete",
        payload: {
          name,
          chunks: embeddedChunks
        }
      });

    } catch (err: any) {
      self.postMessage({ type: "error", payload: `PDF indexing failed: ${err.message}` });
    }
  }

  if (type === "embed-query") {
    const { query } = payload;
    try {
      const ext = await getExtractor((status) => {
        self.postMessage({ type: "status", payload: status });
      });

      // Generate embedding for query
      const output = await ext(query, { pooling: "mean", normalize: true });
      const vector = Array.from(output.data) as number[];

      self.postMessage({
        type: "embed-query-complete",
        payload: {
          query,
          vector
        }
      });
    } catch (err: any) {
      self.postMessage({ type: "error", payload: `Query embedding failed: ${err.message}` });
    }
  }
};

function chunkText(text: string, size: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentWords: string[] = [];
  
  for (const word of words) {
    currentWords.push(word);
    const currentLength = currentWords.join(" ").length;
    if (currentLength >= size) {
      chunks.push(currentWords.join(" "));
      // Overlap by sliding back
      const keepCount = Math.max(1, Math.floor(currentWords.length * (overlap / size)));
      currentWords = currentWords.slice(-keepCount);
    }
  }
  
  if (currentWords.length > 0) {
    chunks.push(currentWords.join(" "));
  }
  
  return chunks.filter(c => c.trim().length > 10);
}
