import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Affiliate from "@/lib/models/Affiliate";
import Commission from "@/lib/models/Commission";
import Order from "@/lib/models/Order";
import Payout from "@/lib/models/Payout";
import PayoutItem from "@/lib/models/PayoutItem";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Admin-only endpoint for managing payouts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log(session)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Add admin role check here
    // For now, we'll allow any authenticated user to access admin features
    // In production, you should implement proper admin role checking

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    console.log(action)
    if (action === "payouts") {
      // Get all payouts
      const payouts = await Payout.find()
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        payouts,
      });
    }

    if (action === "commissions") {
      // Get all commissions (without populating orderId to avoid object rendering issues)
      console.log("Fetching commissions...");
      const commissions = await Commission.find()
        .sort({ createdAt: -1 });
      console.log(`Found ${commissions.length} commissions`);

      return NextResponse.json({
        success: true,
        commissions,
      });
    }

    if (action === "affiliates") {
      // Get all affiliates
      console.log("Fetching affiliates...");
      const affiliates = await Affiliate.find()
        .sort({ createdAt: -1 });
      console.log(`Found ${affiliates.length} affiliates`);

      return NextResponse.json({
        success: true,
        affiliates,
      });
    }

    if (action === "orders") {
      // Get all orders
      console.log("Fetching orders...");
      const orders = await Order.find()
        .sort({ createdAt: -1 });
      console.log(`Found ${orders.length} orders`);

      return NextResponse.json({
        success: true,
        orders,
      });
    }

    if (action === "payoutItems") {
      const payoutId = searchParams.get("payoutId");
      if (!payoutId) {
        return NextResponse.json(
          { error: "Payout ID is required" },
          { status: 400 }
        );
      }

      const payoutItems = await PayoutItem.find({ payoutId })
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        payoutItems,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Add admin role check

    await connectToDatabase();
    
    const body = await request.json();
    const { action, periodStart, periodEnd } = body;

    if (action === "create_payout") {
      if (!periodStart || !periodEnd) {
        return NextResponse.json(
          { error: "Period start and end dates are required" },
          { status: 400 }
        );
      }

      // Get all locked commissions in the period
      const lockedCommissions = await Commission.find({
        status: "locked",
        lockAt: {
          $gte: new Date(periodStart),
          $lte: new Date(periodEnd),
        },
      });

      if (lockedCommissions.length === 0) {
        return NextResponse.json(
          { error: "No locked commissions found for this period" },
          { status: 400 }
        );
      }

      // Group commissions by affiliate
      const affiliateCommissions = lockedCommissions.reduce((acc, commission) => {
        if (!acc[commission.affiliateCode]) {
          acc[commission.affiliateCode] = [];
        }
        acc[commission.affiliateCode].push(commission);
        return acc;
      }, {} as Record<string, any[]>);

      // Create payout
      const payout = await Payout.create({
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        totalCents: lockedCommissions.reduce((sum, c) => sum + c.commissionCents, 0),
        status: "draft",
      });

      // Create payout items
      const payoutItems = [];
      for (const [affiliateCode, commissions] of Object.entries(affiliateCommissions)) {
        const amountCents = commissions.reduce((sum, c) => sum + c.commissionCents, 0);
        
        const payoutItem = await PayoutItem.create({
          payoutId: payout._id,
          affiliateCode,
          commissionIds: commissions.map(c => c._id),
          amountCents,
        });

        payoutItems.push(payoutItem);

        // Update commission statuses
        await Commission.updateMany(
          { _id: { $in: commissions.map(c => c._id) } },
          { status: "queued_for_payout" }
        );
      }

      return NextResponse.json({
        success: true,
        payout: {
          ...payout.toObject(),
          payoutItems,
        },
      });
    }

    if (action === "export_payout") {
      const { payoutId } = body;
      
      if (!payoutId) {
        return NextResponse.json(
          { error: "Payout ID is required" },
          { status: 400 }
        );
      }

      const payout = await Payout.findById(payoutId);

      if (!payout) {
        return NextResponse.json(
          { error: "Payout not found" },
          { status: 404 }
        );
      }

      // Get payout items for this payout
      const payoutItems = await PayoutItem.find({ payoutId });
      
      // Get affiliate details for each payout item
      const payoutItemsWithAffiliates = await Promise.all(
        payoutItems.map(async (item: any) => {
          const affiliate = await Affiliate.findOne({ code: item.affiliateCode });
          return {
            affiliateCode: item.affiliateCode,
            affiliateName: affiliate?.name || "Unknown",
            affiliateEmail: affiliate?.email || "Unknown",
            paymentMethod: affiliate?.payoutMethod.type || "Unknown",
            payInfo: affiliate?.payoutMethod.details || "Unknown",
            amountCents: item.amountCents,
            amount: (item.amountCents / 100).toFixed(2),
          };
        })
      );

      // Update payout status
      await Payout.findByIdAndUpdate(payoutId, { status: "exported" });

      return NextResponse.json({
        success: true,
        csvData: payoutItemsWithAffiliates,
        payout,
      });
    }

    if (action === "mark_paid") {
      const { payoutId } = body;
      
      if (!payoutId) {
        return NextResponse.json(
          { error: "Payout ID is required" },
          { status: 400 }
        );
      }

      // Update payout status
      await Payout.findByIdAndUpdate(payoutId, { status: "paid" });

      // Update all commissions in this payout to paid
      const payoutItems = await PayoutItem.find({ payoutId });
      for (const item of payoutItems) {
        await Commission.updateMany(
          { _id: { $in: item.commissionIds } },
          { 
            status: "paid",
            paidPayoutId: payoutId,
          }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Payout marked as paid",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json(
      { error: "Failed to process admin action" },
      { status: 500 }
    );
  }
}