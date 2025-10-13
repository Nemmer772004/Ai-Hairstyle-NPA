import { z } from 'zod';

export const genderEnum = [
  'female',
  'male',
  'non-binary',
  'other',
  'prefer-not-to-say',
] as const;

export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  age: z.number().int().min(13).max(120),
  gender: z.enum(genderEnum),
  avatarUrl: z
    .string()
    .url()
    .refine(value => value.startsWith('http') || value.startsWith('data:'), {
      message: 'Avatar must be a valid URL or data URI.',
    }),
  bio: z.string().trim().max(500).optional(),
  hairGoals: z
    .array(
      z.enum([
        'hydrate',
        'volume',
        'color-care',
        'repair',
        'styling',
        'anti-frizz',
        'strength',
      ])
    )
    .max(6)
    .optional(),
});

export const hairGoalLabels: Record<string, string> = {
  hydrate: 'Dưỡng ẩm',
  volume: 'Tạo phồng',
  'color-care': 'Giữ màu',
  repair: 'Phục hồi',
  styling: 'Tạo nếp',
  'anti-frizz': 'Chống xù',
  strength: 'Tăng cường độ chắc',
};

export const profileUpdateSchema = profileSchema.partial().extend({
  avatarUrl: profileSchema.shape.avatarUrl.optional(),
});

export const historyFeedbackSchema = z.object({
  note: z.string().trim().max(300).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  match: z.boolean().optional(),
});

export const settingsSchema = z.object({
  allowPublicSharing: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
});
