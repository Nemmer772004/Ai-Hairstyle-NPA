import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const CommunityCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type CommunityComment = InferSchemaType<typeof CommunityCommentSchema>;

export default (mongoose.models.CommunityComment as Model<CommunityComment>) ||
  mongoose.model<CommunityComment>('CommunityComment', CommunityCommentSchema);
