import mongoose from "mongoose";

export interface IAffiliateAttribution {
  _id: string;
  affiliateCode: string;
  userIdOrEmail?: string;
  cookieValue: string;
  createdAt: Date;
}

const affiliateAttributionSchema = new mongoose.Schema(
  {
    affiliateCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    userIdOrEmail: {
      type: String,
      required: false,
    },
    cookieValue: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Add indexes for better performance
affiliateAttributionSchema.index({ affiliateCode: 1 });
affiliateAttributionSchema.index({ userIdOrEmail: 1 });
affiliateAttributionSchema.index({ createdAt: -1 });

const AffiliateAttribution =
  (mongoose.models
    .AffiliateAttribution as mongoose.Model<IAffiliateAttribution>) ||
  mongoose.model<IAffiliateAttribution>(
    "AffiliateAttribution",
    affiliateAttributionSchema
  );
export default AffiliateAttribution;
