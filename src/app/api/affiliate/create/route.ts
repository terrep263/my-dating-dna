import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Affiliate from "@/lib/models/Affiliate";

export async function POST(request: NextRequest) {
  try {
    const { code, name, email, payoutMethod } = await request.json();

    if (!code || !name || !email || !payoutMethod) {
      return NextResponse.json({ 
        error: "Missing required fields: code, name, email, payoutMethod" 
      }, { status: 400 });
    }

    console.log(`[API] Creating affiliate with code: ${code}`);

    // Connect to database
    await connectToDatabase();

    // Check if affiliate already exists
    const existingAffiliate = await Affiliate.findOne({ code: code.toUpperCase() });
    if (existingAffiliate) {
      return NextResponse.json({ 
        error: "Affiliate with this code already exists" 
      }, { status: 409 });
    }

    // Create new affiliate
    const affiliate = new Affiliate({
      code: code.toUpperCase(),
      name,
      email: email.toLowerCase(),
      payoutMethod,
      isActive: true
    });

    await affiliate.save();

    console.log(`[API] Affiliate created successfully:`, affiliate._id);

    return NextResponse.json({ 
      success: true, 
      message: "Affiliate created successfully",
      affiliate: {
        id: affiliate._id,
        code: affiliate.code,
        name: affiliate.name,
        email: affiliate.email
      }
    });

  } catch (error) {
    console.error("[API] Error creating affiliate:", error);
    return NextResponse.json(
      { error: "Failed to create affiliate" }, 
      { status: 500 }
    );
  }
}
