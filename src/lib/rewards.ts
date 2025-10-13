import mongoose from 'mongoose';
import EngagementEventModel from '@/models/EngagementEvent';
import UserModel from '@/models/User';
import UserNotificationModel from '@/models/UserNotification';

const ACTION_POINTS: Record<string, number> = {
  'analysis:run': 2,
  'history:create': 10,
  'favorite:create': 5,
  'favorite:remove': 0,
  'community:share': 15,
  'community:comment': 4,
  'history:rate': 4,
  'profile:update': 3,
  'product:recommend': 4,
  'product:save': 6,
  'product:skip': 1,
  'product:interest': 2,
};

const BADGE_THRESHOLDS = [
  { key: 'bronze-explorer', points: 100 },
  { key: 'silver-stylist', points: 250 },
  { key: 'gold-trendsetter', points: 500 },
];

async function awardBadges(userId: mongoose.Types.ObjectId) {
  const user = await UserModel.findById(userId)
    .select('stats.badges stats.rewardPoints')
    .lean();
  if (!user) return;

  const badges = new Set(user.stats?.badges ?? []);
  const points = user.stats?.rewardPoints ?? 0;

  const newlyAwarded: string[] = [];
  for (const badge of BADGE_THRESHOLDS) {
    if (points >= badge.points && !badges.has(badge.key)) {
      badges.add(badge.key);
      newlyAwarded.push(badge.key);
    }
  }

  if (!newlyAwarded.length) return;

  await UserModel.updateOne(
    { _id: userId },
    {
      $set: { 'stats.badges': Array.from(badges) },
    }
  );

  await UserNotificationModel.create({
    userId,
    type: 'reward',
    message: `Bạn vừa nhận được huy hiệu mới: ${newlyAwarded.join(', ')}`,
    metadata: { badges: newlyAwarded },
  });
}

export async function recordEngagement(
  userId: mongoose.Types.ObjectId | string,
  action: string,
  extraPoints = 0,
  metadata: Record<string, unknown> = {}
) {
  const userObjectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  const basePoints = ACTION_POINTS[action] ?? 0;
  const totalPoints = Math.max(0, basePoints + extraPoints);

  await EngagementEventModel.create({
    userId: userObjectId,
    action,
    points: totalPoints,
    metadata,
  });

  await UserModel.updateOne(
    { _id: userObjectId },
    {
      $inc: { 'stats.rewardPoints': totalPoints },
      $set: { 'stats.lastEngagementCheckAt': new Date() },
    }
  );

  if (totalPoints > 0) {
    await awardBadges(userObjectId);
  }
}

export async function scheduleRetentionChecks() {
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14); // 14 days
  const inactiveUsers = await UserModel.find({
    updatedAt: { $lt: cutoff },
  })
    .select('_id username settings.emailNotifications')
    .lean();

  for (const user of inactiveUsers) {
    await UserNotificationModel.create({
      userId: user._id,
      type: 'reminder',
      message:
        'Chúng tôi nhớ bạn! Quay lại thử phong cách tóc mới và nhận điểm thưởng nhé.',
    });
  }
}
