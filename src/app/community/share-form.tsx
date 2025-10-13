'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { shareCommunityAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

type ShareFormProps = {
  allowPublicSharing: boolean;
};

const initialState: { error?: string; success?: string } = {};

export function ShareForm({ allowPublicSharing }: ShareFormProps) {
  const [state, setState] = useState(initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, startSubmitting] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({ variant: 'destructive', title: 'Không thể chia sẻ', description: state.error });
    } else if (state?.success) {
      toast({ title: 'Đã chia sẻ', description: state.success });
      setPreview(null);
      setImageDataUri(null);
      setConsent(false);
    }
  }, [state, toast]);

  if (!allowPublicSharing) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground space-y-3">
        <p>
          Bạn đã tắt quyền chia sẻ công khai trong mục Cài đặt. Bật lại tuỳ chọn{" "}
          <strong>“Cho phép chia sẻ công khai kết quả”</strong> để đăng bài.
        </p>
        <Button asChild size="sm" variant="outline">
          <a href="/settings">Mở trang Cài đặt</a>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={event => {
        event.preventDefault();
        if (!imageDataUri) {
          toast({ variant: 'destructive', title: 'Thiếu ảnh', description: 'Vui lòng chọn ảnh trước khi chia sẻ.' });
          return;
        }
        const formData = new FormData(event.currentTarget);
        startSubmitting(async () => {
          const result = await shareCommunityAction(formData);
          setState(result);
        });
      }}
    >
      <input type="hidden" name="imageDataUri" value={imageDataUri ?? ''} />
      <input type="hidden" name="consent" value={consent ? 'true' : 'false'} />
      <div className="grid gap-2">
        <Label htmlFor="imageUpload">Ảnh muốn chia sẻ</Label>
        <Input
          id="imageUpload"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          disabled={isSubmitting}
          onChange={event => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const data = reader.result as string;
              setPreview(data);
              setImageDataUri(data);
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>
      {preview ? (
        <div className="relative h-60 w-full overflow-hidden rounded-lg border">
          <Image src={preview} alt="Ảnh chia sẻ" fill className="object-cover" />
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Hãy kể về trải nghiệm với kiểu tóc này..."
          maxLength={300}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="consent" checked={consent} onCheckedChange={value => setConsent(value === true)} />
        <Label htmlFor="consent" className="text-sm text-muted-foreground">
          Tôi đồng ý chia sẻ công khai ảnh này với cộng đồng.
        </Label>
      </div>
      <Button type="submit" disabled={isSubmitting || !preview || !consent} className="justify-self-start">
        {isSubmitting ? 'Đang đăng...' : 'Chia sẻ với cộng đồng'}
      </Button>
    </form>
  );
}
