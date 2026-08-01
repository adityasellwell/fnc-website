import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export async function sendEmail({ to, subject, html }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn(`[Resend Mock] Email to ${to} would have been sent: "${subject}"`);
      return { success: true, mock: true };
    }
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "F&C Fresh Proteins <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return { success: false, error };
  }
}
