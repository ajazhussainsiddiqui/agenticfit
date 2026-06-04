import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
          <span className="bg-slate-900 px-4">OR CONTINUE WITH</span>
        </div>
      </div>

      <div className="mt-2">
        <button 
          type="button" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="inline-flex w-full justify-center items-center rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-lime-400 transition-colors disabled:opacity-50"
        >
          <svg className="h-4 w-4 mr-3" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
            <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
            <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
            <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
          </svg>
          Google
        </button>
      </div>
    </div>
  );
}
