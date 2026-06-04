import React from 'react';
import { X } from 'lucide-react';

interface Props {
  file: File;
  onRemove: () => void;
}

export function ImagePreview({ file, onRemove }: Props) {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!preview) return null;

  return (
    <div className="relative inline-block mt-2 self-start animate-in fade-in zoom-in-95 duration-300">
      <img 
        src={preview} 
        alt="Meal preview" 
        className="max-h-[300px] rounded-[24px] border border-slate-800 object-cover shadow-2xl bg-slate-950"
      />
      <button
        onClick={onRemove}
        className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-rose-500 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500 border border-slate-700 shadow-xl"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
