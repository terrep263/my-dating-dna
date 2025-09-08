import mongoose from "mongoose";

export interface IAffiliate {
  _id: string;
  code: string;
  name: string;
  email: string;
  payoutMethod: {
    type: "paypal" | "stripe" | "wise" | "bank";
    details: string;
  };
  isActive: boolean;
  invitationCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    payoutMethod: {
      type: {
        type: String,
        enum: ["paypal", "stripe", "wise", "bank"],
        required: true,
      },
      details: {
        type: String,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    invitationCode: {
      type: String,
      uppercase: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
// affiliateSchema.index({ code: 1 });
// affiliateSchema.index({ email: 1 });
// affiliateSchema.index({ isActive: 1 });

const Affiliate =
  (mongoose.models?.Affiliate as mongoose.Model<IAffiliate>) ||
  mongoose.model<IAffiliate>("Affiliate", affiliateSchema);

export default Affiliate;
