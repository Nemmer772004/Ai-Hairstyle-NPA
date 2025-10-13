'use server';

import {
  analyzeFaceAndSuggestHairstylesAction as analyzeFaceAndSuggestHairstyles,
  type AnalyzeFaceAndSuggestHairstylesOutput,
} from '@/ai/flows/analyze-face-and-suggest-hairstyles';
import {
  generateHairstyleImageAction as generateHairstyleImage,
  type GenerateHairstyleImageOutput,
} from '@/ai/flows/generate-hairstyle-image';
import type { Hairstyle } from '@/lib/placeholder-images';
import { getCurrentUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { createHistoryEntry } from '@/lib/history';
import { extractTagsFromHairstyle, extractTagsFromText } from '@/lib/tags';
import { recordEngagement } from '@/lib/rewards';
import UserModel from '@/models/User';
import { invalidateRecommendations } from '@/lib/recommendations';

export async function handleImageAnalysis(
  photoDataUri: string
): Promise<AnalyzeFaceAndSuggestHairstylesOutput> {
  try {
    const result = await analyzeFaceAndSuggestHairstyles({ photoDataUri });
    const normalizedAnalysis = result.faceAnalysis.toUpperCase();
    if (
      normalizedAnalysis.includes('KHÔNG PHẢI KHUÔN MẶT NGƯỜI') ||
      (result.suggestedHairstyles?.length ?? 0) === 0
    ) {
      throw new Error('Không phát hiện khuôn mặt người trong ảnh. Vui lòng chọn ảnh chân dung rõ nét.');
    }
    const user = await getCurrentUser();
    if (user) {
      await logActivity(user.id, 'analysis:run', 'Người dùng yêu cầu phân tích khuôn mặt');
      await recordEngagement(user.id, 'analysis:run');
    }
    return result;
  } catch (error) {
    console.error('Error in handleImageAnalysis:', error);
    throw new Error('Không thể phân tích hình ảnh. Vui lòng thử lại.');
  }
}

export async function handleImageGeneration(
  inputImageUrl: string,
  hairstyle: Hairstyle,
  analysis?: string
): Promise<GenerateHairstyleImageOutput> {
  try {
    const user = await getCurrentUser();
    let hairstyleDataUri: string | undefined;

    // 1. Attempt to fetch hairstyle image as a data URI when available
    try {
      if (hairstyle.imageUrl.startsWith('data:')) {
        hairstyleDataUri = hairstyle.imageUrl;
      } else {
        const response = await fetch(hairstyle.imageUrl);
        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          const mimeType = response.headers.get('content-type') || 'image/jpeg';
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          hairstyleDataUri = `data:${mimeType};base64,${base64Image}`;
        } else {
          console.warn(
            `Hairstyle image returned ${response.status} from ${hairstyle.imageUrl}`
          );
        }
      }
    } catch (imageError) {
      console.warn(
        `Unable to fetch hairstyle image from ${hairstyle.imageUrl}:`,
        imageError
      );
    }

    // 2. Call AI flow using runFlow
    const genInput: any = {
      inputImageUrl: inputImageUrl,
      geminiAnalysis: analysis,
      hairstyleName: hairstyle.name,
    };
    if (hairstyleDataUri) genInput.hairstyleImageUrl = hairstyleDataUri;

    const result = await generateHairstyleImage(genInput);

    if (user) {
      const tags = new Set<string>(extractTagsFromHairstyle(hairstyle));
      extractTagsFromText(result.summary).forEach(tag => tags.add(tag));
      if (result.compatibilityLabel) {
        tags.add(result.compatibilityLabel.toLowerCase());
      }

      const history = await createHistoryEntry({
        userId: user.id,
        hairstyleId: hairstyle.id,
        hairstyleName: hairstyle.name,
        summary: result.summary,
        inputImage: inputImageUrl,
        outputImage: result.outputImageUrl,
        compatibilityLabel: result.compatibilityLabel,
        compatibilityScore: result.compatibilityScore,
        featureBreakdown: result.featureBreakdown,
        productSuggestions: result.productSuggestions,
        tags: Array.from(tags),
      });

      const isMatch = result.compatibilityLabel
        ? result.compatibilityLabel.toLowerCase().includes('good')
        : undefined;

      if (typeof isMatch === 'boolean') {
        await UserModel.updateOne(
          { _id: user.id },
          {
            $inc: {
              'stats.totalFittingMatches': isMatch ? 1 : 0,
              'stats.totalFittingMisses': isMatch ? 0 : 1,
            },
          }
        );
      }

      await logActivity(user.id, 'history:create', 'Người dùng đã tạo báo cáo kiểu tóc', {
        historyId: history._id.toString(),
        hairstyleId: hairstyle.id,
        compatibility: result.compatibilityLabel,
      });
      await recordEngagement(user.id, 'history:create');
      await invalidateRecommendations(user.id);
    }

    return result;
  } catch (error) {
    console.error('Error in handleImageGeneration:', error);
    const message =
      error instanceof Error ? error.message : String(error ?? '');
    if (
      message.includes('429') ||
      message.includes('Quota exceeded') ||
      message.includes('rate limit')
    ) {
      throw new Error(
        'Đã vượt giới hạn API của AI. Vui lòng chờ thêm hoặc nâng cấp gói Gemini trước khi thử lại.'
      );
    }
    throw new Error('Không thể đánh giá độ phù hợp của kiểu tóc. Vui lòng thử lại.');
  }
}
