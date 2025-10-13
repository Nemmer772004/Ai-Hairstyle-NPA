import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const FavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hairstyleId: { type: String, required: true },
    hairstyleName: { type: String },
    category: { type: String },
    tags: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    isHidden: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

FavoriteSchema.index({ userId: 1, hairstyleId: 1 }, { unique: true });

export type Favorite = InferSchemaType<typeof FavoriteSchema>;

export default (mongoose.models.Favorite as Model<Favorite>) ||
  mongoose.model<Favorite>('Favorite', FavoriteSchema);
