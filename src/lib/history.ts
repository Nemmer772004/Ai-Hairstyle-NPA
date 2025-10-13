import mongoose from 'mongoose';
import HistoryEntryModel from '@/models/HistoryEntry';
import { extractTagsFromText } from '@/lib/tags';

type ProductSuggestion = {
  name: string;
  link: string;
  reason?: string;
};

type CreateHistoryInput = {
  userId: mongoose.Types.ObjectId | string;
  hairstyleId?: string;
  hairstyleName?: string;
  summary?: string;
  inputImage?: string;
  outputImage?: string;
  compatibilityLabel?: string;
  compatibilityScore?: number;
  featureBreakdown?: unknown[];
  productSuggestions?: ProductSuggestion[];
  tags?: string[];
};

export async function createHistoryEntry(input: CreateHistoryInput) {
  const tags = new Set<string>();
  if (input.tags) {
    input.tags.forEach(tag => tags.add(tag));
  }
  if (input.summary) {
    extractTagsFromText(input.summary).forEach(tag => tags.add(tag));
  }

  return HistoryEntryModel.create({
    userId: input.userId,
    hairstyleId: input.hairstyleId,
    hairstyleName: input.hairstyleName,
    summary: input.summary,
    details: {
      inputImage: input.inputImage,
      outputImage: input.outputImage,
      analysisSummary: input.summary,
      compatibilityLabel: input.compatibilityLabel,
      compatibilityScore: input.compatibilityScore,
      featureBreakdown: input.featureBreakdown ?? [],
      productSuggestions: input.productSuggestions ?? [],
      tags: Array.from(tags),
    },
  });
}

export async function updateHistoryFeedback(
  userId: mongoose.Types.ObjectId | string,
  historyId: string,
  feedback: { note?: string; rating?: number; match?: boolean }
) {
  return HistoryEntryModel.findOneAndUpdate(
    { _id: historyId, userId },
    {
      $set: {
        'stats.note': feedback.note,
        'stats.rating': feedback.rating,
        'stats.match': feedback.match,
      },
    },
    { new: true }
  );
}

export async function getHistorySummary(
  userId: mongoose.Types.ObjectId | string,
  limit = 20
) {
  return HistoryEntryModel.find({ userId, isHidden: false })
    .select('summary createdAt hairstyleName details.compatibilityLabel details.productSuggestions stats.rating')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getHistoryDetails(
  userId: mongoose.Types.ObjectId | string,
  historyId: string
) {
  return HistoryEntryModel.findOne({ _id: historyId, userId, isHidden: false }).lean();
}

export async function hideHistoryEntry(
  userId: mongoose.Types.ObjectId | string,
  historyId: string
) {
  return HistoryEntryModel.updateOne(
    { _id: historyId, userId },
    { $set: { isHidden: true } }
  );
}
