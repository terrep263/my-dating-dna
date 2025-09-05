import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";
import Commission from "@/lib/models/Commission";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check here
    // For now, we'll allow any authenticated user to process refunds

    const { orderId, refundAmountCents, reason, refundType } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is already refunded
    if (order.refundedAt) {
      return NextResponse.json(
        { error: "Order has already been refunded" },
        { status: 400 }
      );
    }

    // Determine refund amount
    let refundAmount: number;
    if (refundAmountCents) {
      refundAmount = refundAmountCents;
    } else {
      // Full refund
      refundAmount = order.amountTotalCents;
    }

    // Validate refund amount
    if (refundAmount <= 0 || refundAmount > order.amountTotalCents) {
      return NextResponse.json(
        { error: "Invalid refund amount" },
        { status: 400 }
      );
    }

    console.log(`Processing Stripe refund for order: ${orderId}, Amount: $${(refundAmount / 100).toFixed(2)}`);

    // Process refund through Stripe
    let stripeRefund;
    try {
      stripeRefund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntent,
        amount: refundAmount,
        reason: refundType || "requested_by_customer",
        metadata: {
          orderId: orderId,
          refundReason: reason || "Manual refund",
          processedBy: session.user.email || "admin",
        },
      });

      console.log(`Stripe refund created: ${stripeRefund.id}`);
    } catch (stripeError: any) {
      console.error("Stripe refund error:", stripeError);
      return NextResponse.json(
        { 
          error: "Failed to process refund through Stripe",
          details: stripeError.message 
        },
        { status: 500 }
      );
    }

    // Update order with refund information
    const isFullRefund = refundAmount >= order.amountTotalCents;
    await Order.findByIdAndUpdate(orderId, {
      refundedAt: new Date(),
      refundAmountCents: refundAmount,
      isFullRefund: isFullRefund,
      stripeRefundId: stripeRefund.id,
      refundReason: reason || "Manual refund",
      refundStatus: stripeRefund.status,
    });

    // Handle commissions based on refund type
    if (isFullRefund) {
      // Full refund - void all commissions
      await Commission.updateMany(
        { orderId: orderId },
        { 
          status: "void",
          voidReason: "full_refund",
          voidedAt: new Date(),
          stripeRefundId: stripeRefund.id,
        }
      );
      console.log(`Full refund - voided all commissions for order: ${orderId}`);
    } else {
      // Partial refund - adjust commission amounts
      const refundPercentage = refundAmount / order.amountTotalCents;
      const commissions = await Commission.find({ orderId: orderId });
      
      for (const commission of commissions) {
        if (commission.status === "pending") {
          // Void pending commissions
          await Commission.findByIdAndUpdate(commission._id, {
            status: "void",
            voidReason: "partial_refund",
            voidedAt: new Date(),
            stripeRefundId: stripeRefund.id,
          });
        } else if (commission.status === "locked" || commission.status === "queued_for_payout") {
          // Adjust locked commissions
          const adjustedAmount = Math.floor(commission.commissionCents * (1 - refundPercentage));
          await Commission.findByIdAndUpdate(commission._id, {
            commissionCents: adjustedAmount,
            baseAmountCents: Math.floor(commission.baseAmountCents * (1 - refundPercentage)),
            adjustedForRefund: true,
            originalCommissionCents: commission.commissionCents,
            refundPercentage: refundPercentage,
            stripeRefundId: stripeRefund.id,
          });
        }
      }
      console.log(`Partial refund - adjusted commissions for order: ${orderId}`);
    }

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
      refund: {
        id: stripeRefund.id,
        amount: refundAmount,
        status: stripeRefund.status,
        isFullRefund: isFullRefund,
        orderId: orderId,
      },
    });

  } catch (error) {
    console.error("Refund processing error:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve refund information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const refundId = searchParams.get("refundId");

    if (!orderId && !refundId) {
      return NextResponse.json(
        { error: "Order ID or Refund ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let order;
    if (orderId) {
      order = await Order.findById(orderId);
    } else if (refundId) {
      order = await Order.findOne({ stripeRefundId: refundId });
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Get refund details from Stripe if refund exists
    let stripeRefund = null;
    if (order.stripeRefundId) {
      try {
        stripeRefund = await stripe.refunds.retrieve(order.stripeRefundId);
      } catch (error) {
        console.error("Error retrieving Stripe refund:", error);
      }
    }

    // Get commission details
    const commissions = await Commission.find({ orderId: order._id });

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        stripePaymentIntent: order.stripePaymentIntent,
        customerEmail: order.customerEmail,
        amountTotalCents: order.amountTotalCents,
        refundedAt: order.refundedAt,
        refundAmountCents: order.refundAmountCents,
        isFullRefund: order.isFullRefund,
        refundReason: order.refundReason,
        refundStatus: order.refundStatus,
      },
      stripeRefund,
      commissions: commissions.map(commission => ({
        id: commission._id,
        affiliateCode: commission.affiliateCode,
        commissionCents: commission.commissionCents,
        status: commission.status,
        voidReason: commission.voidReason,
        adjustedForRefund: commission.adjustedForRefund,
      })),
    });

  } catch (error) {
    console.error("Error retrieving refund information:", error);
    return NextResponse.json(
      { error: "Failed to retrieve refund information" },
      { status: 500 }
    );
  }
}
