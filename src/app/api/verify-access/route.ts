import User from "@/lib/models/User";
import { NextRequest, NextResponse } from "next/server";

interface UserDocument {
  _id: string;
  type?: "single" | "couple";
  attempts?: number;
  validity?: Date;
  subscription: {
    plan: "free" | "singles" | "couples" | "premium";
    status: "active" | "inactive" | "cancelled";
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, userId } = body;
    console.log(body);
    console.log(userId);

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const access = checkAccess(user, type);

    console.log(access);
    return NextResponse.json({ success: access, hasAccess: access });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Verify access error:", errorMessage);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

const checkAccess = (user: UserDocument, type: string): boolean | undefined => {
  if (type === "grace") {
    return (
      user.subscription.plan === "premium" &&
      user.subscription.status === "active"
    );
  } else {
    return (
      (user.attempts || 0) > 0 && user.validity && user.validity > new Date()
    );
  }
};
