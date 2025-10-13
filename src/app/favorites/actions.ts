'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { addFavorite, hideFavorite, listFavorites } from '@/lib/favorites';
import { hairstyles } from '@/lib/placeholder-images';
import { logActivity } from '@/lib/activity';
import { recordEngagement } from '@/lib/rewards';

const favoriteSchema = z.object({
  hairstyleId: z.string().min(1),
});

export async function addFavoriteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Bạn cần đăng nhập.' };

  const parsed = favoriteSchema.safeParse({
    hairstyleId: formData.get('hairstyleId'),
  });

  if (!parsed.success) {
    return { error: 'Kiểu tóc không hợp lệ.' };
  }

  const hairstyle = hairstyles.find(item => item.id === parsed.data.hairstyleId);
  if (!hairstyle) {
    return { error: 'Không tìm thấy kiểu tóc.' };
  }

  await addFavorite(user.id, hairstyle);
  await logActivity(user.id, 'favorite:add', 'Người dùng thêm kiểu tóc vào danh sách yêu thích', {
    hairstyleId: hairstyle.id,
  });
  await recordEngagement(user.id, 'favorite:create');

  return { success: 'Đã thêm vào danh sách yêu thích.' };
}

export async function removeFavoriteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Bạn cần đăng nhập.' };

  const parsed = favoriteSchema.safeParse({
    hairstyleId: formData.get('hairstyleId'),
  });

  if (!parsed.success) {
    return { error: 'Kiểu tóc không hợp lệ.' };
  }

  await hideFavorite(user.id, parsed.data.hairstyleId);
  await logActivity(user.id, 'favorite:hide', 'Người dùng ẩn kiểu tóc khỏi danh sách yêu thích', {
    hairstyleId: parsed.data.hairstyleId,
  });

  return { success: 'Đã ẩn khỏi danh sách yêu thích.' };
}

export async function listFavoritesAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Cần đăng nhập');
  return listFavorites(user.id);
}

export async function removeFavoriteSilentAction(formData: FormData): Promise<void> {
  await removeFavoriteAction(formData);
}
