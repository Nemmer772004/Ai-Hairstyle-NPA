import mongoose from 'mongoose';
import RecommendationCacheModel from '@/models/RecommendationCache';
import FavoriteModel from '@/models/Favorite';
import HistoryEntryModel from '@/models/HistoryEntry';
import UserModel from '@/models/User';
import { hairstyles } from '@/lib/placeholder-images';
import { extractTagsFromHairstyle, extractTagsFromText } from '@/lib/tags';
import { getCache, setCache, deleteCache } from '@/lib/cache';

const CACHE_TTL_MS = 1000 * 60 * 60 * 3; // 3 hours

type Recommendation = {
  hairstyleId: string;
  hairstyleName: string;
  category: string;
  score: number;
  tags: string[];
};

function buildTagScoreMap(tags: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const tag of tags) {
    map.set(tag, (map.get(tag) ?? 0) + 1);
  }
  return map;
}

function computeScore(
  hairstyleTags: string[],
  tagWeights: Map<string, number>
): number {
  let score = 0;
  for (const tag of hairstyleTags) {
    score += (tagWeights.get(tag) ?? 0) * 2;
  }
  return score;
}

export async function getRecommendationsForUser(
  userId: mongoose.Types.ObjectId | string
): Promise<Recommendation[]> {
  const cacheKey = `recommendations:${userId}`;
  const cached = getCache<Recommendation[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const existing = await RecommendationCacheModel.findOne({ userId }).lean();
  if (existing && existing.expiresAt.getTime() > Date.now()) {
    setCache(cacheKey, existing.recommendations as Recommendation[], CACHE_TTL_MS);
    return existing.recommendations as Recommendation[];
  }

  const user = await UserModel.findById(userId)
    .select('profile skipHairstyleIds settings allowPublicSharing stats')
    .lean();
  if (!user) return [];

  const favorites = await FavoriteModel.find({ userId, isHidden: false })
    .select('tags hairstyleId hairstyleName category')
    .lean();

  const histories = await HistoryEntryModel.find({ userId, isHidden: false })
    .select('details.tags stats match summary hairstyleId hairstyleName')
    .lean();

  const tagSource: string[] = [];

  if (user.profile) {
    tagSource.push(...extractTagsFromText(user.profile.bio ?? ''));
  }
  for (const favorite of favorites) {
    if (favorite.tags) tagSource.push(...favorite.tags);
  }
  for (const history of histories) {
    if (history.details?.tags) tagSource.push(...history.details.tags);
    if (history.summary) tagSource.push(...extractTagsFromText(history.summary));
    if (history.stats?.match) tagSource.push('match');
  }

  const tagWeights = buildTagScoreMap(tagSource);

  const skipList = new Set([
    ...(user.profile?.skipHairstyleIds ?? []),
    ...(user.suppressedHairstyleIds ?? []),
  ]);

  const recommendations = hairstyles
    .filter(style => !skipList.has(style.id))
    .map(style => {
      const tags = extractTagsFromHairstyle(style);
      const score = computeScore(tags, tagWeights);
      return {
        hairstyleId: style.id,
        hairstyleName: style.name,
        category: style.category,
        score,
        tags,
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  await RecommendationCacheModel.findOneAndUpdate(
    { userId },
    { recommendations, expiresAt },
    { upsert: true, new: true }
  );
  setCache(cacheKey, recommendations, CACHE_TTL_MS);
  return recommendations;
}

export async function invalidateRecommendations(userId: string | mongoose.Types.ObjectId) {
  const cacheKey = `recommendations:${userId}`;
  deleteCache(cacheKey);
  await RecommendationCacheModel.deleteOne({ userId });
}
