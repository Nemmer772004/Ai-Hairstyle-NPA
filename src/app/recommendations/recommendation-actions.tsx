'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { addFavoriteAction } from '@/app/favorites/actions';
import { hideRecommendationAction } from './actions';
import { useToast } from '@/hooks/use-toast';

type RecommendationActionsProps = {
  hairstyleId: string;
  hairstyleName: string;
};

export function RecommendationActions({ hairstyleId, hairstyleName }: RecommendationActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        className="flex-1"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const formData = new FormData();
            formData.append('hairstyleId', hairstyleId);
            const result = await addFavoriteAction(formData);
            if (result?.error) {
              toast({ variant: 'destructive', title: 'Không thể lưu', description: result.error });
            } else {
              toast({ title: 'Đã lưu yêu thích', description: `${hairstyleName} đã được thêm.` });
            }
          })
        }
      >
        Yêu thích
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const formData = new FormData();
            formData.append('hairstyleId', hairstyleId);
            const result = await hideRecommendationAction(formData);
            if (result?.error) {
              toast({ variant: 'destructive', title: 'Không thể ẩn', description: result.error });
            } else {
              toast({ title: 'Đã ẩn gợi ý', description: `${hairstyleName} sẽ không xuất hiện nữa.` });
            }
          })
        }
      >
        Ẩn
      </Button>
    </div>
  );
}
