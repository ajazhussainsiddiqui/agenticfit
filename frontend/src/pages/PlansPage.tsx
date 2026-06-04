import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { PlanTabs } from '../components/plans/PlanTabs';
import { GenerateSection } from '../components/plans/GenerateSection';
import { ExercisePlanCard } from '../components/plans/ExercisePlanCard';
import { DietPlanCard } from '../components/plans/DietPlanCard';
import { PlanDetailSheet } from '../components/plans/PlanDetailSheet';
import { PageWrapper } from '../components/shared/PageWrapper';
import { AuthErrorHandler } from '../components/shared/AuthErrorHandler';
import { SkeletonCard } from '../components/shared/Skeletons';


export function PlansPage() {
  const [activeTab, setActiveTab] = useState<'exercise' | 'diet'>('exercise');
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [searchLimit, setSearchLimit] = useState(10);

  const { data: exerciseHistory, isLoading: exLoading, error: exError, refetch: refetchEx } = useQuery({
    queryKey: ['exercise-history', searchLimit],
    queryFn: async () => {
      const res = await api.get(`/planner/plans/exercise/history?search_limit=${searchLimit}`);
      return res.data;
    },
    enabled: activeTab === 'exercise',
    retry: false,
  });

  const { data: dietHistory, isLoading: dietLoading, error: dietError, refetch: refetchDiet } = useQuery({
    queryKey: ['diet-history', searchLimit],
    queryFn: async () => {
      const res = await api.get(`/planner/plans/diet/history?search_limit=${searchLimit}`);
      return res.data;
    },
    enabled: activeTab === 'diet',
    retry: false,
  });

  const error = activeTab === 'exercise' ? exError : dietError;
  const isLoading = activeTab === 'exercise' ? exLoading : dietLoading;

  const handlePlanGenerated = () => {
    if (activeTab === 'exercise') refetchEx();
    else refetchDiet();
  };

  return (
    <PageWrapper
      title="Your Plans"
      description="GENERATE YOUR PERSONALIZED WEEKLY ROUTINES & MEALS OR REVIEW YOUR PAST AI-GENERATED PLANS."
    >
      <div className="space-y-12">
        <PlanTabs activeTab={activeTab} onChange={setActiveTab} />
        
        <GenerateSection planType={activeTab} onPlanGenerated={handlePlanGenerated} />

        <div className="mt-16">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">Plan History</h2>
          
          <AuthErrorHandler 
            error={error} 
            isInitialLoad={true}
            fallbackTitle="View Plan History"
            fallbackDescription="Sign in to view your previously generated exercise and diet plans."
          >
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} className="h-48" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTab === 'exercise' && exerciseHistory?.map((plan: any) => (
                    <ExercisePlanCard key={plan.id} plan={plan} onViewDetails={setSelectedPlan} />
                  ))}
                  
                  {activeTab === 'diet' && dietHistory?.map((plan: any) => (
                    <DietPlanCard key={plan.id} plan={plan} onViewDetails={setSelectedPlan} />
                  ))}
                </div>
                
                {((activeTab === 'exercise' && exerciseHistory?.length === 0) || 
                  (activeTab === 'diet' && dietHistory?.length === 0)) && (
                  <div className="rounded-[32px] border border-dashed border-slate-800 p-12 text-center mt-6">
                    <p className="text-slate-500 font-medium">No {activeTab} plans generated yet.</p>
                  </div>
                )}
                
                {((activeTab === 'exercise' && exerciseHistory?.length >= searchLimit) || 
                  (activeTab === 'diet' && dietHistory?.length >= searchLimit)) && (
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={() => setSearchLimit(prev => prev + 10)}
                      className="px-6 py-3 rounded-xl border border-slate-800 bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      LOAD MORE
                    </button>
                  </div>
                )}
              </>
            )}
          </AuthErrorHandler>
        </div>

        <PlanDetailSheet 
          isOpen={!!selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
          plan={selectedPlan} 
          planType={activeTab} 
        />
      </div>
    </PageWrapper>
  );
}
