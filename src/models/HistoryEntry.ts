import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const ProductSuggestionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    link: { type: String },
    reason: { type: String },
  },
  { _id: false }
);

const HistoryDetailSchema = new mongoose.Schema(
  {
    inputImage: { type: String },
    outputImage: { type: String },
    analysisSummary: { type: String },
    compatibilityLabel: { type: String },
    compatibilityScore: { type: Number },
    featureBreakdown: { type: [mongoose.Schema.Types.Mixed], default: [] },
    productSuggestions: { type: [ProductSuggestionSchema], default: [] },
    tags: { type: [String], default: [] },
  },
  { _id: false }
);

const HistoryStatsSchema = new mongoose.Schema(
  {
    match: { type: Boolean, default: false },
    note: { type: String },
    rating: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const HistoryEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    hairstyleId: { type: String },
    hairstyleName: { type: String },
    createdAt: { type: Date, default: Date.now, index: true },
    summary: { type: String },
    details: { type: HistoryDetailSchema, default: () => ({}) },
    stats: { type: HistoryStatsSchema, default: () => ({}) },
    isHidden: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type HistoryEntry = InferSchemaType<typeof HistoryEntrySchema>;

export default (mongoose.models.HistoryEntry as Model<HistoryEntry>) ||
  mongoose.model<HistoryEntry>('HistoryEntry', HistoryEntrySchema);
