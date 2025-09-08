import mongoose from "mongoose";

export interface IAffiliateInvitation {
  invitationCode: string;
  invitedBy: string; // Admin user ID
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  inviteeEmail?: string; // Optional - for email-specific invitations
  inviteeName?: string; // Optional - for tracking who it's for
  createdAt: Date;
  updatedAt: Date;
}

const affiliateInvitationSchema = new mongoose.Schema(
  {
    invitationCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    invitedBy: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    maxUses: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    inviteeEmail: {
      type: String,
      lowercase: true,
      default: null,
    },
    inviteeName: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
affiliateInvitationSchema.index({ invitationCode: 1 });
affiliateInvitationSchema.index({ invitedBy: 1 });
affiliateInvitationSchema.index({ isActive: 1 });
affiliateInvitationSchema.index({ expiresAt: 1 });

const AffiliateInvitation = (mongoose.models.AffiliateInvitation as mongoose.Model<IAffiliateInvitation>) ||
  mongoose.model<IAffiliateInvitation>("AffiliateInvitation", affiliateInvitationSchema);

export default AffiliateInvitation;
