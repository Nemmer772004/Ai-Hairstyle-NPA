import mongoose from 'mongoose';
import FavoriteModel from '@/models/Favorite';
import { extractTagsFromHairstyle } from '@/lib/tags';
import type { Hairstyle } from '@/lib/placeholder-images';

export async function addFavorite(
  userId: mongoose.Types.ObjectId | string,
  hairstyle: Hairstyle
) {
  try {
    const tags = extractTagsFromHairstyle(hairstyle);
    return await FavoriteModel.findOneAndUpdate(
      { userId, hairstyleId: hairstyle.id },
      {
        $setOnInsert: {
          hairstyleName: hairstyle.name,
          category: hairstyle.category,
        },
        $set: { isHidden: false, tags },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('addFavorite failed', error);
    throw error;
  }
}

export async function hideFavorite(
  userId: mongoose.Types.ObjectId | string,
  hairstyleId: string
) {
  return FavoriteModel.findOneAndUpdate(
    { userId, hairstyleId },
    {
      $set: { isHidden: true },
    },
    { new: true }
  );
}

export async function listFavorites(
  userId: mongoose.Types.ObjectId | string,
  { includeHidden = false }: { includeHidden?: boolean } = {}
) {
  const query: Record<string, unknown> = { userId };
  if (!includeHidden) {
    query.isHidden = false;
  }
  return FavoriteModel.find(query)
    .sort({ createdAt: -1 })
    .lean();
}
