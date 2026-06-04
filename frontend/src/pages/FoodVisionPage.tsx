import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadZone } from '../components/food-vision/UploadZone';
import { ImagePreview } from '../components/food-vision/ImagePreview';
import { AnalyzeButton } from '../components/food-vision/AnalyzeButton';
import { FoodResultCard } from '../components/food-vision/FoodResultCard';
import { NotFoodAlert } from '../components/food-vision/NotFoodAlert';
import { GuestUpsell } from '../components/shared/GuestUpsell';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { PageWrapper } from '../components/shared/PageWrapper';
import { Bot } from 'lucide-react';

export interface IngredientCalorie {
  name: string;
  calories: number;
}

export interface FoodCalorieInfo {
  food_name: string;
  total_calories: number;
  breakdown: IngredientCalorie[];
  confidence: number;
}

export interface FoodVisionResponse {
  is_food: boolean;
  status_message: string;
  calorie_info?: FoodCalorieInfo;
}

export function FoodVisionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FoodVisionResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  const isGuest = useAuthStore(state => state.isGuest);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setResult(null);
    setApiError(null);
    setAuthError(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/vision/food_image_process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data);
    } catch (err: any) {
      console.error('Vision analysis failed', err);
      if (err.isAuthError || err.response?.status === 401 || err.response?.status === 403) {
        setAuthError(true);
      } else {
        setApiError(getErrorMessage(err, 'Failed to analyze image'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setResult(null);
    setApiError(null);
    setAuthError(false);
    setFileError(null);
  };

  return (
    <PageWrapper title="Food Vision" description="SNAP A PHOTO TO INSTANTLY ANALYZE THE MACRONUTRIENTS AND CALORIES OF YOUR MEAL.">
      <div className="space-y-12 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <div className="flex items-start gap-4">
            <div className="rounded-xl flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-300">Vision-Capable AI Model Required</h3>
              <p className="mt-1 text-xs text-indigo-400/80 leading-relaxed max-w-2xl">
                Food analysis requires a multimodal LLM that supports image processing (e.g., GPT-4o, Claude 3, Gemini). Standard text-only models won't work. Configure a vision-supported provider in LLM Config to analyze meals.
              </p>
            </div>
          </div>
          <Link to="/llm-config" className="shrink-0 px-4 py-2 mt-2 sm:mt-0 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-[10px] font-bold uppercase tracking-widest text-indigo-300 transition-colors">
            Configure LLM
          </Link>
        </div>

        <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 md:p-8 backdrop-blur-sm">
          {!file ? (
            <UploadZone 
              onFileSelect={setFile} 
              error={fileError} 
              setError={setFileError} 
            />
          ) : (
            <div className="flex flex-col items-start">
               <ImagePreview file={file} onRemove={handleRemove} />
               <AnalyzeButton 
                 onClick={handleAnalyze} 
                 isLoading={isLoading} 
                 disabled={!file} 
               />
            </div>
          )}
        </div>

        {apiError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 animate-in fade-in slide-in-from-bottom-2">
            {apiError}
          </div>
        )}

        {authError && isGuest && (
          <GuestUpsell 
             title="Premium Feature" 
             description="Sign in to analyze nutrition details and save meals to your log." 
             actionLabel="Sign In" 
             onAction={() => navigate('/login')} 
             variant="card"
             className="w-full border-red-500/30 bg-red-950/10 animate-in fade-in slide-in-from-bottom-2"
          />
        )}

        {result && (
          result.is_food && result.calorie_info ? (
            <FoodResultCard info={result.calorie_info} imageFile={file!} />
          ) : (
            <NotFoodAlert message={result.status_message || "We couldn't detect food in this image. Please try another photo."} />
          )
        )}
      </div>
    </PageWrapper>
  );
}
