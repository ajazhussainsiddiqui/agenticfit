import { AuthCard } from '../components/auth/AuthCard';
import { SignupForm } from '../components/auth/SignupForm';
import { OAuthButtons } from '../components/auth/OAuthButtons';

export function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <AuthCard showBack={true}>
        <h2 className="mb-1 text-center text-xl font-bold text-slate-100">
          Create an account
        </h2>
        <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Start your fitness journey today
        </p>

        <SignupForm />
        <OAuthButtons />
      </AuthCard>
    </div>
  );
}

