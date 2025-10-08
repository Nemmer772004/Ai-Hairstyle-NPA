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

export async function handleImageAnalysis(
  photoDataUri: string
): Promise<AnalyzeFaceAndSuggestHairstylesOutput> {
  try {
    const result = await analyzeFaceAndSuggestHairstyles({ photoDataUri });
    return result;
  } catch (error) {
    console.error('Error in handleImageAnalysis:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
}

export async function handleImageGeneration(
  inputImageUrl: string,
  hairstyle: Hairstyle,
  analysis?: string
): Promise<GenerateHairstyleImageOutput> {
  try {
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

    const hairstyleSummaryParts = [
      hairstyle.description,
      hairstyle.suitableFaces?.length
        ? `Commonly suits: ${hairstyle.suitableFaces.join(', ')} faces.`
        : null,
    ].filter(Boolean);

    // 2. Call AI flow using runFlow
    const genInput: any = {
      inputImageUrl: inputImageUrl,
      geminiAnalysis: analysis,
      hairstyleName: hairstyle.name,
    };
    if (hairstyleDataUri) genInput.hairstyleImageUrl = hairstyleDataUri;

    const result = await generateHairstyleImage(genInput);

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
        'AI quota exceeded. Please wait or upgrade your Gemini API plan before trying again.'
      );
    }
    throw new Error('Failed to analyze hairstyle compatibility. Please try again.');
  }
}
