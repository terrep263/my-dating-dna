import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Affiliate from "@/lib/models/Affiliate";
import AffiliateClick from "@/lib/models/AffiliateClick";

export async function POST(request: NextRequest) {
  try {
    const { affiliateCode, url, ip, userAgent } = await request.json();

    if (!affiliateCode) {
      return NextResponse.json({ error: "Affiliate code is required" }, { status: 400 });
    }

    console.log(`[API] Tracking affiliate click for code: ${affiliateCode}`);

    // Connect to database
    await connectToDatabase();

    // Validate affiliate code
    const affiliate = await Affiliate.findOne({ 
      code: affiliateCode.toUpperCase(), 
      isActive: true 
    });

    if (!affiliate) {
      console.log(`[API] No valid affiliate found for code: ${affiliateCode}`);
      return NextResponse.json({ error: "Invalid affiliate code" }, { status: 404 });
    }

    console.log(`[API] Valid affiliate found:`, affiliate.name);

    // Log the click
    const clickRecord = await AffiliateClick.create({
      affiliateCode: affiliateCode.toUpperCase(),
      url: url || "/",
      ip: ip || "unknown",
      userAgent: userAgent || "unknown",
    });

    console.log(`[API] Click recorded successfully:`, clickRecord._id);

    return NextResponse.json({ 
      success: true, 
      message: "Click tracked successfully",
      affiliate: {
        code: affiliate.code,
        name: affiliate.name
      }
    });

  } catch (error) {
    console.error("[API] Error tracking affiliate click:", error);
    return NextResponse.json(
      { error: "Failed to track affiliate click" }, 
      { status: 500 }
    );
  }
}
