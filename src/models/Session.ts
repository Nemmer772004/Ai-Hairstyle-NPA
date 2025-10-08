import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // let MongoDB automatically prune expired sessions
    },
  },
  { timestamps: true }
);

export type Session = InferSchemaType<typeof SessionSchema>;

export default (mongoose.models.Session as Model<Session>) ||
  mongoose.model<Session>('Session', SessionSchema);
