import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      subscription: {
        plan: "free",
        status: "inactive",
        startDate: "",
        endDate: "", // 30 days from now
      },
    });

    // Create beautiful welcome email
    const welcomeEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px; font-size: 28px; font-weight: 700;">MY Dating DNA™</h1>
          <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">Welcome to the Family! 🎉</h2>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 15px; border: 2px solid #2c5530; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background-color: #2c5530; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              <span style="color: white; font-size: 20px;">👋</span>
            </div>
            <h3 style="color: #2c5530; margin: 0; font-size: 20px; font-weight: 600;">Hello ${name}!</h3>
          </div>
          <p style="color: #1f2937; line-height: 1.6; margin-bottom: 0; font-size: 16px;">
            Welcome to MY Dating DNA™! We're thrilled to have you join our community of people who are committed to understanding themselves and building healthier relationships.
          </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 25px; border-radius: 15px; border: 2px solid #e5e7eb; margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin-bottom: 20px; font-size: 18px; font-weight: 600;">🚀 What You Can Do Now:</h3>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb;">
            <ul style="color: #1f2937; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 12px;">🧬 <strong>Take Your Dating DNA Assessment</strong> - Discover your unique relationship patterns</li>
              <li style="margin-bottom: 12px;">📚 <strong>Explore Our Education Hub</strong> - Learn from expert relationship insights</li>
              <li style="margin-bottom: 12px;">💬 <strong>Chat with Grace AI</strong> - Get personalized relationship coaching</li>
              <li style="margin-bottom: 12px;">📊 <strong>Track Your Progress</strong> - Monitor your relationship growth journey</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #fef3c7; padding: 25px; border-radius: 15px; border: 2px solid #f59e0b; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              <span style="color: white; font-size: 20px;">💎</span>
            </div>
            <h3 style="color: #92400e; margin: 0; font-size: 20px; font-weight: 600;">Start Your Journey</h3>
          </div>
          <p style="color: #92400e; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
            Ready to dive deep into understanding your dating personality? Start with our comprehensive assessment:
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL || "http://localhost:3005"}/snapshot" 
             style="background-color: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(44, 85, 48, 0.2);">
            🚀 Start Your Assessment
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.NEXTAUTH_URL || "http://localhost:3005"}/education" 
             style="background-color: #ffffff; color: #2c5530; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px; display: inline-block; border: 2px solid #2c5530; margin: 0 10px;">
            📚 Explore Education Hub
          </a>
          <a href="${process.env.NEXTAUTH_URL || "http://localhost:3005"}/mydatingdna" 
             style="background-color: #ffffff; color: #2c5530; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px; display: inline-block; border: 2px solid #2c5530; margin: 0 10px;">
            💬 Chat with Grace
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
            We're excited to be part of your relationship journey! 🧬💕
          </p>
          <p style="color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} MY Dating DNA™. All rights reserved.
          </p>
        </div>
      </div>
    `;
    
    await sendEmail(email, "Welcome to MY Dating DNA™ - Let's Start Your Journey!", welcomeEmailContent, true);
    await user.save();
    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
