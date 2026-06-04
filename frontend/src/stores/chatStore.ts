import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  thinking?: string;
  toolCalls?: string[]; // Optional: store tool call names or details
  createdAt: number;
}

export interface PendingOperation {
  tool_name: string;
  action: string;
  arguments: Record<string, any>;
}

export interface InterruptData {
  pending_operations: PendingOperation[];
  prompt?: string;
  status?: string;
}

interface ChatState {
  threadId: string;
  messages: ChatMessage[];
  streamingMessage: string;
  streamingThinking: string;
  interruptData: InterruptData | null;
  isOpen: boolean;

  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  startNewThread: () => void;
  addMessage: (message: ChatMessage) => void;
  appendToken: (token: string) => void;
  appendThinking: (token: string) => void;
  finalizeAiMessage: () => void;
  setInterrupt: (data: InterruptData | null) => void;
  clearMessages: () => void;
  setThreadId: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  threadId: crypto.randomUUID(),
  messages: [],
  streamingMessage: '',
  streamingThinking: '',
  interruptData: null,
  isOpen: false,

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  
  startNewThread: () => set({ 
    threadId: crypto.randomUUID(), 
    messages: [],
    streamingMessage: '',
    streamingThinking: '',
    interruptData: null
  }),

  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),

  appendToken: (token) => set((state) => ({
    streamingMessage: state.streamingMessage + token
  })),

  appendThinking: (token) => set((state) => ({
    streamingThinking: state.streamingThinking + token
  })),

  finalizeAiMessage: () => set((state) => {
    if (state.streamingMessage.trim() === '' && state.streamingThinking.trim() === '') return state;
    
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      content: state.streamingMessage,
      thinking: state.streamingThinking || undefined,
      createdAt: Date.now()
    };
    
    return {
      messages: [...state.messages, newMsg],
      streamingMessage: '',
      streamingThinking: ''
    };
  }),

  setInterrupt: (data) => set({ interruptData: data }),
  
  clearMessages: () => set({ messages: [], streamingMessage: '', streamingThinking: '', interruptData: null }),
  
  setThreadId: (threadId) => set({ threadId }),
}));
