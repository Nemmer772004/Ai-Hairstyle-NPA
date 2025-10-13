import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const UserProfileSchema = new mongoose.Schema(
  {
    displayName: { type: String, trim: true },
    age: { type: Number, min: 13, max: 120 },
    gender: {
      type: String,
      enum: ['female', 'male', 'non-binary', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say',
    },
    avatarUrl: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
    skipHairstyleIds: { type: [String], default: [] },
    skipProductIds: { type: [String], default: [] },
    hairGoals: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const UserStatsSchema = new mongoose.Schema(
  {
    totalFittingMatches: { type: Number, default: 0 },
    totalFittingMisses: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    lastEngagementCheckAt: { type: Date },
    totalProductSaves: { type: Number, default: 0 },
    totalProductSkips: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserSettingsSchema = new mongoose.Schema(
  {
    allowPublicSharing: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecretHash: { type: String, select: false },
    dataDeletionRequestedAt: { type: Date },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Vui lòng nhập tên người dùng.'],
      unique: true,
      trim: true,
      minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự.'],
      maxlength: [32, 'Tên người dùng tối đa 32 ký tự.'],
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email.'],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Vui lòng nhập email hợp lệ.'],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu.'],
      select: false, // Do not return password by default
    },
    profile: { type: UserProfileSchema, default: () => ({}) },
    stats: { type: UserStatsSchema, default: () => ({}) },
    settings: { type: UserSettingsSchema, default: () => ({}) },
    suppressedHairstyleIds: { type: [String], default: [] },
    suppressedProductIds: { type: [String], default: [] },
    lastRecommendationCachedAt: { type: Date },
  },
  { timestamps: true }
);

export type UserProfile = InferSchemaType<typeof UserProfileSchema>;
export type UserStats = InferSchemaType<typeof UserStatsSchema>;
export type UserSettings = InferSchemaType<typeof UserSettingsSchema>;
export type User = InferSchemaType<typeof UserSchema>;

export default (mongoose.models.User as Model<User>) ||
  mongoose.model<User>('User', UserSchema);
