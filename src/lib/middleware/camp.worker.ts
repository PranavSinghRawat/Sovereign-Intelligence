import { camp } from "./CAMP";

self.onmessage = async (event: MessageEvent) => {
  const { id, context } = event.data;
  try {
    const result = await camp.process(context);
    self.postMessage({ id, result, success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown worker error";
    self.postMessage({ id, error: errorMsg, success: false });
  }
};
