import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  onFileSelect: (file: File) => void;
  error?: string | null;
  setError: (err: string | null) => void;
}

export function UploadZone({ onFileSelect, error, setError }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }
    onFileSelect(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center w-full h-80 rounded-[32px] border-2 border-dashed cursor-pointer transition-all",
          isDragging ? "border-lime-400 bg-lime-400/5" : "border-slate-800 bg-slate-900 hover:border-lime-400 hover:bg-slate-800/80"
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-lime-400 border border-slate-700/50 shadow-[0_0_20px_rgba(190,242,100,0.1)]">
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Drag & drop a meal photo</p>
          <p className="text-xs font-mono text-slate-600">or click to browse</p>
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={onFileInput} />
      </label>
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
