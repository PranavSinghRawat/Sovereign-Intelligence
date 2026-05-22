/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipeline, env } from "@xenova/transformers";
import * as pdfjs from "pdfjs-dist";

// Set worker source for pdfjs to standard cdnjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';

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
        const pageText = textContent.items.map((item: any) => {
          return item.str + (item.hasEOL ? "\n" : " ");
        }).join("");
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

export function chunkText(text: string, size: number, overlap: number): string[] {
  // Split the text into sentences using a regex that captures punctuation
  const sentenceRegex = /([^.!?]+[.!?]+)(\s+|$)/g;
  const sentences: string[] = [];
  let match;
  
  // Normalize double whitespaces/newlines into spaces
  const normalizedText = text.replace(/\s+/g, " ").trim();
  
  let lastIndex = 0;
  while ((match = sentenceRegex.exec(normalizedText)) !== null) {
    sentences.push(match[1].trim());
    lastIndex = sentenceRegex.lastIndex;
  }
  
  if (lastIndex < normalizedText.length) {
    const remaining = normalizedText.slice(lastIndex).trim();
    if (remaining) {
      sentences.push(remaining);
    }
  }
  
  if (sentences.length === 0) {
    return chunkTextByWords(normalizedText, size, overlap);
  }
  
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;
  
  for (const sentence of sentences) {
    const sentenceLength = sentence.length;
    
    // If a single sentence is longer than chunkSize, split it by words
    if (sentenceLength > size) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
        currentChunk = [];
        currentLength = 0;
      }
      
      const subChunks = chunkTextByWords(sentence, size, overlap);
      chunks.push(...subChunks);
      continue;
    }
    
    if (currentLength + sentenceLength + (currentChunk.length > 0 ? 1 : 0) > size) {
      chunks.push(currentChunk.join(" "));
      
      // Calculate overlap: keep some sentences from the end of current chunk
      const overlapChunks: string[] = [];
      let overlapLen = 0;
      for (let i = currentChunk.length - 1; i >= 0; i--) {
        const s = currentChunk[i];
        if (overlapLen + s.length + (overlapChunks.length > 0 ? 1 : 0) <= overlap) {
          overlapChunks.unshift(s);
          overlapLen += s.length + 1;
        } else {
          break;
        }
      }
      
      currentChunk = [...overlapChunks, sentence];
      currentLength = currentChunk.join(" ").length;
    } else {
      currentChunk.push(sentence);
      currentLength += sentenceLength + (currentChunk.length > 1 ? 1 : 0);
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }
  
  return chunks.filter(c => c.trim().length > 10);
}

function chunkTextByWords(text: string, size: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentWords: string[] = [];
  
  for (const word of words) {
    currentWords.push(word);
    const currentLength = currentWords.join(" ").length;
    if (currentLength >= size) {
      chunks.push(currentWords.join(" "));
      const keepCount = Math.max(1, Math.floor(currentWords.length * (overlap / size)));
      currentWords = currentWords.slice(-keepCount);
    }
  }
  
  if (currentWords.length > 0) {
    chunks.push(currentWords.join(" "));
  }
  
  return chunks;
}
