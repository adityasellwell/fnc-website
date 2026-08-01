import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request) {
  // No auth/session check happens before this — anyone who knows an email
  // address could otherwise trigger unlimited sends to it, which would
  // both spam that inbox and put our own sending domain's reputation at
  // risk with Resend (the exact problem this endpoint exists to fix).
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.success) return rateLimitResponse();

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Generate Firebase email verification link
    const link = await adminAuth.generateEmailVerificationLink(email, {
      url: `${origin}/sign-in?emailVerified=true`,
    });

    // Send email via Resend
    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your email address — F&C",
      html: `
        <div style="font-family: 'Outfit', 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #DC2F26; font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 1px;">F&C</h2>
            <p style="color: #475569; font-size: 14px; margin: 4px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Fresh Proteins & More</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
          <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; text-align: center;">Verify your email address</h1>
          <p style="font-size: 16px; line-height: 24px; color: #334155; margin-bottom: 24px; text-align: center;">
            Thank you for signing up with F&C! To complete your registration and start ordering fresh, high-quality proteins, please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${link}" style="display: inline-block; background-color: #DC2F26; color: #ffffff; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 6px rgba(220, 47, 38, 0.15); font-family: sans-serif;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; line-height: 18px; color: #64748b; text-align: center; margin-bottom: 24px;">
            If the button above doesn't work, you can also copy and paste the following link into your browser:<br />
            <a href="${link}" style="color: #DC2F26; text-decoration: underline; word-break: break-all;">${link}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
          <p style="font-size: 12px; text-align: center; color: #94a3b8; margin: 0;">
            This email was sent to ${email} because an account was registered with this email address. If you did not sign up for F&C, please ignore this email.
          </p>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error("Failed to dispatch email:", emailResult.error);
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/send-verification error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
