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

const FeatureBreakdownItem = z.object({
  feature: z.string(),
  suitability: z.string(),
  insight: z.string(),
  recommendation: z.string().optional(),
});

const GenerateHairstyleImageOutputSchema = z.object({
  // keep outputImageUrl optional: UI may display an overlaid image later
  outputImageUrl: z.string().optional(),
  summary: z.string().describe('A short summary of hairstyle compatibility.'),
  compatibilityLabel: z.string().describe('Overall compatibility label (e.g., Good, Fair, Poor).'),
  compatibilityScore: z.number().optional().describe('Numeric compatibility score 0-100.'),
  featureBreakdown: z.array(FeatureBreakdownItem).describe('Breakdown of compatibility by facial feature.'),
});
export type GenerateHairstyleImageOutput = z.infer<typeof GenerateHairstyleImageOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateHairstyleImagePrompt',
  input: {schema: GenerateHairstyleImageInputSchema},
  output: {schema: GenerateHairstyleImageOutputSchema},
  prompt: `You are an expert stylist and facial-analysis assistant.

Analyze how well the hairstyle (provided as an image) suits the face in the input image.

Inputs:
- Face image: {{media url=inputImageUrl}}
- Hairstyle image: {{media url=hairstyleImageUrl}}
{% if geminiAnalysis %}- Additional face analysis: {{geminiAnalysis}}{% endif %}
{% if hairstyleName %}- Hairstyle name: {{hairstyleName}}{% endif %}

Produce a JSON object matching the output schema. Include:
- summary: one-sentence overall conclusion.
- compatibilityLabel: one-word label (Good, Fair, Poor).
- compatibilityScore: numeric score from 0 to 100 (optional but preferred).
- featureBreakdown: array of objects for important features (e.g., Face shape, Hairline, Forehead, Cheeks, Jaw) each with 'feature', 'suitability', 'insight', and optional 'recommendation'.

Be concise and factual. Return only the structured output.
`,
});

const generateHairstyleImageFlow = ai.defineFlow(
  {
    name: 'generateHairstyleImageFlow',
    inputSchema: GenerateHairstyleImageInputSchema,
    outputSchema: GenerateHairstyleImageOutputSchema,
  },
  async input => {
    // Use the prompt defined above to return a structured analysis instead of
    // producing an image. The prompt's output schema ensures the response is
    // validated and typed.
    const {output} = await prompt(input);
    return output!;
  }
);

// Export the flow object so `runFlow` gets a Flow-compatible value.
export const generateHairstyleImage = generateHairstyleImageFlow;

// Callable wrapper for server code to get the analysis output directly.
export async function generateHairstyleImageAction(
  input: GenerateHairstyleImageInput
): Promise<GenerateHairstyleImageOutput> {
  const {output} = await prompt(input as any);
  return output!;
}
