import { create } from 'zustand';
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { SystemMetrics } from "@/lib/metrics/MetricsCapture";
import { CAMPResult } from "@/lib/middleware/CAMP";
import { SearchResult } from "@/lib/runtime/RAGManager";

export type ExtendedChatMessage = ChatCompletionMessageParam & {
  ragSources?: SearchResult[];
  campResult?: CAMPResult;
  inferenceSpeed?: number;
  isSimulated?: boolean;
};

interface AgentState {
  messages: ExtendedChatMessage[];
  isInitializing: boolean;
  isThinking: boolean;
  initProgress: string;
  lastCamp: CAMPResult | null;
  toolExecuting: string | null;
  thinkingStep: string | null;
  metrics: SystemMetrics | null;
  isSimulationMode: boolean;
  
  // Actions
  setMessages: (messages: ExtendedChatMessage[] | ((prev: ExtendedChatMessage[]) => ExtendedChatMessage[])) => void;
  addMessage: (message: ExtendedChatMessage) => void;
  setIsInitializing: (isInit: boolean) => void;
  setIsThinking: (isThinking: boolean) => void;
  setInitProgress: (progress: string) => void;
  setLastCamp: (camp: CAMPResult | null) => void;
  setToolExecuting: (tool: string | null) => void;
  setThinkingStep: (step: string | null) => void;
  setMetrics: (metrics: SystemMetrics) => void;
  setIsSimulationMode: (isSim: boolean) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  messages: [],
  isInitializing: true,
  isThinking: false,
  initProgress: "Waking up local engine...",
  lastCamp: null,
  toolExecuting: null,
  thinkingStep: null,
  metrics: null,
  isSimulationMode: false,

  setMessages: (updater) => set((state) => ({
    messages: typeof updater === 'function' ? updater(state.messages) : updater
  })),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setIsInitializing: (isInitializing) => set({ isInitializing }),
  setIsThinking: (isThinking) => set({ isThinking }),
  setInitProgress: (initProgress) => set({ initProgress }),
  setLastCamp: (lastCamp) => set({ lastCamp }),
  setToolExecuting: (toolExecuting) => set({ toolExecuting }),
  setThinkingStep: (thinkingStep) => set({ thinkingStep }),
  setMetrics: (metrics) => set({ metrics }),
  setIsSimulationMode: (isSimulationMode) => set({ isSimulationMode }),
}));
