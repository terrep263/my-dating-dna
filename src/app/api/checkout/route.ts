import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";

console.log(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil", // use latest stable version
});
const prices = {
  single: "price_1S2PgHQLEzLgmXwxYaE8U9y8",
  couple: "price_1S2Pi0QLEzLgmXwxP5LAMHVT",
  grace: "price_1S2PihQLEzLgmXwx8bGwsG6T",
};

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { plan, email, name } = body;

    if (!plan) {
      return NextResponse.json(
        { error: "Product path is required" },
        { status: 400 }
      );
    }
    const price = prices[plan as keyof typeof prices];
    console.log(price);
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    const success_url =
      plan === "grace"
        ? `${process.env.NEXTAUTH_URL}/subscriptions`
        : `${process.env.NEXTAUTH_URL}/assessment`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscriptions`,
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      mode: plan === "grace" ? "subscription" : "payment",
      metadata: {
        user: user._id.toString(),
        plan,
        email,
        name,
      },
    });
    console.log(session);
    return NextResponse.json({
      session,
      success: true,
    });
  } catch (error: unknown) {
    console.log(error);
    console.error("Checkout session creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
