'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { updateHistoryFeedbackAction, deleteHistoryEntryAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { translateCompatibilityLabel } from '@/lib/labels';

type HistorySummary = {
  _id: string;
  summary?: string;
  hairstyleName?: string;
  createdAt: string;
  details?: {
    compatibilityLabel?: string;
    productSuggestions?: { name: string }[];
  };
  stats?: {
    rating?: number;
  };
};

type HistoryDetails = {
  _id: string;
  summary?: string;
  hairstyleName?: string;
  createdAt: string;
  details?: {
    inputImage?: string;
    outputImage?: string;
    analysisSummary?: string;
    compatibilityLabel?: string;
    compatibilityScore?: number;
    featureBreakdown?: { feature: string; insight: string; suitability: string; recommendation?: string }[];
    productSuggestions?: { name: string; link: string; reason?: string }[];
    tags?: string[];
  };
  stats?: {
    note?: string;
    rating?: number;
    match?: boolean;
  };
};

type HistoryClientProps = {
  summary: HistorySummary[];
};

const initialFeedbackState: { error?: string; success?: string } = {};

export function HistoryClient({ summary }: HistoryClientProps) {
  const [summaryList, setSummaryList] = useState(summary);
  const [selectedId, setSelectedId] = useState<string | null>(summary[0]?._id ?? null);
  const [details, setDetails] = useState<Record<string, HistoryDetails>>({});
  const [isPending, setIsPending] = useState(false);
  const [feedbackState, setFeedbackState] = useState(initialFeedbackState);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const currentDetail = selectedId ? details[selectedId] : undefined;

  useEffect(() => {
    setSummaryList(summary);
    if (!summary.some(item => item._id === selectedId)) {
      setSelectedId(summary[0]?._id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  useEffect(() => {
    if (!selectedId || currentDetail) return;
    const historyId = selectedId;

    let isCancelled = false;
    async function loadDetail() {
      setIsPending(true);
      try {
        const response = await fetch(`/api/history/${historyId}`);
        if (!response.ok) return;
        const data = (await response.json()) as HistoryDetails;
        if (!isCancelled) {
          setDetails(prev => ({ ...prev, [historyId]: data }));
        }
      } finally {
        if (!isCancelled) {
          setIsPending(false);
        }
      }
    }

    void loadDetail();

    return () => {
      isCancelled = true;
    };
  }, [selectedId, currentDetail]);

  useEffect(() => {
    if (feedbackState?.error) {
      toast({ variant: 'destructive', title: 'Lỗi', description: feedbackState.error });
    } else if (feedbackState?.success) {
      toast({ title: 'Đã lưu', description: feedbackState.success });
      if (selectedId) {
        const historyId = selectedId;
        // refresh detail after update
        void (async () => {
          setIsPending(true);
          try {
            const response = await fetch(`/api/history/${historyId}`);
            if (response.ok) {
              const data = (await response.json()) as HistoryDetails;
              setDetails(prev => ({ ...prev, [historyId]: data }));
            }
          } finally {
            setIsPending(false);
          }
        })();
      }
    }
  }, [feedbackState, selectedId, toast]);

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <Card className="h-full min-w-0">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Lịch sử gần đây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
          {summaryList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Bạn chưa tạo báo cáo nào. Hãy thử một kiểu tóc mới trong mục Trải nghiệm nhé!
            </p>
          ) : (
            summaryList.map(item => {
              const isActive = item._id === selectedId;
              const firstSuggestionName = item.details?.productSuggestions?.[0]?.name;
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setSelectedId(item._id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    isActive ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/60'
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {item.hairstyleName ?? 'Kiểu tóc tuỳ chỉnh'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </p>
                  {item.details?.compatibilityLabel ? (
                    <Badge variant={isActive ? 'default' : 'secondary'} className="mt-1">
                      {translateCompatibilityLabel(item.details.compatibilityLabel)}
                    </Badge>
                  ) : null}
                  {firstSuggestionName ? (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      Gợi ý: {firstSuggestionName}
                    </p>
                  ) : null}
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="min-h-[480px] min-w-0">
        {selectedId && isPending && !currentDetail ? (
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        ) : currentDetail ? (
          <>
            <CardHeader>
              <CardTitle className="font-headline text-xl">
                {currentDetail.hairstyleName ?? 'Báo cáo kiểu tóc'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(currentDetail.createdAt).toLocaleString('vi-VN')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {currentDetail.details?.inputImage ? (
                  <div>
                    <p className="text-sm font-semibold">Ảnh gốc</p>
                    <Image
                      src={currentDetail.details.inputImage}
                      alt="Ảnh gốc"
                      width={400}
                      height={400}
                      className="mt-2 h-56 w-full rounded-lg object-cover"
                    />
                  </div>
                ) : null}
                {currentDetail.details?.outputImage ? (
                  <div>
                    <p className="text-sm font-semibold">Ảnh gợi ý</p>
                    <Image
                      src={currentDetail.details.outputImage}
                      alt="Ảnh gợi ý"
                      width={400}
                      height={400}
                      className="mt-2 h-56 w-full rounded-lg object-cover"
                    />
                  </div>
                ) : null}
              </div>
              {currentDetail.details?.analysisSummary ? (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {currentDetail.details.analysisSummary}
                  </p>
                </div>
              ) : null}
              {currentDetail.details?.featureBreakdown?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {currentDetail.details.featureBreakdown.map((feature, index) => (
                    <div key={`${feature.feature}-${index}`} className="rounded-md border bg-background/70 p-3">
                      <p className="text-sm font-semibold text-foreground">{feature.feature}</p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {feature.suitability}
                      </p>
                      <p className="mt-2 text-sm text-foreground">{feature.insight}</p>
                      {feature.recommendation ? (
                        <p className="mt-2 text-xs text-muted-foreground">Gợi ý: {feature.recommendation}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
              {currentDetail.details?.productSuggestions?.length ? (
                <div>
                  <p className="text-sm font-semibold text-foreground">Sản phẩm nên thử</p>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {currentDetail.details.productSuggestions.map((product, index) => (
                      <div key={`${product.name}-${index}`} className="rounded-md border bg-background/70 p-3 flex flex-col gap-2">
                        <p className="text-sm font-semibold text-foreground leading-tight">{product.name}</p>
                        {product.reason ? (
                          <p className="text-xs text-muted-foreground">{product.reason}</p>
                        ) : null}
                        {product.link ? (
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Xem sản phẩm
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {currentDetail.details?.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {currentDetail.details.tags.map(tag => (
                    <Badge key={tag} variant="outline">#{tag}</Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <form
                className="grid w-full gap-3"
                onSubmit={event => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  setIsSavingFeedback(true);
                  void (async () => {
                    try {
                      const result = await updateHistoryFeedbackAction(formData);
                      setFeedbackState(result);
                    } finally {
                      setIsSavingFeedback(false);
                    }
                  })();
                }}
              >
                <input type="hidden" name="historyId" value={currentDetail._id} />
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium" htmlFor="rating">
                      Đánh giá (1-5)
                    </label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min={1}
                      max={5}
                      defaultValue={currentDetail.stats?.rating ?? ''}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium" htmlFor="match">
                      Phù hợp?
                    </label>
                    <select
                      id="match"
                      name="match"
                      defaultValue={currentDetail.stats?.match?.toString() ?? ''}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Chưa rõ</option>
                      <option value="true">Hợp</option>
                      <option value="false">Chưa hợp</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium" htmlFor="note">
                    Ghi chú của bạn
                  </label>
                  <Textarea
                    id="note"
                    name="note"
                    defaultValue={currentDetail.stats?.note ?? ''}
                    placeholder="Bạn cảm thấy thế nào về kiểu tóc này?"
                  />
                </div>
                <Button type="submit" disabled={isSavingFeedback} className="justify-self-start">
                  {isSavingFeedback ? 'Đang lưu...' : 'Lưu ghi chú'}
                </Button>
              </form>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={() => {
                  if (!selectedId) return;
                  const historyId = selectedId;
                  const confirmDelete = window.confirm('Bạn có chắc muốn xoá bản ghi này khỏi nhật ký?');
                  if (!confirmDelete) return;
                  setIsDeleting(true);
                  void (async () => {
                    try {
                      const formData = new FormData();
                      formData.append('historyId', historyId);
                      const result = await deleteHistoryEntryAction(formData);
                      if (result?.error) {
                        toast({ variant: 'destructive', title: 'Không thể xoá', description: result.error });
                        return;
                      }
                      toast({ title: 'Đã xoá bản ghi', description: 'Bản ghi đã được loại khỏi nhật ký.' });
                      setSummaryList(prev => {
                        const updated = prev.filter(item => item._id !== historyId);
                        const nextId = updated[0]?._id ?? null;
                        setSelectedId(nextId);
                        return updated;
                      });
                      setDetails(prev => {
                        const next = { ...prev };
                        delete next[historyId];
                        return next;
                      });
                    } finally {
                      setIsDeleting(false);
                    }
                  })();
                }}
              >
                {isDeleting ? 'Đang xoá...' : 'Xoá bản ghi'}
              </Button>
            </CardFooter>
          </>
        ) : (
          <CardContent className="flex h-full min-h-[320px] items-center justify-center">
            <p className="text-muted-foreground">Chọn một bản ghi để xem chi tiết</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
