'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { findImage, type Hairstyle } from '@/lib/placeholder-images';
import { Download, Share2, Sparkles, Wand2, ArrowLeft } from 'lucide-react';
import { handleImageGeneration } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalyzeFaceAndSuggestHairstylesOutput } from '@/ai/flows/analyze-face-and-suggest-hairstyles';

interface ResultPanelProps {
  state: 'idle' | 'uploaded' | 'analyzing' | 'analyzed' | 'generating' | 'generated' | 'error';
  setState: React.Dispatch<React.SetStateAction<ResultPanelProps['state']>>;
  uploadedImage: string | null;
  analysisResult: AnalyzeFaceAndSuggestHairstylesOutput | null;
  selectedHairstyle: Hairstyle | null;
  generatedImage: string | null;
  setGeneratedImage: (image: string | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export default function ResultPanel({
  state,
  setState,
  uploadedImage,
  analysisResult,
  selectedHairstyle,
  generatedImage,
  setGeneratedImage,
  error,
  setError,
}: ResultPanelProps) {
  const placeholder = findImage('user-upload-placeholder');
  const { toast } = useToast();

  const onGenerate = async () => {
    if (!uploadedImage || !selectedHairstyle) return;
    setState('generating');
    setError(null);
    try {
      const result = await handleImageGeneration(uploadedImage, selectedHairstyle, analysisResult?.faceAnalysis);
      if (result.outputImageUrl) {
        setGeneratedImage(result.outputImageUrl);
        setState('generated');
        toast({
          title: 'Generation Complete!',
          description: 'Your new hairstyle is ready.',
        });
      } else {
        throw new Error('AI did not return an image.');
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setState('error');
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: err.message || 'Could not generate the image.',
      });
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'generating':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
            <Wand2 className="w-16 h-16 text-primary animate-pulse" />
            <p className="mt-4 text-lg text-muted-foreground">Generating your new look...</p>
            <p className="text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        );
      case 'generated':
        return (
          <div className="relative w-full h-full">
            <Image
              src={generatedImage!}
              alt="Generated hairstyle"
              fill
              className="object-contain"
            />
          </div>
        );
      case 'analyzing':
         return (
          <div className="relative w-full h-full">
            <Image
              src={uploadedImage!}
              alt="User upload"
              fill
              className="object-contain opacity-30"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
              <Sparkles className="w-16 h-16 text-white animate-pulse" />
              <p className="mt-4 text-lg text-white font-semibold">Analyzing your face...</p>
            </div>
          </div>
        );
      case 'uploaded':
      case 'analyzed':
      case 'error':
        if (uploadedImage) {
          return (
            <div className="relative w-full h-full">
                <Image
                src={uploadedImage}
                alt="User upload"
                fill
                className="object-contain"
                />
            </div>
          );
        }
      // fallthrough for idle state
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
             <p className="mt-4 text-muted-foreground">Upload an image to start</p>
          </div>
        );
    }
  };
  
    React.useEffect(() => {
        if(selectedHairstyle && uploadedImage && state !== 'generating' && state !== 'generated'){
            onGenerate();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHairstyle, uploadedImage, state]);


  return (
    <div className="w-full h-full relative">
       {renderContent()}
    </div>
  );
}
