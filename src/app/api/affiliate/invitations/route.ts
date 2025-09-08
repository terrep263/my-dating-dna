import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import AffiliateInvitation from "@/lib/models/AffiliateInvitation";
import Affiliate from "@/lib/models/Affiliate";
import User from "@/lib/models/User";

// Helper function to generate unique invitation code
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to check if user is admin
async function isUserAdmin(userId: string): Promise<boolean> {
  await connectToDatabase();
  const user = await User.findById(userId);
  return user?.role === 'admin';
}

// GET - Fetch all invitations (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const invitations = await AffiliateInvitation.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      invitations,
    });

  } catch (error) {
    console.error("[API] Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" }, 
      { status: 500 }
    );
  }
}

// POST - Create new invitation (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { maxUses = 1, expiresInDays = 30, inviteeEmail, inviteeName } = await request.json();

    await connectToDatabase();

    // Check current affiliate count
    const currentAffiliateCount = await Affiliate.countDocuments();
    if (currentAffiliateCount >= 50) {
      return NextResponse.json({ 
        error: "Maximum number of affiliates (50) has been reached" 
      }, { status: 400 });
    }

    // Generate unique invitation code
    let invitationCode: string;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      invitationCode = generateInvitationCode();
      const existing = await AffiliateInvitation.findOne({ invitationCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ 
        error: "Failed to generate unique invitation code" 
      }, { status: 500 });
    }

    // Create invitation
    const invitation = new AffiliateInvitation({
      invitationCode: invitationCode!,
      invitedBy: session.user.id,
      expiresAt: new Date(Date.now() + (expiresInDays * 24 * 60 * 60 * 1000)),
      maxUses,
      usedCount: 0,
      isActive: true,
      inviteeEmail: inviteeEmail || null,
      inviteeName: inviteeName || null,
    });

    await invitation.save();

    return NextResponse.json({
      success: true,
      message: "Invitation created successfully",
      invitation: {
        id: invitation._id,
        invitationCode: invitation.invitationCode,
        expiresAt: invitation.expiresAt,
        maxUses: invitation.maxUses,
        inviteeEmail: invitation.inviteeEmail,
        inviteeName: invitation.inviteeName,
      }
    });

  } catch (error) {
    console.error("[API] Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" }, 
      { status: 500 }
    );
  }
}

// PUT - Update invitation (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { invitationId, isActive } = await request.json();

    if (!invitationId) {
      return NextResponse.json({ 
        error: "Invitation ID is required" 
      }, { status: 400 });
    }

    await connectToDatabase();
    
    const invitation = await AffiliateInvitation.findByIdAndUpdate(
      invitationId,
      { isActive },
      { new: true }
    );

    if (!invitation) {
      return NextResponse.json({ 
        error: "Invitation not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Invitation ${isActive ? 'activated' : 'deactivated'} successfully`,
      invitation
    });

  } catch (error) {
    console.error("[API] Error updating invitation:", error);
    return NextResponse.json(
      { error: "Failed to update invitation" }, 
      { status: 500 }
    );
  }
}
