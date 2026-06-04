import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6 text-center">
      <AlertTriangle className="w-16 h-16 text-lime-400 mb-6" />
      <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-50 mb-4">404 - Page Not Found</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-lime-400 text-slate-950 font-bold uppercase tracking-widest text-sm rounded hover:bg-lime-500 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
