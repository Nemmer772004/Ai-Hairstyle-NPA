import mongoose from 'mongoose';
import UserModel, { type User } from '@/models/User';
import { getCache, setCache, deleteCache } from '@/lib/cache';

const PROFILE_TTL_MS = 1000 * 60 * 5; // 5 minutes

const cacheKey = (userId: mongoose.Types.ObjectId | string) =>
  `user-profile:${userId.toString()}`;

export async function getCachedUserProfile(userId: mongoose.Types.ObjectId | string) {
  const key = cacheKey(userId);
  const cached = getCache<Pick<User, 'username' | 'profile' | 'settings' | 'stats'>>(
    key
  );
  if (cached) {
    return cached;
  }

  const user = await UserModel.findById(userId)
    .select('username email profile settings stats')
    .lean();
  if (!user) {
    return null;
  }

  setCache(key, user, PROFILE_TTL_MS);
  return user;
}

export function invalidateUserProfileCache(userId: mongoose.Types.ObjectId | string) {
  deleteCache(cacheKey(userId));
}
