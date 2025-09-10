import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/mail";

// Function to generate a random password
function generateRandomPassword(length: number): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
  let password = "";

  // Ensure at least one character from each type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // number
  password += "@#$%&*"[Math.floor(Math.random() * 6)]; // special char

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// Function to create password reset email HTML
function createPasswordResetEmail(newPassword: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c5530; margin-bottom: 10px;">MY Dating DNA™</h1>
        <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset</h2>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <p style="color: #1f2937; margin-bottom: 15px;">Hello,</p>
        <p style="color: #1f2937; margin-bottom: 15px;">
          We've generated a new password for your MY Dating DNA™ account as requested.
        </p>
        <p style="color: #1f2937; margin-bottom: 20px;"><strong>Your new password is:</strong></p>
        
        <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 2px solid #2c5530; text-align: center; margin-bottom: 20px;">
          <code style="font-size: 18px; font-weight: bold; color: #2c5530; letter-spacing: 1px;">
            ${newPassword}
          </code>
        </div>
        
        <p style="color: #dc2626; font-weight: bold; margin-bottom: 15px;">
          ⚠️ Important Security Notice:
        </p>
        <ul style="color: #1f2937; margin-bottom: 20px;">
          <li>Do not share this password with anyone</li>
          <li>This email contains sensitive information - please delete it after use</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${process.env.NEXTAUTH_URL}/auth" 
           style="background-color: #2c5530; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          Sign In Now
        </a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
          If you didn't request this password reset, please contact our support team immediately.
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          ©${new Date().getFullYear()} MY Dating DNA™. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email address" },
        { status: 404 }
      );
    }

    // Generate new password
    const newPassword = generateRandomPassword(6);
    console.log(newPassword);
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password in database
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    // Send email with new password
    const emailContent = createPasswordResetEmail(newPassword);
    await sendEmail(
      email,
      "Your New Password - MY Dating DNA™",
      emailContent,
      true
    );

    return NextResponse.json(
      {
        message: "New password has been sent to your email address",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
