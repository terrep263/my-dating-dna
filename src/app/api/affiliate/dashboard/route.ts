import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Affiliate from "@/lib/models/Affiliate";
import AffiliateClick from "@/lib/models/AffiliateClick";
import Commission from "@/lib/models/Commission";
import Order from "@/lib/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Get affiliate by email
    const affiliate = await Affiliate.findOne({ 
      email: session.user.email 
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Get clicks count
    const clicksCount = await AffiliateClick.countDocuments({
      affiliateCode: affiliate.code,
    });

    // Get conversions (orders with affiliate code)
    const conversionsCount = await Order.countDocuments({
      affiliateCode: affiliate.code,
    });

    // Get commissions by status
    const commissions = await Commission.aggregate([
      { $match: { affiliateCode: affiliate.code } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalCents: { $sum: "$commissionCents" },
        },
      },
    ]);

    // Get recent commissions
    const recentCommissions = await Commission.find({
      affiliateCode: affiliate.code,
    })
      .populate("orderId")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get next payout ETA (earliest lockAt date for pending commissions)
    const nextPayout = await Commission.findOne({
      affiliateCode: affiliate.code,
      status: "pending",
    }).sort({ lockAt: 1 });

    // Calculate totals
    const stats = {
      pending: { count: 0, totalCents: 0 },
      locked: { count: 0, totalCents: 0 },
      paid: { count: 0, totalCents: 0 },
      void: { count: 0, totalCents: 0 },
    };

    commissions.forEach((commission) => {
      stats[commission._id as keyof typeof stats] = {
        count: commission.count,
        totalCents: commission.totalCents,
      };
    });

    return NextResponse.json({
      success: true,
      affiliate: {
        id: affiliate._id,
        code: affiliate.code,
        name: affiliate.name,
        email: affiliate.email,
        payoutMethod: affiliate.payoutMethod,
        isActive: affiliate.isActive,
      },
      stats: {
        clicks: clicksCount,
        conversions: conversionsCount,
        conversionRate: clicksCount > 0 ? (conversionsCount / clicksCount * 100).toFixed(2) : 0,
        commissions: stats,
        nextPayoutDate: nextPayout?.lockAt || null,
      },
      recentCommissions: recentCommissions.map((commission) => ({
        id: commission._id,
        orderId: commission.orderId,
        baseAmountCents: commission.baseAmountCents,
        commissionCents: commission.commissionCents,
        status: commission.status,
        lockAt: commission.lockAt,
        createdAt: commission.createdAt,
      })),
    });
  } catch (error) {
    console.error("Affiliate dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate dashboard" },
      { status: 500 }
    );
  }
}
