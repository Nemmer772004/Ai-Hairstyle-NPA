'use server';

/**
 * @fileOverview A flow to generate an image of a user with a selected hairstyle.
 *
 * - generateHairstyleImage - A function that handles the hairstyle image generation process.
 * - GenerateHairstyleImageInput - The input type for the generateHairstyleImage function.
 * - GenerateHairstyleImageOutput - The return type for the generateHairstyleImage function.
 */

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

export async function generateHairstyleImage(
  input: GenerateHairstyleImageInput
): Promise<GenerateHairstyleImageOutput> {
  return generateHairstyleImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHairstyleImagePrompt',
  input: {schema: GenerateHairstyleImageInputSchema},
  output: {schema: GenerateHairstyleImageOutputSchema},
  prompt: `You are a professional photo editor who specializes in applying hairstyles to images of people's faces.

You will take the input image of a face and overlay the hairstyle image onto the face, adjusting the size, position, and color of the hairstyle to match the face.

Make sure the hairstyle looks realistic and natural.

Input Face: {{media url=inputImageUrl}}

Hairstyle: {{media url=hairstyleImageUrl}}

{% if geminiAnalysis %}Gemini Analysis: {{geminiAnalysis}}{% endif %}
{% if hairstyleName %}Hairstyle Name: {{hairstyleName}}{% endif %}

Return the URL of the final image.
`,
});

const generateHairstyleImageFlow = ai.defineFlow(
  {
    name: 'generateHairstyleImageFlow',
    inputSchema: GenerateHairstyleImageInputSchema,
    outputSchema: GenerateHairstyleImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
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

    return {outputImageUrl: media.url!};
  }
);
