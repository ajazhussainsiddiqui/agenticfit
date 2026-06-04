import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { ChatMessage } from './ChatMessage';
import { ToolCallPills } from './ToolCallPills';
import { useChatStream } from '../../hooks/useChatStream';

export function ChatMessageList() {
  const messages = useChatStore(state => state.messages);
  const streamingMessage = useChatStore(state => state.streamingMessage);
  const streamingThinking = useChatStore(state => state.streamingThinking);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isStreaming } = useChatStream();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, streamingThinking]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 w-full max-w-4xl mx-auto bg-transparent">
      {messages.length === 0 && !streamingMessage && !streamingThinking && !isStreaming ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4 pb-8">
          <div className="text-center animate-in fade-in zoom-in-95 duration-500">
            <p className="text-[10px] uppercase tracking-widest font-bold">No messages yet</p>
            <p className="text-sm font-mono mt-2 text-slate-400">Command about your name, logs, injury risk, metrics or other.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-6 md:space-y-8">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {(streamingMessage || streamingThinking) && (
            <ChatMessage message={{ 
              id: 'streaming', 
              role: 'ai', 
              content: streamingMessage,
              thinking: streamingThinking || undefined,
              createdAt: Date.now() 
            }} />
          )}

          {isStreaming && !streamingMessage && !streamingThinking && (
            <ToolCallPills />
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      )}
    </div>
  );
}
