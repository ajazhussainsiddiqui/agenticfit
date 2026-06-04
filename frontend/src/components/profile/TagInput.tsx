import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags = [], onChange, placeholder = "Type and press enter..." }: Props) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-colors">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span 
            key={tag} 
            className="flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 text-xs font-mono font-medium text-orange-400"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-orange-400/70 hover:text-orange-400 focus:outline-none ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue || ''}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-slate-100 text-sm placeholder-slate-700 py-1.5"
        />
      </div>
    </div>
  );
}
