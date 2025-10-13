'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import UserModel from '@/models/User';
import { logActivity } from '@/lib/activity';
import { invalidateUserProfileCache, getCachedUserProfile } from '@/lib/profile';
import { profileUpdateSchema } from '@/lib/validation';
import { compressDataUri } from '@/lib/image';
import { recordEngagement } from '@/lib/rewards';

export type ProfileActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export async function getProfileAction() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Bạn cần đăng nhập để xem hồ sơ.');
  }

  return getCachedUserProfile(user.id);
}

const profileUpdateFormSchema = profileUpdateSchema.extend({
  avatarFile: z
    .any()
    .optional()
    .refine(
      value => !value || (value instanceof File && value.size <= 3 * 1024 * 1024),
      'Ảnh đại diện phải nhỏ hơn 3MB.'
    )
    .refine(
      value =>
        !value ||
        (value instanceof File &&
          ['image/png', 'image/jpeg', 'image/webp'].includes(value.type)),
      'Định dạng ảnh không hợp lệ.'
    ),
});

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Bạn cần đăng nhập.' };
  }

  const raw = {
    displayName: formData.get('displayName'),
    age: formData.get('age') ? Number(formData.get('age')) : undefined,
    gender: formData.get('gender'),
    avatarUrl: formData.get('avatarUrl'),
    bio: formData.get('bio'),
    avatarFile: formData.get('avatarFile'),
    hairGoals: formData.getAll('hairGoals')?.map(String).filter(Boolean),
  };

  const parsed = profileUpdateFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      error: 'Vui lòng kiểm tra thông tin.',
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors)
          .filter(([, value]) => value?.length)
          .map(([key, value]) => [key, value![0]])
      ),
    };
  }

  const data = parsed.data;

  let finalAvatar = data.avatarUrl;
  if (data.avatarFile instanceof File) {
    const arrayBuffer = await data.avatarFile.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer);
    const base64 = bytes.toString('base64');
    const mime = data.avatarFile.type || 'image/png';
    finalAvatar = await compressDataUri(`data:${mime};base64,${base64}`, 256);
  }

  try {
    await UserModel.updateOne(
      { _id: user.id },
      {
        $set: {
          'profile.displayName': data.displayName,
          'profile.age': data.age,
          'profile.gender': data.gender,
          'profile.avatarUrl': finalAvatar,
          'profile.bio': data.bio,
          'profile.hairGoals': data.hairGoals ?? [],
        },
      }
    );
    await logActivity(user.id, 'profile:update', 'Người dùng cập nhật hồ sơ cá nhân', {
      displayName: data.displayName,
      age: data.age,
      gender: data.gender,
      hairGoals: data.hairGoals,
    });
    await recordEngagement(user.id, 'profile:update');
    invalidateUserProfileCache(user.id);
    revalidatePath('/profile');
    return {
      success: 'Cập nhật hồ sơ thành công.',
    };
  } catch (error) {
    console.error('updateProfileAction failed:', error);
    return { error: 'Không thể cập nhật hồ sơ lúc này. Vui lòng thử lại sau.' };
  }
}
