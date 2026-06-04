import { useState } from 'react';
import { HealthMetricsForm } from '../components/profile/HealthMetricsForm';
import { DietaryProfileForm } from '../components/profile/DietaryProfileForm';
import { AccountTab } from '../components/settings/AccountTab';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { PageWrapper } from '../components/shared/PageWrapper';
import { SkeletonCard } from '../components/shared/Skeletons';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'health' | 'diet' | 'account'>('health');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const res = await api.get('/planner/users/search');
      return res.data;
    },
    retry: false,
  });

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['health-metrics'],
    queryFn: async () => {
      const res = await api.get('/planner/health-metrics/search');
      if (!res.data) return undefined;
      const rawData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!rawData) return undefined;
      const data = { ...rawData };
      Object.keys(data).forEach(key => {
        if (data[key] === null) data[key] = undefined;
      });
      return data;
    },
    enabled: !!user,
    retry: false,
  });

  const { data: dietData, isLoading: dietLoading } = useQuery({
    queryKey: ['dietary-profile'],
    queryFn: async () => {
      const res = await api.get('/planner/dietary-profiles/search');
      if (!res.data) return undefined;
      const rawData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!rawData) return undefined;
      const data = { ...rawData };
      Object.keys(data).forEach(key => {
        if (data[key] === null) data[key] = undefined;
      });
      return data;
    },
    enabled: !!user,
    retry: false,
  });

  return (
    <PageWrapper 
      title="Profile Settings" 
      description="MANAGE YOUR HEALTH METRICS AND DIETARY PREFERENCES."
    >
      <div className="space-y-8 pb-12">
        <div className="border-b border-slate-800">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('health')}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-[10px] uppercase font-bold tracking-widest transition-colors ${
                activeTab === 'health'
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              Health Metrics
            </button>
            <button
              onClick={() => setActiveTab('diet')}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-[10px] uppercase font-bold tracking-widest transition-colors ${
                activeTab === 'diet'
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              Dietary Profile
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-[10px] uppercase font-bold tracking-widest transition-colors ${
                activeTab === 'account'
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              Account
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'health' && (
            healthLoading ? (
              <div className="space-y-6">
                <SkeletonCard className="h-64" />
                <SkeletonCard className="h-48" />
              </div>
            ) : (
              <HealthMetricsForm initialData={healthData} />
            )
          )}
          
          {activeTab === 'diet' && (
            dietLoading ? (
              <div className="space-y-6">
                <SkeletonCard className="h-64" />
              </div>
            ) : (
              <DietaryProfileForm initialData={dietData} />
            )
          )}

          {activeTab === 'account' && <AccountTab />}
        </div>
      </div>
    </PageWrapper>
  );
}
