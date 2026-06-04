import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  content: string;
  className?: string;
}

export function HelpTooltip({ content, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={wrapperRef}
      className={cn("relative inline-flex items-center cursor-pointer touch-manipulation md:cursor-help", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      <HelpCircle className={cn(
        "h-3.5 w-3.5 transition-colors",
        isOpen ? "text-slate-300" : "text-slate-500 hover:text-slate-300"
      )} />
      <div 
        className={cn(
          "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2.5 bg-slate-800 text-slate-200 text-xs rounded-lg transition-all duration-200 z-50 pointer-events-none text-center shadow-xl border border-slate-700 normal-case font-sans tracking-normal leading-relaxed",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        {content}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
      </div>
    </div>
  );
}
