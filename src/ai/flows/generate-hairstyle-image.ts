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

const ProductSuggestionItem = z.object({
  name: z.string(),
  link: z.string().describe('Đường link dẫn tới sản phẩm gợi ý để người dùng có thể mua.'),
  reason: z.string().optional(),
});

const GenerateHairstyleImageOutputSchema = z.object({
  // keep outputImageUrl optional: UI may display an overlaid image later
  outputImageUrl: z.string().optional(),
  summary: z.string().describe('Đoạn tóm tắt tiếng Việt về độ phù hợp của kiểu tóc.'),
  compatibilityLabel: z
    .string()
    .describe('Mức độ phù hợp tổng quan (Phù hợp, Tạm ổn, Chưa phù hợp).'),
  compatibilityScore: z
    .number()
    .optional()
    .describe('Điểm số 0-100 thể hiện độ phù hợp.'),
  featureBreakdown: z
    .array(FeatureBreakdownItem)
    .describe('Chi tiết đánh giá từng đặc điểm khuôn mặt bằng tiếng Việt.'),
  productSuggestions: z
    .array(ProductSuggestionItem)
    .describe('Danh sách sản phẩm chăm sóc tóc nên mua thêm theo đánh giá, bằng tiếng Việt.'),
});
export type GenerateHairstyleImageOutput = z.infer<typeof GenerateHairstyleImageOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateHairstyleImagePrompt',
  input: {schema: GenerateHairstyleImageInputSchema},
  output: {schema: GenerateHairstyleImageOutputSchema},
  prompt: `Bạn là chuyên gia tạo kiểu tóc và phân tích khuôn mặt.

Hãy đánh giá mức độ phù hợp giữa kiểu tóc và khuôn mặt trong ảnh sau và TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.

Thông tin đầu vào:
- Ảnh khuôn mặt: {{media url=inputImageUrl}}
- Ảnh kiểu tóc: {{media url=hairstyleImageUrl}}
{% if geminiAnalysis %}- Phân tích bổ sung từ Gemini: {{geminiAnalysis}}{% endif %}
{% if hairstyleName %}- Tên kiểu tóc: {{hairstyleName}}{% endif %}

Yêu cầu phản hồi dạng JSON khớp với schema, trong đó:
- 'summary': một câu tiếng Việt tóm tắt độ phù hợp.
- 'compatibilityLabel': dùng đúng một trong các giá trị "Phù hợp", "Tạm ổn", "Chưa phù hợp".
- 'compatibilityScore': điểm 0-100 (nếu có) để người dùng dễ hình dung.
- 'featureBreakdown': danh sách các đặc điểm quan trọng (ví dụ: Dáng mặt, Trán, Gò má, Đường chân tóc...) mỗi mục gồm: 'feature' (tên đặc điểm bằng tiếng Việt), 'suitability' (mức đánh giá ngắn), 'insight' (phân tích chi tiết bằng tiếng Việt) và 'recommendation' (gợi ý cải thiện, nếu cần, bằng tiếng Việt).
- 'productSuggestions': ít nhất 3 sản phẩm chăm sóc tóc phù hợp (dạng dầu gội, dầu xả, dưỡng chất, thuốc nhuộm...), mỗi phần tử gồm: 'name' (tên sản phẩm cụ thể), 'link' (URL tới trang mua hàng trực tuyến, ưu tiên Shopee/Lazada/Tiki hoặc trang chính hãng, bắt đầu bằng https://), 'reason' (mô tả ngắn vì sao nên dùng sản phẩm đó).

Chỉ trả về JSON hợp lệ, không thêm lời bình khác.
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
