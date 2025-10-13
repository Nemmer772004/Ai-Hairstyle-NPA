import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const RecommendationCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    recommendations: {
      type: [
        new mongoose.Schema(
          {
            hairstyleId: String,
            hairstyleName: String,
            category: String,
            score: Number,
            tags: [String],
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export type RecommendationCache = InferSchemaType<typeof RecommendationCacheSchema>;

export default (mongoose.models.RecommendationCache as Model<RecommendationCache>) ||
  mongoose.model<RecommendationCache>('RecommendationCache', RecommendationCacheSchema);
