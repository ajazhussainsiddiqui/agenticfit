import React, { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useChatStream } from '../../hooks/useChatStream';
import { AlertTriangle, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';

function OperationCard({ op }: { op: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden mt-2">
      <div 
        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
          <span className="font-mono text-xs font-bold text-slate-200">{op.tool_name}</span>
          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            {op.action}
          </span>
        </div>
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
      </div>
      {expanded && (
        <div className="border-t border-slate-700/50 bg-slate-900/50 p-2.5">
          <pre className="text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap font-mono">
            {JSON.stringify(op.arguments, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function HITLBanner() {
  const interruptData = useChatStore(state => state.interruptData);
  const threadId = useChatStore(state => state.threadId);
  const { sendMessage, isStreaming } = useChatStream();

  if (!interruptData) return null;

  const handleDecision = (decision: 'yes' | 'no') => {
    sendMessage({
      thread_id: threadId,
      resume_decision: decision
    });
  };

  return (
    <div className="shrink-0 border-t border-slate-800 bg-slate-950/80 p-4 animate-in slide-in-from-bottom-2">
      <div className="flex items-start gap-3">
        <div className="rounded-xl flex h-8 w-8 shrink-0 items-center justify-center bg-amber-500/20 text-amber-500 mt-1">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-200 tracking-tight">
            {interruptData.prompt || "The AI wants to perform the following actions:"}
          </h4>
          
          <div className="mt-3 space-y-2">
            {interruptData.pending_operations?.map((op, idx) => (
              <OperationCard key={idx} op={op} />
            ))}
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleDecision('yes')}
              disabled={isStreaming}
              className="flex-1 rounded-xl bg-lime-400 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-950 transition-colors hover:bg-lime-500 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => handleDecision('no')}
              disabled={isStreaming}
              className="flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
            >
              Deny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
