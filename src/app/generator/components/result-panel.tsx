'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { findImage, type Hairstyle } from '@/lib/placeholder-images';
import { RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { handleImageGeneration } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { AnalyzeFaceAndSuggestHairstylesOutput } from '@/ai/flows/analyze-face-and-suggest-hairstyles';
import type { GenerateHairstyleImageOutput } from '@/ai/flows/generate-hairstyle-image';

interface ResultPanelProps {
  state: 'idle' | 'uploaded' | 'analyzing' | 'analyzed' | 'generating' | 'generated' | 'error';
  setState: React.Dispatch<React.SetStateAction<ResultPanelProps['state']>>;
  uploadedImage: string | null;
  analysisResult: AnalyzeFaceAndSuggestHairstylesOutput | null;
  selectedHairstyle: Hairstyle | null;
  hairstyleAnalysis: GenerateHairstyleImageOutput | null;
  setHairstyleAnalysis: (analysis: GenerateHairstyleImageOutput | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export default function ResultPanel({
  state,
  setState,
  uploadedImage,
  analysisResult,
  selectedHairstyle,
  hairstyleAnalysis,
  setHairstyleAnalysis,
  error,
  setError,
}: ResultPanelProps) {
  const placeholder = findImage('user-upload-placeholder');
  const { toast } = useToast();
  const isCompatibilityRunning = state === 'generating';

  const onGenerate = async () => {
    if (!uploadedImage || !selectedHairstyle) return;
    setState('generating');
    setError(null);
    try {
      const result = await handleImageGeneration(uploadedImage, selectedHairstyle, analysisResult?.faceAnalysis);
      if (result.featureBreakdown?.length) {
        setHairstyleAnalysis(result);
        setState('generated');
        toast({
          title: 'Analysis Complete!',
          description: 'We evaluated how well this hairstyle fits you.',
        });
      } else {
        throw new Error('AI did not return a hairstyle analysis.');
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setState('error');
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: err.message || 'Could not analyze the hairstyle compatibility.',
      });
    }
  };

  const renderContent = () => {
    if (state === 'generating') {
      return (
        <div className="aspect-square w-full flex flex-col items-center justify-center bg-muted rounded-lg">
          <Wand2 className="w-16 h-16 text-primary animate-pulse" />
          <p className="mt-4 text-lg text-muted-foreground">Evaluating hairstyle fit...</p>
          <p className="text-sm text-muted-foreground">This may take a moment.</p>
        </div>
      );
    }

    if (state === 'analyzing' && uploadedImage) {
      return (
        <div className="relative">
          <Image
            src={uploadedImage}
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
    }

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
        <p className="mt-4 text-muted-foreground">Your report will appear here</p>
      </div>
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Preview</CardTitle>
        <CardDescription>Review your hairstyle compatibility report.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {renderContent()}
        {analysisResult && state !== 'generating' && (
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Face Analysis
              </CardTitle>
              <CardDescription>Insights from your uploaded photo.</CardDescription>
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
        {hairstyleAnalysis && (
          <Card className="bg-secondary/40 border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                Hairstyle Compatibility
              </CardTitle>
              <CardDescription>Compare this hairstyle with your facial features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-foreground">{hairstyleAnalysis.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-foreground">Overall Match:</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary font-medium">
                    {hairstyleAnalysis.compatibilityLabel}
                  </span>
                  {typeof hairstyleAnalysis.compatibilityScore === 'number' && (
                    <span className="text-xs text-muted-foreground">
                      Score: {Math.round(hairstyleAnalysis.compatibilityScore)} / 100
                    </span>
                  )}
                </div>
              </div>
              <div className="grid gap-3">
                {hairstyleAnalysis.featureBreakdown.map((feature, index) => (
                  <div
                    key={`${feature.feature}-${index}`}
                    className="rounded-md border bg-background/70 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{feature.feature}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                          {feature.suitability}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground mt-2">{feature.insight}</p>
                    {feature.recommendation && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Tip: {feature.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {error && <p className="text-destructive text-center">{error}</p>}
        {state !== 'generated' ? (
          <Button onClick={onGenerate} disabled={!selectedHairstyle || isCompatibilityRunning}>
            Evaluate Compatibility
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={onGenerate}
            disabled={!selectedHairstyle || isCompatibilityRunning}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-run Analysis
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
