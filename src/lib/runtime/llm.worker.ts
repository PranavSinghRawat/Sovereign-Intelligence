import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// A handler that resides in the worker thread to manage the engine
const handler = new WebWorkerMLCEngineHandler();

// Listen for messages from the main thread
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
