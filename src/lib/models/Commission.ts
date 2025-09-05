import mongoose from "mongoose";

export interface ICommission {
  _id: string;
  orderId: string;
  affiliateCode: string;
  baseAmountCents: number;
  rate: number;
  commissionCents: number;
  status: "pending" | "locked" | "void" | "queued_for_payout" | "paid";
  lockAt: Date;
  paidPayoutId?: string;
  voidReason?: string;
  voidedAt?: Date;
  adjustedForRefund?: boolean;
  originalCommissionCents?: number;
  refundPercentage?: number;
  stripeRefundId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const commissionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    affiliateCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    baseAmountCents: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
      default: 0.40, // 40% commission
    },
    commissionCents: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "locked", "void", "queued_for_payout", "paid"],
      default: "pending",
    },
    lockAt: {
      type: Date,
      required: true,
    },
    paidPayoutId: {
      type: String,
      required: false,
    },
    voidReason: {
      type: String,
      required: false,
    },
    voidedAt: {
      type: Date,
      required: false,
    },
    adjustedForRefund: {
      type: Boolean,
      default: false,
    },
    originalCommissionCents: {
      type: Number,
      required: false,
    },
    refundPercentage: {
      type: Number,
      required: false,
    },
    stripeRefundId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
commissionSchema.index({ orderId: 1 });
commissionSchema.index({ affiliateCode: 1 });
commissionSchema.index({ status: 1 });
commissionSchema.index({ lockAt: 1 });
commissionSchema.index({ paidPayoutId: 1 });
commissionSchema.index({ voidReason: 1 });
commissionSchema.index({ stripeRefundId: 1 });

const Commission = (mongoose.models.Commission as mongoose.Model<ICommission>) || mongoose.model<ICommission>("Commission", commissionSchema);

export default Commission;