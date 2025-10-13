'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { getHistorySummary, getHistoryDetails, updateHistoryFeedback, hideHistoryEntry } from '@/lib/history';
import { historyFeedbackSchema } from '@/lib/validation';
import { logActivity } from '@/lib/activity';
import { recordEngagement } from '@/lib/rewards';
import UserModel from '@/models/User';

export async function getHistorySummaryAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Cần đăng nhập');
  return getHistorySummary(user.id);
}

export async function getHistoryDetailsAction(historyId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Cần đăng nhập');
  return getHistoryDetails(user.id, historyId);
}

const updateHistorySchema = historyFeedbackSchema.extend({
  historyId: z.string().length(24, 'Mã lịch sử không hợp lệ.'),
});

export async function updateHistoryFeedbackAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Bạn cần đăng nhập.' };
  }

  const parsed = updateHistorySchema.safeParse({
    historyId: formData.get('historyId'),
    note: formData.get('note'),
    rating: formData.get('rating') ? Number(formData.get('rating')) : undefined,
    match: formData.get('match') ? formData.get('match') === 'true' : undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message ?? 'Dữ liệu không hợp lệ.',
    };
  }

  const result = await updateHistoryFeedback(user.id, parsed.data.historyId, {
    note: parsed.data.note,
    rating: parsed.data.rating,
    match: parsed.data.match,
  });

  if (!result) {
    return { error: 'Không tìm thấy bản ghi lịch sử.' };
  }

  if (typeof parsed.data.match === 'boolean') {
    await UserModel.updateOne(
      { _id: user.id },
      {
        $inc: {
          'stats.totalFittingMatches': parsed.data.match ? 1 : 0,
          'stats.totalFittingMisses': parsed.data.match ? 0 : 1,
        },
      }
    );
  }

  await logActivity(user.id, 'history:feedback', 'Người dùng cập nhật ghi chú lịch sử', {
    historyId: parsed.data.historyId,
    rating: parsed.data.rating,
    match: parsed.data.match,
  });
  await recordEngagement(user.id, 'history:rate');

  return { success: 'Đã cập nhật ghi chú.' };
}

const deleteHistorySchema = z.object({
  historyId: z.string().length(24, 'Mã lịch sử không hợp lệ.'),
});

export async function deleteHistoryEntryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Bạn cần đăng nhập.' };
  }

  const parsed = deleteHistorySchema.safeParse({
    historyId: formData.get('historyId'),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Dữ liệu không hợp lệ.' };
  }

  const result = await hideHistoryEntry(user.id, parsed.data.historyId);
  if (!result.modifiedCount) {
    return { error: 'Không thể xoá bản ghi lịch sử hoặc bản ghi không tồn tại.' };
  }

  await logActivity(user.id, 'history:delete', 'Người dùng xoá bản ghi lịch sử', {
    historyId: parsed.data.historyId,
  });

  return { success: 'Đã xoá bản ghi khỏi nhật ký.' };
}
