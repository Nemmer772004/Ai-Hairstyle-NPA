'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { findImage, type Hairstyle } from '@/lib/placeholder-images';
import { ExternalLink, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { handleImageGeneration } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { AnalyzeFaceAndSuggestHairstylesOutput } from '@/ai/flows/analyze-face-and-suggest-hairstyles';
import type { GenerateHairstyleImageOutput } from '@/ai/flows/generate-hairstyle-image';
import { translateCompatibilityLabel } from '@/lib/labels';

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
          title: 'Đánh giá hoàn tất!',
          description: 'Chúng tôi đã tính toán độ phù hợp của kiểu tóc này với bạn.',
        });
      } else {
        throw new Error('AI không trả về thông tin đánh giá kiểu tóc.');
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setState('error');
      toast({
        variant: 'destructive',
        title: 'Đánh giá thất bại',
        description: err.message || 'Không thể phân tích độ phù hợp của kiểu tóc.',
      });
    }
  };

  const renderContent = () => {
    if (state === 'generating') {
      return (
        <div className="aspect-square w-full flex flex-col items-center justify-center bg-muted rounded-lg">
          <Wand2 className="w-16 h-16 text-primary animate-pulse" />
          <p className="mt-4 text-lg text-muted-foreground">Đang đánh giá độ phù hợp...</p>
          <p className="text-sm text-muted-foreground">Vui lòng chờ trong giây lát.</p>
        </div>
      );
    }

    if (state === 'analyzing' && uploadedImage) {
      return (
        <div className="relative">
          <Image
            src={uploadedImage}
            alt="Ảnh bạn tải lên"
            width={512}
            height={512}
            className="rounded-lg object-cover w-full shadow-lg opacity-30"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-lg">
            <Sparkles className="w-16 h-16 text-white animate-pulse" />
            <p className="mt-4 text-lg text-white font-semibold">Đang phân tích khuôn mặt...</p>
          </div>
        </div>
      );
    }

    if (uploadedImage) {
      return (
        <Image
          src={uploadedImage}
          alt="Ảnh bạn tải lên"
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
        <p className="mt-4 text-muted-foreground">Báo cáo sẽ hiển thị tại đây</p>
      </div>
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Xem trước kết quả</CardTitle>
        <CardDescription>Kiểm tra báo cáo độ phù hợp và điều chỉnh nếu cần.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {renderContent()}
        {analysisResult && state !== 'generating' && (
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Phân tích khuôn mặt
              </CardTitle>
              <CardDescription>Những ghi nhận chính từ ảnh bạn tải lên.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground mb-2">{analysisResult.faceAnalysis}</p>
              <p className="text-sm font-semibold">Kiểu tóc được AI gợi ý:</p>
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
                Độ phù hợp của kiểu tóc
              </CardTitle>
              <CardDescription>Đối chiếu kiểu tóc hiện tại với đường nét khuôn mặt của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-foreground">{hairstyleAnalysis.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-foreground">Kết quả tổng quan:</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary font-medium">
                    {translateCompatibilityLabel(hairstyleAnalysis.compatibilityLabel)}
                  </span>
                  {typeof hairstyleAnalysis.compatibilityScore === 'number' && (
                    <span className="text-xs text-muted-foreground">
                      Điểm số: {Math.round(hairstyleAnalysis.compatibilityScore)} / 100
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
                        Gợi ý: {feature.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {hairstyleAnalysis.productSuggestions?.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Gợi ý mua sắm</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {hairstyleAnalysis.productSuggestions.map((product, index) => (
                      <div
                        key={`${product.name}-${index}`}
                        className="rounded-md border bg-background/70 p-3 flex flex-col gap-2">
                        <p className="text-sm font-semibold text-foreground leading-tight">{product.name}</p>
                        {product.reason && (
                          <p className="text-xs text-muted-foreground">{product.reason}</p>
                        )}
                        {product.link && (
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Mở trang sản phẩm
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
        {error && <p className="text-destructive text-center">{error}</p>}
        {state !== 'generated' ? (
          <Button onClick={onGenerate} disabled={!selectedHairstyle || isCompatibilityRunning}>
            Đánh giá độ phù hợp
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={onGenerate}
            disabled={!selectedHairstyle || isCompatibilityRunning}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Phân tích lại
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
