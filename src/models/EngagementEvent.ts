import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const EngagementEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: { type: String, required: true },
    points: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export type EngagementEvent = InferSchemaType<typeof EngagementEventSchema>;

export default (mongoose.models.EngagementEvent as Model<EngagementEvent>) ||
  mongoose.model<EngagementEvent>('EngagementEvent', EngagementEventSchema);
