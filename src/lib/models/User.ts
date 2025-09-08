import mongoose from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  image?: string;
  account?: string;
  role?: string;
  subscription: {
    id?: string;
    plan: "free" | "premium";
    status: "active" | "inactive" | "cancelled";
    startDate: Date;
    endDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Not required for OAuth users
    },
    image: {
      type: String,
      required: false,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "singles", "couples", "premium"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled"],
        default: "inactive",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        default: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      },
    },
    type: {
      type: String,
      enum: ["couple", "single"],
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    validity: {
      type: Date,
      default: Date.now() + 24 * 60 * 60 * 1000, // 30 days from now
    },
    role:{
      type: String,
      default: "user",
    }
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
userSchema.index({ "subscription.status": 1 });
userSchema.index({ "subscription.plan": 1 });

const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);

export default User;
