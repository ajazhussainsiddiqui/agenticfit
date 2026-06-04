import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './components/AuthProvider';
import { RootLayout } from './components/layout/RootLayout';
import { LandingPage } from './pages/LandingPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { FoodVisionPage } from './pages/FoodVisionPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { DailyLogPage } from './pages/DailyLogPage';
import { ProfilePage } from './pages/ProfilePage';

import { PlansPage } from './pages/PlansPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { LLMConfigPage } from './pages/LLMConfigPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          theme="dark" 
          position="top-right" 
          duration={4000} 
          visibleToasts={3}
          toastOptions={{
            classNames: {
              success: 'bg-lime-400/10 text-lime-400 border-lime-400/20',
              error: 'bg-red-500/10 text-red-500 border-red-500/20',
              info: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
              warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }
          }}
        />
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/daily-log" element={<DailyLogPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/food-vision" element={<FoodVisionPage />} />
            <Route path="/llm-config" element={<LLMConfigPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
