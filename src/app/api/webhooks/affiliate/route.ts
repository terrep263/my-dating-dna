import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";
import Commission from "@/lib/models/Commission";
import Affiliate from "@/lib/models/Affiliate";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

const COMMISSION_RATE = 0.4; // 40% commission
const HOLD_DAYS = 30; // 30-day hold period

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_AFFILIATE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await connectToDatabase();

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case "charge.dispute.created":
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    if (!session.payment_intent) {
      console.log("No payment intent found in session");
      return;
    }

    // Retrieve the payment intent to get the charge details
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );

    if (!paymentIntent.latest_charge) {
      console.log("No charge found in payment intent");
      return;
    }

    // Retrieve the charge to get amount details
    const charge = await stripe.charges.retrieve(
      paymentIntent.latest_charge as string
    );

    const affiliateCode = session.metadata?.affiliate_code;

    // Create order record
    const order = await Order.create({
      stripePaymentIntent: session.payment_intent as string,
      customerEmail:
        session.customer_email || session.customer_details?.email || "",
      amountSubtotalCents: charge.amount - (charge.tax || 0), // Exclude tax
      amountTotalCents: charge.amount,
      currency: charge.currency || "USD",
      affiliateCode: affiliateCode?.toUpperCase(),
      paidAt: new Date(charge.created * 1000),
      disputed: false,
    });

    // Create commission if affiliate code exists
    if (affiliateCode) {
      // Verify affiliate exists and is active
      const affiliate = await Affiliate.findOne({
        code: affiliateCode.toUpperCase(),
        isActive: true,
      });

      if (affiliate) {
        const baseAmountCents = order.amountSubtotalCents;
        const commissionCents = Math.floor(baseAmountCents * COMMISSION_RATE);
        const lockAt = new Date(
          order.paidAt.getTime() + HOLD_DAYS * 24 * 60 * 60 * 1000
        );

        await Commission.create({
          orderId: order._id,
          affiliateCode: affiliateCode.toUpperCase(),
          baseAmountCents,
          rate: COMMISSION_RATE,
          commissionCents,
          status: "pending",
          lockAt,
        });

        console.log(
          `Commission created for affiliate ${affiliateCode}: $${(
            commissionCents / 100
          ).toFixed(2)}`
        );
      } else {
        console.log(`Affiliate not found or inactive: ${affiliateCode}`);
      }
    }

    console.log(`Order created: ${order._id}`);
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    // Find the order by payment intent
    const order = await Order.findOne({
      stripePaymentIntent: charge.payment_intent as string,
    });

    if (order) {
      // Mark order as refunded
      await Order.findByIdAndUpdate(order._id, {
        refundedAt: new Date(),
      });
      console.log("marked as refunded");
      // Void any pending commissions for this order
      await Commission.updateMany(
        { orderId: order._id, status: "pending" },
        { status: "void" }
      );

      console.log(`Order refunded: ${order._id}`);
    }
  } catch (error) {
    console.error("Error handling charge refunded:", error);
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    // Find the order by payment intent
    const order = await Order.findOne({
      stripePaymentIntent: dispute.payment_intent as string,
    });

    if (order) {
      // Mark order as disputed
      await Order.findByIdAndUpdate(order._id, {
        disputed: true,
      });

      // Void any pending commissions for this order
      await Commission.updateMany(
        { orderId: order._id, status: "pending" },
        { status: "void" }
      );

      console.log(`Order disputed: ${order._id}`);
    }
  } catch (error) {
    console.error("Error handling charge dispute created:", error);
  }
}
