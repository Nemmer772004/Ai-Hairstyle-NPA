'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import {
  shareCommunityPost,
  listPublicPosts,
  reactToPost,
  addCommentToPost,
  listCommentsForPost,
} from '@/lib/community';
import UserModel from '@/models/User';
import { logActivity } from '@/lib/activity';
import { recordEngagement } from '@/lib/rewards';

const shareSchema = z.object({
  imageDataUri: z.string().min(20),
  description: z.string().max(300).optional(),
  hairstyleId: z.string().optional(),
  consent: z.string().transform(value => value === 'on' || value === 'true'),
});

export async function shareCommunityAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Bạn cần đăng nhập.' };

  const parsed = shareSchema.safeParse({
    imageDataUri: formData.get('imageDataUri'),
    description: formData.get('description'),
    hairstyleId: formData.get('hairstyleId') || undefined,
    consent: formData.get('consent') ?? 'false',
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Dữ liệu không hợp lệ.' };
  }

  if (!parsed.data.consent) {
    return { error: 'Bạn cần đồng ý chia sẻ công khai trước khi đăng.' };
  }

  const userRecord = await UserModel.findById(user.id).select('settings').lean();
  if (!userRecord?.settings?.allowPublicSharing) {
    return { error: 'Bạn đã tắt quyền chia sẻ công khai trong cài đặt.' };
  }

  const post = await shareCommunityPost({
    userId: user.id,
    imageDataUri: parsed.data.imageDataUri,
    description: parsed.data.description,
    hairstyleId: parsed.data.hairstyleId,
    isPublic: true,
  });

  await logActivity(user.id, 'community:share', 'Người dùng đăng bài lên cộng đồng', {
    postId: post._id.toString(),
  });
  await recordEngagement(user.id, 'community:share');

  return { success: 'Đã chia sẻ bài đăng thành công.' };
}

const reactSchema = z.object({
  postId: z.string().length(24),
  reaction: z.string().default('like'),
});

export async function reactCommunityAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Bạn cần đăng nhập.' };

  const parsed = reactSchema.safeParse({
    postId: formData.get('postId'),
    reaction: formData.get('reaction') ?? 'like',
  });

  if (!parsed.success) {
    return { error: 'Bài đăng không hợp lệ.' };
  }

  await reactToPost(parsed.data.postId, user.id, parsed.data.reaction);
  await logActivity(user.id, 'community:react', 'Người dùng thả cảm xúc cho bài viết cộng đồng', {
    postId: parsed.data.postId,
    reaction: parsed.data.reaction,
  });

  return { success: 'Đã ghi nhận tương tác.' };
}

export async function getCommunityFeedAction() {
  return listPublicPosts();
}

export async function reactCommunitySilentAction(formData: FormData): Promise<void> {
  await reactCommunityAction(formData);
}

const commentSchema = z.object({
  postId: z.string().length(24),
  content: z.string().trim().min(1, 'Nội dung bình luận không được để trống.').max(500),
});

type CommentState = {
  error?: string;
  success?: string;
  comment?: {
    _id: string;
    authorName: string;
    content: string;
    createdAt: string;
  };
};

export async function addCommentAction(
  _prevState: CommentState,
  formData: FormData
): Promise<CommentState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Bạn cần đăng nhập.' };

  const parsed = commentSchema.safeParse({
    postId: formData.get('postId'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Nội dung không hợp lệ.' };
  }

  const comment = await addCommentToPost({
    postId: parsed.data.postId,
    userId: user.id,
    authorName: user.username,
    content: parsed.data.content,
  });

  await logActivity(user.id, 'community:comment', 'Người dùng bình luận bài viết cộng đồng', {
    postId: parsed.data.postId,
  });
  await recordEngagement(user.id, 'community:comment', 4, { postId: parsed.data.postId });

  return {
    success: 'Đã gửi bình luận.',
    comment: {
      _id: comment._id.toString(),
      authorName: comment.authorName,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    },
  };
}

export async function getCommentsForPostAction(postId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Cần đăng nhập');
  const comments = await listCommentsForPost(postId, 50);
  return comments.map(comment => ({
    _id: comment._id.toString(),
    authorName: comment.authorName,
    content: comment.content,
    createdAt: comment.createdAt?.toISOString() ?? new Date().toISOString(),
  }));
}
