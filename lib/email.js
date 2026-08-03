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

// ─────────────────────────────────────────────────────────────
// Refund & Cancellation Email Templates
// All fire-and-forget — never throw, never block the main flow
// ─────────────────────────────────────────────────────────────

const brand = {
  primary: "#C0392B",
  bg: "#FFF8F5",
  text: "#1a1a1a",
  muted: "#6b7280",
};

function baseLayout(content) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: ${brand.bg}; padding: 32px 16px;">
      <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
        <div style="background: ${brand.primary}; padding: 24px 32px;">
          <span style="font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.5px;">F&C Fresh Proteins</span>
        </div>
        <div style="padding: 32px;">
          ${content}
        </div>
        <div style="padding: 16px 32px; border-top: 1px solid #f0f0f0; color: ${brand.muted}; font-size: 12px;">
          © F&C Fresh Proteins. Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/contact" style="color: ${brand.primary};">support page</a>.
        </div>
      </div>
    </div>
  `;
}

/** Sent when customer submits a refund request */
export async function sendRefundRequestConfirmation(customer, order) {
  return sendEmail({
    to: customer.email,
    subject: `Refund Request Received — Order #${order.id.slice(-8).toUpperCase()}`,
    html: baseLayout(`
      <h2 style="font-size: 20px; color: ${brand.text}; margin: 0 0 8px;">We've received your refund request</h2>
      <p style="color: ${brand.muted}; margin: 0 0 24px;">Our team will review it and respond within 24–48 hours.</p>
      <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px;"><strong>Order:</strong> #${order.id.slice(-8).toUpperCase()}</p>
        <p style="margin: 8px 0 0; font-size: 14px;"><strong>Amount:</strong> ₹${Number(order.total).toFixed(2)}</p>
      </div>
      <p style="color: ${brand.muted}; font-size: 13px;">You can track the status of your request from your <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/account/orders/${order.id}" style="color: ${brand.primary};">order page</a>.</p>
    `),
  }).catch(() => {}); // fire-and-forget
}

/** Sent when admin approves refund and Razorpay call succeeds */
export async function sendRefundApprovedEmail(customer, order, amount, razorpayRefundId) {
  return sendEmail({
    to: customer.email,
    subject: `Refund Approved — ₹${Number(amount).toFixed(0)} is on its way`,
    html: baseLayout(`
      <h2 style="font-size: 20px; color: #059669; margin: 0 0 8px;">Your refund has been approved ✓</h2>
      <p style="color: ${brand.muted}; margin: 0 0 24px;">The amount will be credited back to your original payment method within 5–7 business days.</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px;"><strong>Refund Amount:</strong> ₹${Number(amount).toFixed(2)}</p>
        <p style="margin: 8px 0 0; font-size: 14px;"><strong>Order:</strong> #${order.id.slice(-8).toUpperCase()}</p>
        ${razorpayRefundId ? `<p style="margin: 8px 0 0; font-size: 12px; color: ${brand.muted};">Refund ID: ${razorpayRefundId}</p>` : ""}
      </div>
    `),
  }).catch(() => {});
}

/** Sent when admin rejects refund */
export async function sendRefundRejectedEmail(customer, order, adminNotes) {
  return sendEmail({
    to: customer.email,
    subject: `Refund Request Update — Order #${order.id.slice(-8).toUpperCase()}`,
    html: baseLayout(`
      <h2 style="font-size: 20px; color: ${brand.text}; margin: 0 0 8px;">Refund Request Update</h2>
      <p style="color: ${brand.muted}; margin: 0 0 24px;">After reviewing your request, we're unable to process a refund for this order.</p>
      ${adminNotes ? `
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: ${brand.text};"><strong>Reason from our team:</strong></p>
          <p style="margin: 8px 0 0; font-size: 14px; color: ${brand.muted};">${adminNotes}</p>
        </div>
      ` : ""}
      <p style="color: ${brand.muted}; font-size: 13px;">If you believe this is a mistake, please <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/contact" style="color: ${brand.primary};">contact our support team</a>.</p>
    `),
  }).catch(() => {});
}

/** Sent when order is cancelled by customer (auto-refund) */
export async function sendOrderCancelledEmail(customer, order, wasRefunded) {
  return sendEmail({
    to: customer.email,
    subject: `Order Cancelled — #${order.id.slice(-8).toUpperCase()}`,
    html: baseLayout(`
      <h2 style="font-size: 20px; color: ${brand.text}; margin: 0 0 8px;">Your order has been cancelled</h2>
      ${wasRefunded
        ? `<p style="color: ${brand.muted}; margin: 0 0 24px;">Since you had already paid, a full refund of <strong>₹${Number(order.total).toFixed(2)}</strong> has been initiated and will appear in your account within 5–7 business days.</p>`
        : `<p style="color: ${brand.muted}; margin: 0 0 24px;">No payment was charged for this order.</p>`
      }
      <div style="background: #f9f9f9; border-radius: 12px; padding: 20px;">
        <p style="margin: 0; font-size: 14px;"><strong>Order:</strong> #${order.id.slice(-8).toUpperCase()}</p>
      </div>
    `),
  }).catch(() => {});
}

/** Sent once an order reaches DELIVERED/COLLECTED — nudges the customer to leave a review */
export async function sendReviewRequestEmail(customer, order) {
  return sendEmail({
    to: customer.email,
    subject: `How was your order, ${customer.name?.split(" ")[0] || "there"}?`,
    html: baseLayout(`
      <h2 style="font-size: 20px; color: ${brand.text}; margin: 0 0 8px;">Tell us what you thought ⭐</h2>
      <p style="color: ${brand.muted}; margin: 0 0 24px;">Your order #${order.id.slice(-8).toUpperCase()} has been ${order.status === "COLLECTED" ? "collected" : "delivered"}. A quick review helps other customers and helps us improve.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/account/orders/${order.id}" style="display: inline-block; background: ${brand.primary}; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px;">Leave a Review</a>
    `),
  }).catch(() => {});
}
