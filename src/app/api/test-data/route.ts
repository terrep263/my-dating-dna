import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Affiliate from "@/lib/models/Affiliate";
import Commission from "@/lib/models/Commission";
import Order from "@/lib/models/Order";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    console.log("Creating test data...");

    // Create a test affiliate
    const testAffiliate = await Affiliate.create({
      code: "TEST001",
      name: "Test Affiliate",
      email: "test@example.com",
      payoutMethod: {
        type: "paypal",
        details: "test@example.com"
      },
      isActive: true
    });
    console.log("Created test affiliate:", testAffiliate._id);

    // Create a test order
    const testOrder = await Order.create({
      stripePaymentIntent: "pi_test_" + Date.now(),
      customerEmail: "customer@example.com",
      amountSubtotalCents: 10000, // $100
      amountTotalCents: 10000,
      currency: "usd",
      affiliateCode: "TEST001",
      paidAt: new Date(),
      disputed: false
    });
    console.log("Created test order:", testOrder._id);

    // Create a test commission
    const testCommission = await Commission.create({
      orderId: testOrder._id,
      affiliateCode: "TEST001",
      baseAmountCents: 10000,
      rate: 0.40,
      commissionCents: 4000, // $40
      status: "pending",
      lockAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    console.log("Created test commission:", testCommission._id);

    return NextResponse.json({
      success: true,
      message: "Test data created successfully",
      data: {
        affiliate: testAffiliate,
        order: testOrder,
        commission: testCommission
      }
    });

  } catch (error) {
    console.error("Error creating test data:", error);
    return NextResponse.json(
      { error: "Failed to create test data", details: error },
      { status: 500 }
    );
  }
}
