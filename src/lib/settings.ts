import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import UserModel from '@/models/User';
import { logActivity } from '@/lib/activity';
import HistoryEntryModel from '@/models/HistoryEntry';
import FavoriteModel from '@/models/Favorite';
import CommunityPostModel from '@/models/CommunityPost';
import UserNotificationModel from '@/models/UserNotification';

type UpdateSettingsInput = {
  allowPublicSharing?: boolean;
  emailNotifications?: boolean;
};

export async function updateUserSettings(
  userId: mongoose.Types.ObjectId | string,
  input: UpdateSettingsInput
) {
  const updates: Record<string, unknown> = {};
  if (typeof input.allowPublicSharing === 'boolean') {
    updates['settings.allowPublicSharing'] = input.allowPublicSharing;
  }
  if (typeof input.emailNotifications === 'boolean') {
    updates['settings.emailNotifications'] = input.emailNotifications;
  }

  const result = await UserModel.findOneAndUpdate(
    { _id: userId },
    { $set: updates },
    { new: true }
  ).select('settings');

  await logActivity(userId, 'settings:update', 'Người dùng đã cập nhật cài đặt', updates);
  return result;
}

export async function requestDataDeletion(userId: mongoose.Types.ObjectId | string) {
  const now = new Date();
  await UserModel.updateOne(
    { _id: userId },
    {
      $set: { 'settings.dataDeletionRequestedAt': now },
    }
  );
  await logActivity(userId, 'settings:data-deletion-request', 'Người dùng yêu cầu xóa dữ liệu');
}

export async function softDeleteUserGeneratedData(
  userId: mongoose.Types.ObjectId | string
) {
  await Promise.all([
    HistoryEntryModel.updateMany({ userId }, { $set: { isHidden: true } }),
    FavoriteModel.updateMany({ userId }, { $set: { isHidden: true } }),
    CommunityPostModel.updateMany({ userId }, { $set: { isHidden: true } }),
  ]);
  await logActivity(
    userId,
    'settings:soft-delete',
    'Dữ liệu người dùng được chuyển sang vùng chờ trước khi xóa vĩnh viễn'
  );
}

function createTwoFactorSecret() {
  return crypto.randomBytes(20).toString('hex');
}

export async function enableTwoFactorAuthentication(
  userId: mongoose.Types.ObjectId | string
) {
  const secret = createTwoFactorSecret();
  const hashed = await bcrypt.hash(secret, 10);
  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        'settings.twoFactorEnabled': true,
        'settings.twoFactorSecretHash': hashed,
      },
    }
  );
  await logActivity(userId, 'settings:enable-2fa', 'Người dùng bật xác thực hai bước');
  await UserNotificationModel.create({
    userId,
    type: 'system',
    message: 'Mã xác thực hai bước mới của bạn',
    metadata: { secret },
  });
  return secret;
}

export async function disableTwoFactorAuthentication(
  userId: mongoose.Types.ObjectId | string
) {
  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        'settings.twoFactorEnabled': false,
        'settings.twoFactorSecretHash': null,
      },
    }
  );
  await logActivity(userId, 'settings:disable-2fa', 'Người dùng tắt xác thực hai bước');
}
