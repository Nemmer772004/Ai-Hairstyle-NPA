import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username.'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long.'],
      maxlength: [32, 'Username must be at most 32 characters long.'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email.'],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Please provide a valid email.'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      select: false, // Do not return password by default
    },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema>;

export default (mongoose.models.User as Model<User>) ||
  mongoose.model<User>('User', UserSchema);
