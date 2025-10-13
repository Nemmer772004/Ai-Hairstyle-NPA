import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const ReactionSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'like' },
    userIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  },
  { _id: false }
);

const CommunityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isPublic: { type: Boolean, default: false, index: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    description: { type: String, trim: true, maxlength: 400 },
    hairstyleId: { type: String },
    tags: { type: [String], default: [] },
    reactions: { type: [ReactionSchema], default: [] },
    reactionsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    interactionHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },
    createdAt: { type: Date, default: Date.now, index: true },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type CommunityPost = InferSchemaType<typeof CommunityPostSchema>;

export default (mongoose.models.CommunityPost as Model<CommunityPost>) ||
  mongoose.model<CommunityPost>('CommunityPost', CommunityPostSchema);
