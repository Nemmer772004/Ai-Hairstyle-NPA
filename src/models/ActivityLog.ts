import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    action: { type: String, required: true, index: true },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type ActivityLog = InferSchemaType<typeof ActivityLogSchema>;

export default (mongoose.models.ActivityLog as Model<ActivityLog>) ||
  mongoose.model<ActivityLog>('ActivityLog', ActivityLogSchema);
