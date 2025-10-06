'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { findImage, type Hairstyle } from '@/lib/placeholder-images';
import { Download, Share2, Sparkles, Wand2 } from 'lucide-react';
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
          <div className="aspect-square w-full flex flex-col items-center justify-center bg-muted rounded-lg">
            <Wand2 className="w-16 h-16 text-primary animate-pulse" />
            <p className="mt-4 text-lg text-muted-foreground">Generating your new look...</p>
            <p className="text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        );
      case 'generated':
        return (
          <div className="relative">
            <Image
              src={generatedImage!}
              alt="Generated hairstyle"
              width={512}
              height={512}
              className="rounded-lg object-cover w-full shadow-lg"
            />
          </div>
        );
      case 'analyzing':
        return (
          <div className="relative">
            <Image
              src={uploadedImage!}
              alt="User upload"
              width={512}
              height={512}
              className="rounded-lg object-cover w-full shadow-lg opacity-30"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-lg">
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
            <Image
              src={uploadedImage}
              alt="User upload"
              width={512}
              height={512}
              className="rounded-lg object-cover w-full shadow-lg"
            />
          );
        }
      // fallthrough for idle state
      default:
        return (
          <div className="aspect-square w-full flex flex-col items-center justify-center bg-muted rounded-lg">
            <Image
              src={placeholder!.imageUrl}
              alt={placeholder!.description}
              data-ai-hint={placeholder!.imageHint}
              width={256}
              height={256}
              className="rounded-lg opacity-50"
            />
            <p className="mt-4 text-muted-foreground">Your result will appear here</p>
          </div>
        );
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Preview</CardTitle>
        <CardDescription>See your AI-generated hairstyle here.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {renderContent()}
        {analysisResult && state !== 'generating' && (
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground mb-2">{analysisResult.faceAnalysis}</p>
              <p className="text-sm font-semibold">Suggested Styles:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {analysisResult.suggestedHairstyles.map((style, i) => (
                  <li key={i}>{style}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {error && <p className="text-destructive text-center">{error}</p>}
        {state !== 'generated' ? (
          <Button onClick={onGenerate} disabled={!selectedHairstyle || state === 'generating'}>
            Generate Hairstyle
          </Button>
        ) : (
          <div className="flex gap-4">
            <Button className="flex-1" asChild>
              <a href={generatedImage!} download="hairstyle_result.png">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(window.location.href)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
