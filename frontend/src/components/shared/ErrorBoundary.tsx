import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-rose-900/50 bg-slate-900 p-12 text-center m-4 shadow-xl">
          <AlertTriangle className="h-10 w-10 text-rose-500 mb-6" />
          <h2 className="text-xl font-bold uppercase tracking-tight text-slate-50 mb-3">Something went wrong</h2>
          <p className="text-[10px] font-mono tracking-wider text-slate-400 max-w-sm mb-8">
            {this.state.error?.message || 'AN UNEXPECTED ERROR OCCURRED.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-full bg-slate-800 px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-50 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
