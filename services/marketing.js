import { db } from "@/lib/db";
import { sendSms } from "@/lib/sms";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://fncmumbai.com";
}

const CHECKOUT_ABANDONED_AFTER_MS = 60 * 60 * 1000; // 1 hour
const CHECKOUT_ABANDONED_BEFORE_MS = 48 * 60 * 60 * 1000; // stop bothering after 2 days — a 3-day-old unpaid order is dead, not "abandoned"
const WIN_BACK_INACTIVE_AFTER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days since last order
const WIN_BACK_RESEND_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // at most once every 30 days

/**
 * Texts customers who started checkout (a real Order row exists) but
 * never completed payment. This is the only "abandoned cart" signal that
 * actually exists server-side — the cart itself lives in localStorage
 * only, so the server has no visibility into it before checkout starts.
 */
export async function sendAbandonedCheckoutReminders() {
  const now = Date.now();
  const orders = await db.order.findMany({
    where: {
      status: "PLACED",
      paymentStatus: "PENDING",
      cartReminderSentAt: null,
      createdAt: {
        lte: new Date(now - CHECKOUT_ABANDONED_AFTER_MS),
        gte: new Date(now - CHECKOUT_ABANDONED_BEFORE_MS),
      },
    },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });

  let sent = 0;
  for (const order of orders) {
    if (!order.customer?.phone) continue;
    const result = await sendSms("CART_REMINDER", order.customer.phone, {
      name: order.customer.name || "there",
      url: `${appUrl()}/cart`,
    });
    // Mark as sent regardless of SMS success — a permanently-failing
    // number (bad format, etc.) must not be retried forever every run.
    await db.order.update({ where: { id: order.id }, data: { cartReminderSentAt: new Date() } });
    if (result.success) sent += 1;
  }
  return { checked: orders.length, sent };
}

/**
 * Texts customers with no order in WIN_BACK_INACTIVE_AFTER_MS, using
 * whatever active FLAT-discount coupon currently exists — the approved
 * template reads "Here's Rs {amount} off", which only makes sense for a
 * flat rupee discount, not a percentage. Skips the run entirely (no
 * fabricated discount) if no such coupon is active right now.
 */
export async function sendWinBackMessages() {
  const now = new Date();
  const coupon = await db.promotion.findFirst({
    where: {
      active: true,
      type: "COUPON",
      discountType: "FLAT",
      code: { not: null },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
  });
  if (!coupon) {
    console.warn("[marketing] Win-back skipped — no active FLAT-discount coupon to offer.");
    return { checked: 0, sent: 0, skipped: "no_active_flat_coupon" };
  }

  const inactiveSince = new Date(now.getTime() - WIN_BACK_INACTIVE_AFTER_MS);
  const cooldownCutoff = new Date(now.getTime() - WIN_BACK_RESEND_COOLDOWN_MS);

  const candidates = await db.customer.findMany({
    where: {
      phone: { not: null },
      orders: { none: { createdAt: { gt: inactiveSince } } },
      OR: [{ lastWinBackSmsAt: null }, { lastWinBackSmsAt: { lt: cooldownCutoff } }],
    },
    select: { id: true, name: true, phone: true },
  });

  let sent = 0;
  for (const customer of candidates) {
    const result = await sendSms("WIN_BACK", customer.phone, {
      name: customer.name || "there",
      amount: coupon.value,
      url: `${appUrl()}/promo/${coupon.code}`,
    });
    await db.customer.update({ where: { id: customer.id }, data: { lastWinBackSmsAt: now } });
    if (result.success) sent += 1;
  }
  return { checked: candidates.length, sent };
}
