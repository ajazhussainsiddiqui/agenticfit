import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { GuestUpsell } from '../shared/GuestUpsell';
import { supabase } from '../../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

export function AccountTab() {
  const { isGuest, session, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const res = await api.get('/planner/users/search');
      return res.data;
    },
    enabled: !isGuest && !!session,
    retry: false,
  });

  const updateNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await api.post(`/planner/users/update?updated_name=${encodeURIComponent(newName)}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      setIsEditingName(false);
      toast.success('Name updated successfully');
    },
    onError: () => {
      toast.error('Failed to update name');
    }
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      clearSession();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err: any) {
      toast.error('Failed to log out');
    }
  };

  const handleEditNameClick = () => {
    setEditNameValue(userProfile?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (editNameValue.trim() && editNameValue.trim() !== userProfile?.name) {
      updateNameMutation.mutate(editNameValue.trim());
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
  };

  if (isGuest || !session) {
    return (
      <div className="mt-8">
        <GuestUpsell 
          title="Create an account" 
          description="Sign in or create an account to manage your profile and data."
          actionLabel="Sign In" 
          onAction={() => navigate('/login')} 
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex-1 w-full space-y-6">
          <div>
             <h3 className="mb-2 text-2xl font-black italic uppercase tracking-tighter text-slate-100">ACCOUNT DETAILS</h3>
             <p className="text-sm font-medium text-slate-400 max-w-2xl leading-relaxed">Review your account registration metadata.</p>
          </div>
          
          <div className="space-y-4 max-w-xl text-sm font-mono">
            <div className="grid grid-cols-3 py-4 border-b border-slate-800/80 items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center">Name</span>
              <span className="col-span-2 flex items-center justify-between gap-4">
                {isProfileLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : isEditingName ? (
                  <div className="flex w-full items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      placeholder="Enter your name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                      disabled={updateNameMutation.isPending}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleSaveName}
                        disabled={updateNameMutation.isPending}
                        className="p-1.5 rounded-md text-lime-400 hover:bg-lime-400/10 transition-colors"
                        title="Save"
                      >
                        {updateNameMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={updateNameMutation.isPending}
                        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-slate-200">{userProfile?.name || <span className="text-slate-500 italic">Not set</span>}</span>
                    <button 
                      onClick={handleEditNameClick}
                      className="p-1.5 rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                      title="Edit name"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 py-4 border-b border-slate-800/80 items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center pr-2">Email</span>
              <span className="col-span-2 text-lime-400 font-bold break-all">{session.user.email}</span>
            </div>
            <div className="grid grid-cols-3 py-4 border-b border-slate-800/80 items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center">Joined</span>
              <span className="col-span-2 text-slate-300">
                {session.user.created_at ? new Date(session.user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start mt-4">
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/20 px-8 py-4 text-[10px] tracking-widest uppercase font-bold text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <LogOut className="h-4 w-4" />
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
}
