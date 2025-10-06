'use server';

import {
  analyzeFaceAndSuggestHairstyles as analyzeFaceAndSuggestHairstylesFlow,
  type AnalyzeFaceAndSuggestHairstylesOutput,
} from '@/ai/flows/analyze-face-and-suggest-hairstyles';
import {
  generateHairstyleImage as generateHairstyleImageFlow,
  type GenerateHairstyleImageOutput,
} from '@/ai/flows/generate-hairstyle-image';
import type { Hairstyle } from '@/lib/placeholder-images';

export async function handleImageAnalysis(photoDataUri: string): Promise<AnalyzeFaceAndSuggestHairstylesOutput> {
  try {
    const result = await analyzeFaceAndSuggestHairstylesFlow({ photoDataUri });
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
    // 1. Fetch hairstyle image
    const response = await fetch(hairstyle.imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch hairstyle image from ${hairstyle.imageUrl}`);
    }
    const imageBuffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const hairstyleDataUri = `data:${mimeType};base64,${base64Image}`;

    // 2. Call AI flow
    const result = await generateHairstyleImageFlow({
      inputImageUrl: inputImageUrl,
      hairstyleImageUrl: hairstyleDataUri,
      hairstyleName: hairstyle.name,
      geminiAnalysis: analysis,
    });

    return result;
  } catch (error) {
    console.error('Error in handleImageGeneration:', error);
    throw new Error('Failed to generate hairstyle. Please try again.');
  }
}
