import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Affiliate from "@/lib/models/Affiliate";
import AffiliateInvitation from "@/lib/models/AffiliateInvitation";

export async function POST(request: NextRequest) {
  try {
    const { code, name, email, payoutMethod, invitationCode } = await request.json();

    if (!code || !name || !email || !payoutMethod || !invitationCode) {
      return NextResponse.json({ 
        error: "Missing required fields: code, name, email, payoutMethod, invitationCode" 
      }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Check current affiliate count
    const currentAffiliateCount = await Affiliate.countDocuments();
    if (currentAffiliateCount >= 50) {
      return NextResponse.json({ 
        error: "Sorry! We've reached our maximum of 50 affiliates. Please contact support if you believe this is an error." 
      }, { status: 400 });
    }

    // Validate invitation code
    const invitation = await AffiliateInvitation.findOne({
      invitationCode: invitationCode.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return NextResponse.json({ 
        error: "Invalid or expired invitation code. Please contact support for a valid invitation." 
      }, { status: 400 });
    }

    // Check if invitation has remaining uses
    if (invitation.usedCount >= invitation.maxUses) {
      return NextResponse.json({ 
        error: "This invitation code has already been used the maximum number of times." 
      }, { status: 400 });
    }

    // If invitation is email-specific, validate email
    if (invitation.inviteeEmail && invitation.inviteeEmail !== email.toLowerCase()) {
      return NextResponse.json({ 
        error: "This invitation code is reserved for a different email address." 
      }, { status: 400 });
    }

    // Check if affiliate already exists
    const existingAffiliate = await Affiliate.findOne({ code: code.toUpperCase() });
    if (existingAffiliate) {
      return NextResponse.json({ 
        error: "Affiliate with this code already exists" 
      }, { status: 409 });
    }

    // Check if email already has an affiliate account
    const existingEmailAffiliate = await Affiliate.findOne({ email: email.toLowerCase() });
    if (existingEmailAffiliate) {
      return NextResponse.json({ 
        error: "An affiliate account with this email already exists" 
      }, { status: 409 });
    }

    // Create new affiliate
    const affiliate = new Affiliate({
      code: code.toUpperCase(),
      name,
      email: email.toLowerCase(),
      payoutMethod,
      isActive: true,
      invitationCode: invitation.invitationCode // Track which invitation was used
    });

    await affiliate.save();

    // Update invitation usage count
    invitation.usedCount += 1;
    await invitation.save();

    return NextResponse.json({ 
      success: true, 
      message: "Affiliate account created successfully! Welcome to our program.",
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
      { error: "Failed to create affiliate account. Please try again." }, 
      { status: 500 }
    );
  }
}