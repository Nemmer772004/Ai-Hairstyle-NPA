/**
 * @fileOverview A flow to generate an image of a user with a selected hairstyle.
 *
 * - generateHairstyleImage - A function that handles the hairstyle image generation process.
 * - GenerateHairstyleImageInput - The input type for the generateHairstyleImage function.
 * - GenerateHairstyleImageOutput - The return type for the generateHairstyleImage function.
 */

import {defineFlow} from '@genkit-ai/flow';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHairstyleImageInputSchema = z.object({
  inputImageUrl: z
    .string()
    .describe(
      'A photo of a face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  hairstyleImageUrl: z
    .string()
    .describe(
      'A photo of a hairstyle, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  geminiAnalysis: z.string().optional().describe('The analysis of the face from Gemini.'),
  hairstyleName: z.string().optional().describe('The name of the hairstyle.'),
});
export type GenerateHairstyleImageInput = z.infer<typeof GenerateHairstyleImageInputSchema>;

const GenerateHairstyleImageOutputSchema = z.object({
  outputImageUrl: z.string().describe('The URL of the generated image with the hairstyle.'),
});
export type GenerateHairstyleImageOutput = z.infer<typeof GenerateHairstyleImageOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateHairstyleImagePrompt',
  input: {schema: GenerateHairstyleImageInputSchema},
  output: {schema: GenerateHairstyleImageOutputSchema},
  prompt: `You are a professional photo editor who specializes in applying hairstyles to images of people's faces.\n\nYou will take the input image of a face and overlay the hairstyle image onto the face, adjusting the size, position, and color of the hairstyle to match the face.\n\nMake sure the hairstyle looks realistic and natural.\n\nInput Face: {{media url=inputImageUrl}}\n\nHairstyle: {{media url=hairstyleImageUrl}}\n\n{% if geminiAnalysis %}Gemini Analysis: {{geminiAnalysis}}{% endif %}\n{% if hairstyleName %}Hairstyle Name: {{hairstyleName}}{% endif %}\n\nReturn the URL of the final image.\n`,
});

export const generateHairstyleImage = defineFlow(
  {
    name: 'generateHairstyleImageFlow',
    inputSchema: GenerateHairstyleImageInputSchema,
    outputSchema: GenerateHairstyleImageOutputSchema,
  },
  async input => {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        {media: {url: input.inputImageUrl}},
        {media: {url: input.hairstyleImageUrl}},
        {
          text: `You are a professional photo editor who specializes in applying hairstyles to images of people's faces.\n\nYou will take the input image of a face and overlay the hairstyle image onto the face, adjusting the size, position, and color of the hairstyle to match the face.\n\nMake sure the hairstyle looks realistic and natural.\n\n{% if input.geminiAnalysis %}Gemini Analysis: ${input.geminiAnalysis}{% endif %}\n{% if input.hairstyleName %}Hairstyle Name: ${input.hairstyleName}{% endif %}`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const media = Array.isArray(response.media)
      ? response.media.find(item => item?.url)
      : response.media;

    if (!media?.url) {
      throw new Error('Failed to generate hairstyle image.');
    }

    return {outputImageUrl: media.url};
  }
);
