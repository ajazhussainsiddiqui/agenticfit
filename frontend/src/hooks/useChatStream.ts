import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { API_V1_URL } from '../lib/api';

export interface ChatRequest {
  thread_id: string;
  message?: string;
  resume_decision?: "yes" | "no";
}

export interface ChatStreamEvent {
  type: "token" | "thinking" | "interrupt" | "error";
  content: any;
}

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  
  const appendToken = useChatStore(state => state.appendToken);
  const appendThinking = useChatStore(state => state.appendThinking);
  const finalizeAiMessage = useChatStore(state => state.finalizeAiMessage);
  const setInterrupt = useChatStore(state => state.setInterrupt);
  const session = useAuthStore(state => state.session);
  const token = session?.access_token;

  const sendMessage = async (req: ChatRequest) => {
    // Abort previous stream if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsStreaming(true);
    setInterrupt(null); // Clear previous interrupt

    try {
      const response = await fetch(
        `${API_V1_URL}/chat/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(req),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) {
        throw new Error("Failed to get stream reader");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim().startsWith("data:")) {
            const dataStr = line.slice(line.indexOf("data:") + 5).trim();
            
            if (dataStr === "[DONE]") {
              finalizeAiMessage();
              setIsStreaming(false);
              queryClient.invalidateQueries({ queryKey: ['left-tokens'] });
              return;
            }
            
            try {
              const event: ChatStreamEvent = JSON.parse(dataStr);
              
              if (event.type === "token") {
                appendToken(event.content);
              } else if (event.type === "thinking") {
                appendThinking(event.content);
              } else if (event.type === "interrupt") {
                setInterrupt({ 
                  pending_operations: event.content.pending_operations || [], 
                  prompt: event.content.prompt || event.content.Prompt,
                  status: event.content.status
                });
                // We don't finalize the message here yet; it's waiting for user input
                setIsStreaming(false); 
                queryClient.invalidateQueries({ queryKey: ['left-tokens'] });
              } else if (event.type === "error") {
                toast.error(typeof event.content === 'string' ? event.content : JSON.stringify(event.content));
                setIsStreaming(false);
              }
            } catch (e) {
              console.error("Parse error for event data:", dataStr, e);
            }
          }
        }
      }
      
      // If we exit the loop without [DONE] (e.g. standard ending)
      finalizeAiMessage();
      queryClient.invalidateQueries({ queryKey: ['left-tokens'] });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Stream error:", err);
        const errorMessage = typeof err === 'string' ? err : (err.message || 'Error communicating with AI');
        toast.error(errorMessage);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const abort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return { sendMessage, isStreaming, abort };
}
