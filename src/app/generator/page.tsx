'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Hairstyle } from '@/lib/placeholder-images';
import ImageUploader from './components/image-uploader';
import HairstyleSelector from './components/hairstyle-selector';
import ResultPanel from './components/result-panel';
import { handleImageAnalysis } from '../actions';
import type { AnalyzeFaceAndSuggestHairstylesOutput } from '@/ai/flows/analyze-face-and-suggest-hairstyles';

type GenerationState = 'idle' | 'uploaded' | 'analyzing' | 'analyzed' | 'generating' | 'generated' | 'error';

export default function GeneratorPage() {
  const [state, setState] = useState<GenerationState>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFaceAndSuggestHairstylesOutput | null>(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleImageUpload = (dataUri: string) => {
    setUploadedImage(dataUri);
    setState('uploaded');
    setAnalysisResult(null);
    setSelectedHairstyle(null);
    setGeneratedImage(null);
    setError(null);
  };

  const onAnalyze = async () => {
    if (!uploadedImage) return;
    setState('analyzing');
    setError(null);
    try {
      const result = await handleImageAnalysis(uploadedImage);
      setAnalysisResult(result);
      setState('analyzed');
      toast({
        title: 'Analysis Complete',
        description: 'We have analyzed your face and provided hairstyle suggestions.',
      });
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setState('error');
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: err.message || 'Could not analyze the image.',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Controls */}
        <div className="flex flex-col gap-6">
          <ImageUploader onImageUpload={handleImageUpload} />

          {state !== 'idle' && (
            <Button onClick={onAnalyze} disabled={state === 'analyzing' || state === 'generating'}>
              {state === 'analyzing' ? 'Analyzing...' : 'Analyze My Face'}
            </Button>
          )}

          <HairstyleSelector
            selectedHairstyle={selectedHairstyle}
            onSelectHairstyle={setSelectedHairstyle}
            suggestedHairstyles={analysisResult?.suggestedHairstyles || []}
          />
        </div>

        {/* Right Column: Results */}
        <div className="sticky top-20">
          <ResultPanel
            state={state}
            setState={setState}
            uploadedImage={uploadedImage}
            analysisResult={analysisResult}
            selectedHairstyle={selectedHairstyle}
            generatedImage={generatedImage}
            setGeneratedImage={setGeneratedImage}
            error={error}
            setError={setError}
          />
        </div>
      </div>
    </div>
  );
}
