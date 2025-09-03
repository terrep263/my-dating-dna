import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";
import { headers } from "next/headers";
import User from "@/lib/models/User";

// Question mapping for better readability
const QUESTION_MAP: Record<string, string> = {
  "LM-1": "When meeting new people I usually…",
  "LM-2": "My relationship pace feels best when…",
  "LM-3": "I value long‑term potential over present fit.",
  "LM-4": "I decide with my head more than my heart.",
};

const ANSWER_MAP: Record<string, Record<string | number, string>> = {
  "LM-1": {
    A: "Cast a wide net",
    B: "Keep it selective",
  },
  "LM-2": {
    A: "There's a clear plan",
    B: "It unfolds naturally",
  },
  "LM-3": {
    1: "Strongly Disagree",
    2: "Disagree",
    3: "Somewhat Disagree",
    4: "Neutral",
    5: "Somewhat Agree",
    6: "Agree",
    7: "Strongly Agree",
  },
  "LM-4": {
    1: "Strongly Disagree",
    2: "Disagree",
    3: "Somewhat Disagree",
    4: "Neutral",
    5: "Somewhat Agree",
    6: "Agree",
    7: "Strongly Agree",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, answers } = body;

    if (!email || !answers) {
      return NextResponse.json(
        { error: "Email and answers are required" },
        { status: 400 }
      );
    }

    // Format the answers for email
    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px; font-size: 28px; font-weight: 700;">MY Dating DNA™</h1>
          <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">Your Quick Assessment Results</h2>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 15px; border-left: 5px solid #2c5530; margin-bottom: 25px;">
          <p style="color: #1f2937; line-height: 1.6; margin-bottom: 0; font-size: 16px;">
            🎉 Thank you for completing our quick assessment! Here's a snapshot of your dating personality:
          </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 25px; border-radius: 15px; border: 2px solid #e5e7eb; margin-bottom: 30px;">`;

    // Add each question and answer
    Object.entries(answers).forEach(([questionId, answer], index) => {
      const questionText = QUESTION_MAP[questionId] || `Question ${index + 1}`;
      const answerText =
        ANSWER_MAP[questionId]?.[answer as string | number] || answer;

      emailContent += `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 16px; font-weight: 600;">
            ${index + 1}. ${questionText}
          </h3>
          <div style="background-color: #f0f9ff; padding: 10px; border-radius: 8px; border-left: 3px solid #2c5530;">
            <p style="color: #2c5530; font-weight: 600; margin: 0; font-size: 14px;">
              Your Answer: ${answerText}
            </p>
          </div>
        </div>
      `;
    });

    emailContent += `
        </div>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 15px; border: 2px solid #2c5530; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background-color: #2c5530; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              <span style="color: white; font-size: 20px;">🚀</span>
            </div>
            <h3 style="color: #2c5530; margin: 0; font-size: 20px; font-weight: 600;">What's Next?</h3>
          </div>
          <p style="color: #1f2937; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
            This is just a glimpse into your dating personality! For a complete analysis including:
          </p>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb;">
            <ul style="color: #1f2937; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">✨ Your complete Dating DNA type</li>
              <li style="margin-bottom: 8px;">🧠 Detailed personality insights</li>
              <li style="margin-bottom: 8px;">💪 Relationship strengths and growth areas</li>
              <li style="margin-bottom: 8px;">📋 Personalized 30-day action plan</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL || "http://localhost:3005"}/snapshot" 
             style="background-color: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(44, 85, 48, 0.2);">
            🚀 Take the Full Assessment
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
            Thank you for exploring your Dating DNA! 🧬
          </p>
          <p style="color: #9ca3af; font-size: 12px;">
            © 2024 MY Dating DNA™. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Send email
    await sendEmail(
      email,
      "Your Dating DNA Quick Snapshot",
      emailContent,
      true
    );

    return NextResponse.json({
      success: true,
      message: "Quick assessment email sent successfully",
    });
  } catch (error) {
    console.error("Quick assessment error:", error);
    return NextResponse.json(
      { error: "Failed to send quick assessment email" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id } = await req.json();
    console.log(id);
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Format the answers for email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5530; margin-bottom: 10px; font-size: 28px; font-weight: 700;">MY Dating DNA™</h1>
          <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">Assessment Complete! 🎉</h2>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 15px; border: 2px solid #2c5530; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background-color: #2c5530; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              <span style="color: white; font-size: 20px;">✅</span>
            </div>
            <h3 style="color: #2c5530; margin: 0; font-size: 20px; font-weight: 600;">Assessment Completed!</h3>
          </div>
          <p style="color: #1f2937; line-height: 1.6; margin-bottom: 0; font-size: 16px;">
            Congratulations! You've successfully completed your Dating DNA assessment. Your results are being processed and will be available soon.
          </p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 25px; border-radius: 15px; border: 2px solid #f59e0b; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              <span style="color: white; font-size: 20px;">💎</span>
            </div>
            <h3 style="color: #92400e; margin: 0; font-size: 20px; font-weight: 600;">Need More Assessments?</h3>
          </div>
          <p style="color: #92400e; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
            If you'd like to take more assessments or explore different aspects of your dating personality, consider upgrading to our premium plan:
          </p>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #f59e0b;">
            <ul style="color: #92400e; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">🔢 Unlimited assessments</li>
              <li style="margin-bottom: 8px;">📊 Detailed analytics</li>
              <li style="margin-bottom: 8px;">🎯 Personalized insights</li>
              <li style="margin-bottom: 8px;">💬 AI coaching support</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL || "http://localhost:3005"}/subscriptions" 
             style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);">
            💎 Upgrade to Premium
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
            Thank you for using MY Dating DNA™! 🧬
          </p>
          <p style="color: #9ca3af; font-size: 12px;">
            © 2024 MY Dating DNA™. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    user.attempts -= 1;

    await user.save();

    // Send email
    await sendEmail(
      user.email,
      "Your Dating DNA Assessment done!",
      emailContent,
      true
    );

    return NextResponse.json({
      success: true,
      message: "Assessement done successfully",
    });
  } catch (error) {
    console.error("Quick assessment error:", error);
    return NextResponse.json(
      { error: "Failed to send quick assessment email" },
      { status: 500 }
    );
  }
}
