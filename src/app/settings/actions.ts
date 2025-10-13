'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import {
  updateUserSettings,
  requestDataDeletion,
  enableTwoFactorAuthentication,
  disableTwoFactorAuthentication,
  softDeleteUserGeneratedData,
} from '@/lib/settings';
import { settingsSchema } from '@/lib/validation';
import { logActivity } from '@/lib/activity';

export async function updateSettingsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Cần đăng nhập' };

  const parsed = settingsSchema.safeParse({
    allowPublicSharing: formData.get('allowPublicSharing') === 'on',
    emailNotifications: formData.get('emailNotifications') === 'on',
  });

  if (!parsed.success) {
    return { error: 'Dữ liệu không hợp lệ.' };
  }

  const result = await updateUserSettings(user.id, parsed.data);
  return { success: 'Đã cập nhật cài đặt', settings: result?.settings };
}

export async function requestDataDeletionAction() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Cần đăng nhập' };
  await requestDataDeletion(user.id);
  await softDeleteUserGeneratedData(user.id);
  return { success: 'Dữ liệu đã được đánh dấu xoá. Hệ thống sẽ gỡ vĩnh viễn sau 30 ngày.' };
}

const toggleSchema = z.object({
  enable: z.boolean(),
});

export async function toggleTwoFactorAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Cần đăng nhập' };

  const parsed = toggleSchema.safeParse({
    enable: formData.get('enable') === 'true' || formData.get('enable') === 'on',
  });

  if (!parsed.success) {
    return { error: 'Dữ liệu không hợp lệ' };
  }

  if (parsed.data.enable) {
    const secret = await enableTwoFactorAuthentication(user.id);
    await logActivity(user.id, 'settings:2fa', 'Hệ thống tạo mã xác thực hai bước mới');
    return {
      success: 'Đã bật xác thực hai bước.',
      secret,
    };
  }

  await disableTwoFactorAuthentication(user.id);
  return { success: 'Đã tắt xác thực hai bước.' };
}

export async function updateSettingsSilentAction(formData: FormData): Promise<void> {
  await updateSettingsAction(formData);
}

export async function toggleTwoFactorSilentAction(formData: FormData): Promise<void> {
  await toggleTwoFactorAction(formData);
}

export async function requestDataDeletionSilentAction(_formData?: FormData): Promise<void> {
  await requestDataDeletionAction();
}
