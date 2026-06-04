import { useNavigate } from 'react-router-dom';
import { GuestUpsell } from '../components/shared/GuestUpsell';
import { useAuthStore } from '../stores/authStore';

export function PlaceholderPage({ title }: { title: string }) {
  const isGuest = useAuthStore((state) => state.isGuest);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="mb-12">
        <span className="mb-4 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-500">
          Phase 1 Foundation
        </span>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white">
          {title}<br/>
          <span className="text-zinc-500">View.</span>
        </h1>
        <p className="max-w-xl text-lg text-zinc-400">
          This is the scaffolded view for {title}. Check back later.
        </p>
      </div>
      
      {isGuest && (
        <GuestUpsell 
          title="Unlock Personal Metrics"
          description={`You are currently viewing in Guest Mode. Connect your account to save your ${title.toLowerCase()} data, track your progress, and get AI-powered recommendations.`}
          actionLabel="Create Account"
          onAction={() => navigate('/signup')}
          className="mb-8"
        />
      )}

      {/* Grid placeholder to match design */}
      <div className="pointer-events-none grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-30 mt-8">
        <div className="h-32 rounded-xl border border-zinc-800 bg-zinc-900/50"></div>
        <div className="h-32 rounded-xl border border-zinc-800 bg-zinc-900/50"></div>
      </div>
    </div>
  );
}
