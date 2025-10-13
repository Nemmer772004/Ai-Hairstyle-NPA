'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { getRecommendationsForUser, invalidateRecommendations } from '@/lib/recommendations';
import UserModel from '@/models/User';
import { logActivity } from '@/lib/activity';

export async function getRecommendationsAction() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Cần đăng nhập.');
  }

  return getRecommendationsForUser(user.id);
}

const hideSchema = z.object({
  hairstyleId: z.string().min(1),
});

export async function hideRecommendationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Cần đăng nhập.' };

  const parsed = hideSchema.safeParse({
    hairstyleId: formData.get('hairstyleId'),
  });

  if (!parsed.success) {
    return { error: 'Kiểu tóc không hợp lệ.' };
  }

  await UserModel.updateOne(
    { _id: user.id },
    { $addToSet: { 'profile.skipHairstyleIds': parsed.data.hairstyleId } }
  );
  await logActivity(user.id, 'recommendation:hide', 'Người dùng ẩn một kiểu tóc được gợi ý', {
    hairstyleId: parsed.data.hairstyleId,
  });
  await invalidateRecommendations(user.id);

  return { success: 'Đã ẩn gợi ý này.' };
}
