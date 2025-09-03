import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/db";

export const config = {
  api: {
    bodyParser: false, // ensure raw body
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await req.text(); // RAW BODY

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed":
      if (event.data.object.metadata) {
        await handleSubscriptionActivated(event.data.object as any);
      }
      break;
    case "invoice.payment_succeeded":
      if (event.data.object.metadata) {
        await handleSubscriptionActivated(event.data.object as any);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}

async function handleSubscriptionActivated(data: any) {
  console.log(data, "data");
  try {
    await connectToDatabase();
    const user = await User.findById(data?.metadata?.user);
    if (!user) return;

    if (data.metadata?.plan === "grace") {
      user.subscription.status = "active";
      user.subscription.plan = "premium";
      user.subscription.id = data.parent.subscription_details.subscription;
      user.subscription.startDate = new Date();
      user.subscription.endDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );
    } else if (data.metadata?.plan === "single") {
      user.type = "single";
      user.attempts += 1;
      user.validity = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (data.metadata?.plan === "couple") {
      user.type = "couple";
      user.attempts += 2;
      user.validity = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await user.save();
  } catch (error) {
    throw Error(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}
