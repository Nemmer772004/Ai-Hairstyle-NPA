'use client';

import { useEffect, useMemo, useState } from 'react';
import { useActionState } from 'react';
import { addCommentAction } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type Comment = {
  _id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

type CommentSectionProps = {
  postId: string;
  initialComments: Comment[];
};

type CommentActionState = {
  error?: string;
  success?: string;
  comment?: Comment;
};

const initialState: CommentActionState = {};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN');
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState('');
  const [state, formAction, isPending] = useActionState(addCommentAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    if (state?.error) {
      toast({ variant: 'destructive', title: 'Không thể bình luận', description: state.error });
    } else if (state?.success && state.comment) {
      setComments(prev => [state.comment!, ...prev]);
      setContent('');
    }
  }, [state, toast]);

  const orderedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [comments]
  );

  return (
    <div className="w-full rounded-lg border border-border/80 bg-background/80 p-4 shadow-sm">
      <h3 className="text-base font-headline mb-3">Bình luận</h3>
      <form
        action={formData => {
          const trimmed = formData.get('content')?.toString().trim();
          if (!trimmed) {
            toast({ variant: 'destructive', title: 'Thiếu nội dung', description: 'Vui lòng nhập nội dung bình luận.' });
            return;
          }
          formData.set('content', trimmed);
          formAction(formData);
        }}
        className="space-y-2"
      >
        <input type="hidden" name="postId" value={postId} />
        <Textarea
          name="content"
          value={content}
          onChange={event => setContent(event.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về kiểu tóc này..."
          rows={3}
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{content.length}/500</span>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? 'Đang gửi...' : 'Gửi bình luận'}
          </Button>
        </div>
      </form>

      <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
        {orderedComments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        ) : (
          orderedComments.map(comment => (
            <div key={comment._id} className="rounded-md border bg-background/70 p-3 text-sm">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold text-foreground">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-foreground whitespace-pre-wrap break-words">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
