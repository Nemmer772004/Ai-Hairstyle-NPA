/**
 * @fileOverview An AI agent that analyzes a face in a photo and suggests suitable hairstyles.
 *
 * - analyzeFaceAndSuggestHairstyles - A function that handles the face analysis and hairstyle suggestion process.
 * - AnalyzeFaceAndSuggestHairstylesInput - The input type for the analyzeFaceAndSuggestHairstyles function.
 * - AnalyzeFaceAndSuggestHairstylesOutput - The return type for the analyzeFaceAndSuggestHairstyles function.
 */

import {defineFlow} from '@genkit-ai/flow';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFaceAndSuggestHairstylesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFaceAndSuggestHairstylesInput = z.infer<typeof AnalyzeFaceAndSuggestHairstylesInputSchema>;

const AnalyzeFaceAndSuggestHairstylesOutputSchema = z.object({
  faceAnalysis: z.string().describe('The analysis of the face shape and skin tone.'),
  suggestedHairstyles: z.array(z.string()).describe('The suggested hairstyles based on the face analysis.'),
});
export type AnalyzeFaceAndSuggestHairstylesOutput = z.infer<typeof AnalyzeFaceAndSuggestHairstylesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'analyzeFaceAndSuggestHairstylesPrompt',
  input: {schema: AnalyzeFaceAndSuggestHairstylesInputSchema},
  output: {schema: AnalyzeFaceAndSuggestHairstylesOutputSchema},
  prompt: `Analyze the face in the following photo and suggest suitable hairstyles.

Photo: {{media url=photoDataUri}}

Consider face shape, skin tone, and current hairstyle trends when making your suggestions.
Return the analysis of the face, and then a list of suggested hairstyles.`,
});

export const analyzeFaceAndSuggestHairstyles = defineFlow(
  {
    name: 'analyzeFaceAndSuggestHairstylesFlow',
    inputSchema: AnalyzeFaceAndSuggestHairstylesInputSchema,
    outputSchema: AnalyzeFaceAndSuggestHairstylesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
