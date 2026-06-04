import { PageWrapper } from '../components/shared/PageWrapper';
import { LLMConfigTab } from '../components/settings/LLMConfigTab';

export function LLMConfigPage() {
  return (
    <PageWrapper 
      title="LLM Configuration" 
      description="BRING YOUR OWN KEY (BYOK) TO CONNECT LLM TO POWER AI FEATURES"
    >
      <div className="pb-12">
        <LLMConfigTab />
      </div>
    </PageWrapper>
  );
}
