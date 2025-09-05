import mongoose from "mongoose";

export interface IPayoutItem {
  _id: string;
  payoutId: string;
  affiliateCode: string;
  commissionIds: string[];
  amountCents: number;
  createdAt: Date;
}

const payoutItemSchema = new mongoose.Schema(
  {
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
      required: true,
    },
    affiliateCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    commissionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commission",
    }],
    amountCents: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Add indexes for better performance
payoutItemSchema.index({ payoutId: 1 });
payoutItemSchema.index({ affiliateCode: 1 });

const PayoutItem = (mongoose.models.PayoutItem as mongoose.Model<IPayoutItem>) || mongoose.model<IPayoutItem>("PayoutItem", payoutItemSchema);

export default PayoutItem;
