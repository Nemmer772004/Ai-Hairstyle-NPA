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
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
    onAnalyze(dataUri);
  };
  
  const onAnalyze = async (image: string) => {
    if (!image) return;
    setState('analyzing');
    setError(null);
    try {
      const result = await handleImageAnalysis(image);
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

  const resetState = () => {
    setState('idle');
    setUploadedImage(null);
    setAnalysisResult(null);
    setSelectedHairstyle(null);
    setGeneratedImage(null);
    setError(null);
  }

  if (state === 'idle') {
    return <ImageUploader onImageUpload={handleImageUpload} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 min-h-screen">
       {/* Left Panel: Result */}
      <div className="md:col-span-2 bg-muted/30">
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

      {/* Right Panel: Controls */}
      <div className="col-span-1 p-6 flex flex-col h-full bg-background">
        <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={resetState}>
                <ArrowLeft />
            </Button>
            <h1 className="text-xl font-bold font-headline">Hairstyle</h1>
            <div className="w-8"></div>
        </div>

        {analysisResult && (
          <div className="mb-6 p-4 rounded-lg bg-secondary/50 border">
            <h3 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="text-primary w-5 h-5"/> AI Analysis</h3>
            <p className="text-sm text-muted-foreground">{analysisResult.faceAnalysis}</p>
          </div>
        )}
        
        <div className="flex-grow overflow-y-auto">
          <HairstyleSelector
            selectedHairstyle={selectedHairstyle}
            onSelectHairstyle={setSelectedHairstyle}
            suggestedHairstyles={analysisResult?.suggestedHairstyles || []}
          />
        </div>
      </div>
    </div>
  );
}
