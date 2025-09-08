import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";
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
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Dating DNA Results</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">MY Dating DNA™</h1>
            <h2 style="color: #f1f5f9; margin: 0; font-size: 20px; font-weight: 500; opacity: 0.9;">Your Quick Assessment Results</h2>
          </div>
          
          <!-- Welcome Section -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);">
            <div style="display: inline-block; background: #ffffff; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);">
              <span style="font-size: 40px;">🎉</span>
            </div>
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Congratulations!</h3>
            <p style="color: #475569; line-height: 1.6; margin: 0; font-size: 16px;">
              Thank you for completing our quick assessment! Here's your personalized snapshot of your dating personality.
            </p>
          </div>
          
          <!-- Results Section -->
          <div style="padding: 30px; background-color: #ffffff;">`;

    // Add each question and answer
    Object.entries(answers).forEach(([questionId, answer], index) => {
      const questionText = QUESTION_MAP[questionId] || `Question ${index + 1}`;
      const answerText =
        ANSWER_MAP[questionId]?.[answer as string | number] || answer;

      emailContent += `
        <div style="margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 15px;">
              ${index + 1}
            </div>
            <h3 style="color: #1e293b; margin: 0; font-size: 16px; font-weight: 600; flex: 1;">
              ${questionText}
            </h3>
          </div>
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed;">
            <p style="color: #1e40af; font-weight: 600; margin: 0; font-size: 14px;">
              <span style="color: #64748b; font-weight: 500;">Your Answer:</span> ${answerText}
            </p>
          </div>
        </div>
      `;
    });

    emailContent += `
          </div>
          
          <!-- What's Next Section -->
          <div style="padding: 30px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-top: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                <span style="font-size: 24px;">🚀</span>
              </div>
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">What's Next?</h3>
              <p style="color: #92400e; line-height: 1.6; margin: 0; font-size: 16px;">
                This is just a glimpse into your dating personality! For a complete analysis including:
              </p>
            </div>
            
            <div style="background: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #f59e0b; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="display: flex; align-items: center; padding: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">✨</span>
                  <span style="color: #92400e; font-weight: 500;">Complete Dating DNA type</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">🧠</span>
                  <span style="color: #92400e; font-weight: 500;">Detailed personality insights</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">💪</span>
                  <span style="color: #92400e; font-weight: 500;">Relationship strengths & growth areas</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">📋</span>
                  <span style="color: #92400e; font-weight: 500;">Personalized 30-day action plan</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- CTA Section -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%);">
            <a href="${
              process.env.NEXTAUTH_URL || "http://localhost:3005"
            }/snapshot" 
               style="background: #ffffff; color: #7c3aed; padding: 18px 35px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;">
              🚀 Take the Full Assessment
            </a>
            <p style="color: #f1f5f9; margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
              Unlock your complete dating personality profile
            </p>
          </div>
          
          <!-- Footer -->
          <div style="padding: 25px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
            <div style="margin-bottom: 15px;">
              <span style="color: #7c3aed; font-size: 20px; font-weight: 700;">MY Dating DNA™</span>
            </div>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
              Thank you for exploring your Dating DNA! 🧬
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 MY Dating DNA™. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
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
  
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Format the answers for email
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assessment Complete - MY Dating DNA</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">MY Dating DNA™</h1>
            <h2 style="color: #f0fdf4; margin: 0; font-size: 20px; font-weight: 500; opacity: 0.9;">Assessment Complete! 🎉</h2>
          </div>
          
          <!-- Success Section -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
            <div style="display: inline-block; background: #ffffff; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
              <span style="font-size: 40px;">✅</span>
            </div>
            <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Assessment Completed!</h3>
            <p style="color: #047857; line-height: 1.6; margin: 0; font-size: 16px;">
              Congratulations! You've successfully completed your Dating DNA assessment. Your results are being processed and will be available soon.
            </p>
          </div>
          
          <!-- Premium Section -->
          <div style="padding: 30px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                <span style="font-size: 24px;">💎</span>
              </div>
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Need More Assessments?</h3>
              <p style="color: #92400e; line-height: 1.6; margin: 0; font-size: 16px;">
                If you'd like to take more assessments or explore different aspects of your dating personality, consider upgrading to our premium plan:
              </p>
            </div>
            
            <div style="background: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #f59e0b; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="display: flex; align-items: center; padding: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">🔢</span>
                  <span style="color: #92400e; font-weight: 500;">Unlimited assessments</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">📊</span>
                  <span style="color: #92400e; font-weight: 500;">Detailed analytics</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">🎯</span>
                  <span style="color: #92400e; font-weight: 500;">Personalized insights</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px;">
                  <span style="font-size: 20px; margin-right: 10px;">💬</span>
                  <span style="color: #92400e; font-weight: 500;">AI coaching support</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- CTA Section -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            <a href="${
              process.env.NEXTAUTH_URL || "http://localhost:3005"
            }/subscriptions" 
               style="background: #ffffff; color: #f59e0b; padding: 18px 35px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;">
              💎 Upgrade to Premium
            </a>
            <p style="color: #fef3c7; margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
              Unlock unlimited assessments and premium features
            </p>
          </div>
          
          <!-- Footer -->
          <div style="padding: 25px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
            <div style="margin-bottom: 15px;">
              <span style="color: #7c3aed; font-size: 20px; font-weight: 700;">MY Dating DNA™</span>
            </div>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
              Thank you for using MY Dating DNA™! 🧬
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 MY Dating DNA™. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
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
