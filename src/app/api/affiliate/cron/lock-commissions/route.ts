import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Commission from "@/lib/models/Commission";
import Order from "@/lib/models/Order";

// Cron job to lock commissions after 30 days
export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron request (you should add proper authentication)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const now = new Date();
    
    // Find commissions that are pending and should be locked
    const pendingCommissions = await Commission.find({
      status: "pending",
      lockAt: { $lte: now },
    }).populate("orderId");

    let lockedCount = 0;
    let voidedCount = 0;

    for (const commission of pendingCommissions) {
      const order = commission.orderId as any;
      
      // Check if order was refunded or disputed
      if (order.refundedAt || order.disputed) {
        // Void the commission
        await Commission.findByIdAndUpdate(commission._id, {
          status: "void",
        });
        voidedCount++;
      } else {
        // Lock the commission
        await Commission.findByIdAndUpdate(commission._id, {
          status: "locked",
        });
        lockedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingCommissions.length} commissions`,
      locked: lockedCount,
      voided: voidedCount,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to process commissions" },
      { status: 500 }
    );
  }
}
