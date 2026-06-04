import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useChatStream } from '../../hooks/useChatStream';

export function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const addMessage = useChatStore(state => state.addMessage);
  const threadId = useChatStore(state => state.threadId);
  const interruptData = useChatStore(state => state.interruptData);
  const { sendMessage, isStreaming, abort } = useChatStream();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    // Focus input when not streaming or interrupted, but only on desktop to prevent mobile keyboard from popping up
    if (!isStreaming && !interruptData && window.innerWidth > 768) {
      textareaRef.current?.focus();
    }
  }, [isStreaming, interruptData]);

  const handleSend = () => {
    if (!input.trim() || isStreaming || interruptData) return;

    const userMessage = input.trim();
    setInput('');
    textareaRef.current?.blur();
    
    // Add to local state
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      createdAt: Date.now()
    });

    // Send to stream
    sendMessage({
      thread_id: threadId,
      message: userMessage
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 p-4 border-t border-slate-800/50 bg-transparent">
      <div className="relative flex items-end gap-2 rounded-[24px] bg-slate-900/20 backdrop-blur-md border border-slate-700/50 focus-within:ring-1 focus-within:ring-lime-400 transition-all shadow-lg mx-auto w-full md:max-w-4xl">
        <textarea
          ref={textareaRef}
          value={input || ''}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming || !!interruptData}
          placeholder={interruptData ? "Waiting..." : isStreaming ? "AI is typing..." : "Message AI assistant..."}
          className="max-h-[120px] min-h-[56px] w-full resize-none bg-transparent py-4 pl-4 sm:pl-6 pr-14 text-xs sm:text-sm text-slate-50 placeholder:text-slate-600 focus:outline-none disabled:opacity-50 font-mono tracking-tight"
          rows={1}
        />
        
        <div className="absolute bottom-2 right-2 flex items-center">
          {isStreaming ? (
            <button
              onClick={abort}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-slate-50 transition-colors"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || !!interruptData}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lime-400 hover:text-lime-300 transition-colors disabled:opacity-50 disabled:text-slate-600"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
