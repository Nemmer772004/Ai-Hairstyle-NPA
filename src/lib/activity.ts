import mongoose from 'mongoose';
import ActivityLogModel from '@/models/ActivityLog';

export async function logActivity(
  userId: mongoose.Types.ObjectId | string,
  action: string,
  description?: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    await ActivityLogModel.create({
      userId,
      action,
      description,
      metadata,
    });
  } catch (error) {
    console.error('logActivity failed:', error);
  }
}
