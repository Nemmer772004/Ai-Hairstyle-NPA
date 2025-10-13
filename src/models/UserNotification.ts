import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const UserNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['reward', 'reminder', 'system'],
      default: 'system',
      index: true,
    },
    readAt: { type: Date },
    createdAt: { type: Date, default: Date.now, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export type UserNotification = InferSchemaType<typeof UserNotificationSchema>;

export default (mongoose.models.UserNotification as Model<UserNotification>) ||
  mongoose.model<UserNotification>('UserNotification', UserNotificationSchema);
