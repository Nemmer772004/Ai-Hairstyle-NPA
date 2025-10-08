'use server';
/**
 * @fileOverview An AI agent that analyzes a face in a photo and suggests suitable hairstyles.
 *
 * - analyzeFaceAndSuggestHairstyles - A function that handles the face analysis and hairstyle suggestion process.
 * - AnalyzeFaceAndSuggestHairstylesInput - The input type for the analyzeFaceAndSuggestHairstyles function.
 * - AnalyzeFaceAndSuggestHairstylesOutput - The return type for the analyzeFaceAndSuggestHairstyles function.
 */

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

// We'll export the flow object at the end of this file so it's defined
// before being referenced. See bottom of file for the export.

const prompt = ai.definePrompt({
  name: 'analyzeFaceAndSuggestHairstylesPrompt',
  input: {schema: AnalyzeFaceAndSuggestHairstylesInputSchema},
  output: {schema: AnalyzeFaceAndSuggestHairstylesOutputSchema},
  prompt: `Analyze the face in the following photo and suggest suitable hairstyles.

Photo: {{media url=photoDataUri}}

Consider face shape, skin tone, and current hairstyle trends when making your suggestions.
Return the analysis of the face, and then a list of suggested hairstyles.`,
});

const analyzeFaceAndSuggestHairstylesFlow = ai.defineFlow(
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

// Export the flow object itself so utilities like `runFlow` receive
// an object with `inputSchema`/`outputSchema` instead of a wrapper
// function which caused `inputSchema` to be undefined.
export const analyzeFaceAndSuggestHairstyles = analyzeFaceAndSuggestHairstylesFlow;

// Also export a callable helper for server code to directly run the flow's
// prompt and return typed output. This avoids relying on `runFlow` which
// may expect a different shape in some environments.
export async function analyzeFaceAndSuggestHairstylesAction(
  input: AnalyzeFaceAndSuggestHairstylesInput
): Promise<AnalyzeFaceAndSuggestHairstylesOutput> {
  const {output} = await prompt(input as any);
  return output!;
}
