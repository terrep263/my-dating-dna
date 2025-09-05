import mongoose from "mongoose";

export interface IPayout {
  _id: string;
  periodStart: Date;
  periodEnd: Date;
  totalCents: number;
  status: "draft" | "exported" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

const payoutSchema = new mongoose.Schema(
  {
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    totalCents: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "exported", "paid"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
payoutSchema.index({ periodStart: 1, periodEnd: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ createdAt: -1 });

const Payout = (mongoose.models.Payout as mongoose.Model<IPayout>) || mongoose.model<IPayout>("Payout", payoutSchema);

export default Payout;
