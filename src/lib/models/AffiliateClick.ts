import mongoose from "mongoose";

export interface IAffiliateClick {
  _id: string;
  affiliateCode: string;
  url: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const affiliateClickSchema = new mongoose.Schema(
  {
    affiliateCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Add indexes for better performance
affiliateClickSchema.index({ affiliateCode: 1 });
affiliateClickSchema.index({ createdAt: -1 });

const AffiliateClick =
  (mongoose.models.AffiliateClick as mongoose.Model<IAffiliateClick>) ||
  mongoose.model<IAffiliateClick>("AffiliateClick", affiliateClickSchema);

export default AffiliateClick;
