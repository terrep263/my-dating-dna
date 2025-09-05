import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Affiliate from "@/lib/models/Affiliate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const body = await request.json();
    const { name, code, payoutMethod } = body;

    if (!name || !code || !payoutMethod) {
      return NextResponse.json(
        { error: "Name, code, and payout method are required" },
        { status: 400 }
      );
    }

    // Check if affiliate code already exists
    const existingAffiliate = await Affiliate.findOne({ 
      code: code.toUpperCase() 
    });

    if (existingAffiliate) {
      return NextResponse.json(
        { error: "Affiliate code already exists" },
        { status: 400 }
      );
    }

    // Check if email already has an affiliate account
    const existingEmail = await Affiliate.findOne({ 
      email: session.user.email 
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "You already have an affiliate account" },
        { status: 400 }
      );
    }

    // Create new affiliate
    const affiliate = await Affiliate.create({
      code: code.toUpperCase(),
      name,
      email: session.user.email,
      payoutMethod,
      isActive: true,
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
    });
  } catch (error) {
    console.error("Affiliate registration error:", error);
    return NextResponse.json(
      { error: "Failed to register affiliate" },
      { status: 500 }
    );
  }
}
