
export function ToolCallPills() {
  return (
    <div className="flex w-full justify-start mb-4">
      <div className="flex gap-2">
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 shadow-sm">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]"></span>
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]"></span>
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-medium text-zinc-400 capitalize">
            Accessing database...
          </span>
        </div>
      </div>
    </div>
  );
}
