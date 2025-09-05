import mongoose from "mongoose";

export interface IOrder {
  _id: string;
  stripePaymentIntent: string;
  customerEmail: string;
  amountSubtotalCents: number;
  amountTotalCents: number;
  currency: string;
  affiliateCode?: string;
  paidAt: Date;
  refundedAt?: Date;
  refundAmountCents?: number;
  isFullRefund?: boolean;
  stripeRefundId?: string;
  refundReason?: string;
  refundStatus?: string;
  disputed: boolean;
  disputeStatus?: string;
  disputeUpdatedAt?: Date;
  disputeClosedAt?: Date;
  paymentFailed?: boolean;
  paymentFailedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema(
  {
    stripePaymentIntent: {
      type: String,
      required: true,
      unique: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    amountSubtotalCents: {
      type: Number,
      required: true,
    },
    amountTotalCents: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "usd",
    },
    affiliateCode: {
      type: String,
      required: false,
      uppercase: true,
      trim: true,
    },
    paidAt: {
      type: Date,
      required: true,
    },
    refundedAt: {
      type: Date,
      required: false,
    },
    refundAmountCents: {
      type: Number,
      required: false,
    },
    isFullRefund: {
      type: Boolean,
      required: false,
    },
    stripeRefundId: {
      type: String,
      required: false,
    },
    refundReason: {
      type: String,
      required: false,
    },
    refundStatus: {
      type: String,
      required: false,
    },
    disputed: {
      type: Boolean,
      default: false,
    },
    disputeStatus: {
      type: String,
      required: false,
    },
    disputeUpdatedAt: {
      type: Date,
      required: false,
    },
    disputeClosedAt: {
      type: Date,
      required: false,
    },
    paymentFailed: {
      type: Boolean,
      default: false,
    },
    paymentFailedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
orderSchema.index({ stripePaymentIntent: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ affiliateCode: 1 });
orderSchema.index({ paidAt: -1 });
orderSchema.index({ refundedAt: 1 });
orderSchema.index({ stripeRefundId: 1 });

const Order = (mongoose.models.Order as mongoose.Model<IOrder>) || mongoose.model<IOrder>("Order", orderSchema);

export default Order;