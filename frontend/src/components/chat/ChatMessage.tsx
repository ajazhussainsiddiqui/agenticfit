import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChatMessage as ChatMessageType } from '../../stores/chatStore';

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  const [showThinking, setShowThinking] = useState(false);

  return (
    <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "flex max-w-[85%] sm:max-w-[75%] gap-4",
        isUser 
          ? "bg-slate-800 text-slate-100 rounded-[24px] rounded-br-[4px] px-6 py-4" 
          : "bg-slate-900 border border-slate-800 text-slate-300 rounded-[24px] rounded-bl-[4px] px-6 py-4 flex-col sm:flex-row"
      )}>
        {!isUser && (
          <div className="flex-shrink-0 mt-0.5 hidden sm:block">
            <Sparkles className="h-5 w-5 text-lime-400" />
          </div>
        )}
        
        <div className="overflow-hidden w-full flex flex-col gap-3">
          {!isUser && message.thinking && (
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors self-start pb-1"
              >
                <Brain className="h-3.5 w-3.5" />
                {showThinking ? 'Hide Reasoning' : 'Show Reasoning'}
                {showThinking ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
              
              {showThinking && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 animate-in slide-in-from-top-2">
                  <p className="whitespace-pre-wrap font-mono text-xs text-slate-500 leading-relaxed max-h-[300px] overflow-y-auto w-full">
                    {message.thinking}
                  </p>
                </div>
              )}
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : (
            message.content ? (
              <div className="prose prose-invert prose-sm max-w-none text-sm break-words 
                prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-a:text-lime-400 prose-strong:text-slate-100">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
