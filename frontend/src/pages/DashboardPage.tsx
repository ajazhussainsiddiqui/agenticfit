import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { TodaySnapshot } from '../components/dashboard/TodaySnapshot';
import { QuickActions } from '../components/dashboard/QuickActions';
import { WeeklyTrendsChart } from '../components/dashboard/WeeklyTrendsChart';
import { ActivePlans } from '../components/dashboard/ActivePlans';
import { InjuryRiskGauge } from '../components/dashboard/InjuryRiskGauge';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { PageWrapper } from '../components/shared/PageWrapper';

interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface InjuryRiskResponse {
  prediction: number;
}

export function DashboardPage() {
  const { data: user, error: userError, isLoading: userLoading } = useQuery<User, any>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const res = await api.get('/planner/users/search');
      return res.data;
    },
    retry: false,
  });

  const { data: weeklyLogs, error: logError, isLoading: logLoading } = useQuery({
    queryKey: ['daily-logs', 'weekly'],
    queryFn: async () => {
      const res = await api.get('/planner/daily-logs/search?search_limit=7');
      return res.data || [];
    },
    enabled: !!user,
    retry: false,
  });

  const { data: injuryRisk, error: injuryError, isLoading: injuryLoading } = useQuery<InjuryRiskResponse, any>({
    queryKey: ['injury_risk', 'me'],
    queryFn: async () => {
      const res = await api.get('/injury/injury_risk/me');
      return res.data;
    },
    enabled: !!user,
    retry: false,
  });

  if (userLoading || injuryLoading || logLoading) {
    return (
      <PageWrapper>
        <DashboardSkeleton />
      </PageWrapper>
    );
  }

  const isUserAuthError = userError?.isAuthError || userError?.response?.status === 401;
  const isInjuryAuthError = injuryError?.isAuthError || injuryError?.response?.status === 401;
  const isLogAuthError = (logError as any)?.isAuthError || (logError as any)?.response?.status === 401;
  
  const authError = isUserAuthError || isLogAuthError || isInjuryAuthError;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';

  return (
    <PageWrapper
      title="Dashboard"
      description={<span>WELCOME BACK, <span className="text-lime-400">{firstName}</span>. HERE'S YOUR DAILY SUMMARY.</span>}
    >
      <div className="space-y-8">
        <TodaySnapshot isAuthError={authError} weeklyLogs={weeklyLogs || []} />
        
        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeeklyTrendsChart isAuthError={authError} weeklyLogs={weeklyLogs} />
          </div>
          <div>
            <InjuryRiskGauge 
              isAuthError={isInjuryAuthError} 
              prediction={injuryRisk?.prediction} 
            />
          </div>
        </div>

        <ActivePlans isAuthError={isUserAuthError} />
      </div>
    </PageWrapper>
  );
}
