import React from 'react';
import { Brain, Map, Camera, Activity, Key, Search } from 'lucide-react';

const features = [
  {
    title: 'AI Plans',
    subtitle: 'Adaptive Training & Nutrition',
    description: 'Your weekly workout and diet plans evolve based on your past performance, feedback, health metrics, experience level, and dietary restrictions. The system learns what works and adjusts accordingly.',
    icon: Map,
  },
  {
    title: 'Food Vision',
    subtitle: 'Multimodal Calorie Analysis',
    description: 'Snap a photo of any meal and get an instant structured breakdown calories, macros, and ingredients, with confidence scoring.',
    icon: Camera,
  },
  {
    title: 'Injury Risk Prediction',
    subtitle: 'Predictive Health Analytics',
    description: 'A machine learning model LightGBM analyzes your recovery scores, strain, sleep quality, HRV, and historical logs to calculate your next-day injury probability. Train smarter by knowing when to push and when to rest.',
    icon: Activity,
  },
  {
    title: 'AI Chat Assistant',
    subtitle: 'Intelligent Health Copilot',
    description: 'A streaming LLM chatbot that queries your health data, fetches plans, predicts injury risk, and performs database operations with HITL approval for any sensitive create, edit, or delete action. Supports thinking models with visible reasoning streams.',
    icon: Brain,
  },
  {
    title: 'BYOK (Bring Your Own Key)',
    subtitle: 'Use Your Own AI Provider',
    description: 'Connect OpenAI, Anthropic, HuggingFace, Ollama, or any other provider.\nNote: A built-in model is provided by default exclusively for the Chat Assistant (with a daily token limit and real-time usage tracking). Plan generation and vision requires your own API key.',
    icon: Key,
  },
  {
    title: 'Workout Library',
    subtitle: 'Hybrid Semantic Search',
    description: 'Search thousands of exercises using advanced retrieval: vector semantic search (BAAI/bge-large-en-v1.5) combined with full-text search, reranked by cross-encoder (ms-marco-MiniLM-L-6-v2) for precise relevance scoring.',
    icon: Search,
  }
];

export function FeatureGrid() {
  return (
    <div id="features" className="w-full max-w-7xl mx-auto flex flex-col gap-12 p-6 scroll-mt-24">
      <div className="text-center px-4 flex flex-col items-center">
        <h2 className="mb-4 font-black italic uppercase tracking-tighter text-5xl md:text-6xl text-slate-50">
          ENGINEERED FOR RESULTS.
        </h2>
        <p className="font-medium text-slate-400 text-sm leading-relaxed max-w-2xl">
          Everything you need to optimize your health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
        <div key={idx} className="rounded-[32px] border border-slate-800 bg-slate-900 p-8 hover:border-lime-400/50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: `${(idx + 3) * 100}ms` }}>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 text-lime-400 shadow-inner">
            <feature.icon className="h-8 w-8" />
          </div>
          <div>
            <h3 className="mt-8 mb-2 text-xl font-black italic uppercase tracking-tighter text-slate-100">{feature.title}</h3>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{feature.subtitle}</h4>
            <p className="font-medium text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{feature.description}</p>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
