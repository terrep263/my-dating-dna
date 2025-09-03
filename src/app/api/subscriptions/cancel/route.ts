import { NextResponse } from "next/server";
import Stripe from "stripe";
import User from "@/lib/models/User";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST() {
  const headerList = await headers();
  const id = headerList.get("id");

  try {
    await connectToDatabase();
    const user = await User.findById(id);
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    
    if (user.subscription.id) {
      await stripe.subscriptions.cancel(user.subscription.id);
    }
    
    user.subscription.status = "cancelled";
    user.subscription.endDate = new Date();
    user.subscription.id = null;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Subscription cancelled successfully!" },
      {
        status: 200,
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error(errorMessage);
    return NextResponse.json(
      { message: errorMessage, success: false },
      { status: 400 }
    );
  }
}
