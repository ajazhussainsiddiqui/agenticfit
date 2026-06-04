import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Min 6 characters'),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const { error, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      
      // Auto-create user profile will happen when fetching user data.

      toast.success('Account created!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="mb-1 block text-[10px] uppercase font-bold tracking-widest text-slate-400">Email</label>
        <input 
          {...register('email')}
          type="email" 
          placeholder="you@example.com"
          className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-slate-50 placeholder-slate-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 font-mono text-sm" 
        />
        {errors.email && <p className="mt-1 text-[10px] uppercase font-bold text-rose-500">{errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-[10px] uppercase font-bold tracking-widest text-slate-400">Password</label>
        <input 
          {...register('password')}
          type="password" 
          placeholder="••••••••"
          className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-slate-50 placeholder-slate-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 font-mono text-sm" 
        />
        {errors.password && <p className="mt-1 text-[10px] uppercase font-bold text-rose-500">{errors.password.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-[10px] uppercase font-bold tracking-widest text-slate-400">Confirm Password</label>
        <input 
          {...register('confirm')}
          type="password" 
          placeholder="••••••••"
          className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-slate-50 placeholder-slate-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 font-mono text-sm" 
        />
        {errors.confirm && <p className="mt-1 text-[10px] uppercase font-bold text-rose-500">{errors.confirm.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-lime-400 px-3 py-2 font-bold tracking-widest uppercase text-[10px] text-slate-950 transition-colors hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:bg-lime-400/50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(190,242,100,0.15)]"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CREATE ACCOUNT'}
      </button>

      <div className="mt-4 text-center text-[10px] uppercase font-mono tracking-widest text-slate-500">
        ALREADY HAVE AN ACCOUNT?{' '}
        <Link to="/login" className="font-bold text-lime-400 hover:text-lime-300 border-b border-lime-400/30 hover:border-lime-400 pb-0.5">
          SIGN IN
        </Link>
      </div>
    </form>
  );
}
