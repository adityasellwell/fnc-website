// PowersText HTTP API (DLT-registered SMS) — see https://powerstext.in/sms-panel/http-api.php
// Every template below is copied VERBATIM from the DLT-approved template
// text (including its two typos — a stray "{" before the amount in
// ORDER_CONFIRMED, and a stray '"' before the signature in
// REFUND_INITIATED and CART_REMINDER). DLT scrubbing matches the sent
// message against the approved template character-for-character once
// variables are substituted back in, so "fixing" these typos here would
// make every send fail — they can only be corrected by resubmitting a
// new template on the DLT platform and swapping the ID below.
const SMS_API_URL = "https://powerstext.in/sms-panel/api/http/index.php";

const SMS_TEMPLATES = {
  OTP_VERIFICATION: {
    id: "1777178945781472985",
    route: "TRANS",
    build: ({ otp }) =>
      `Hello ${otp} is your OTP to sign in to F&C Fresh Proteins & More. Valid for 10 minutes. Do not share this code with anyone. ANC H S LLP`,
  },
  ORDER_CONFIRMED: {
    id: "1777178947793872449",
    route: "TRANS",
    build: ({ name, orderId, amount, url }) =>
      `Hi ${name}, your F&C order ${orderId} worth Rs {${amount} is confirmed. Track it: ${url} ANC H S LLP`,
  },
  ORDER_PACKED: {
    id: "1777178947802504175",
    route: "TRANS",
    build: ({ orderId }) =>
      `Your order ${orderId} has been packed fresh and is ready for dispatch. We'll notify you once it's on its way. - F&C ANC H S LLP`,
  },
  OUT_FOR_DELIVERY: {
    id: "1777178947815626390",
    route: "TRANS",
    build: ({ orderId, riderName, otp }) =>
      `Your order ${orderId} is out for delivery with ${riderName}. Delivery OTP: ${otp} ANC H S LLP`,
  },
  ORDER_CANCELLED: {
    id: "1777178947844552070",
    route: "TRANS",
    build: ({ orderId, contact }) =>
      `Your order ${orderId} has been cancelled. If this wasn't you, contact us at ${contact}. - F&C ANC H S LLP`,
  },
  REFUND_INITIATED: {
    id: "1777178947859224984",
    route: "TRANS",
    build: ({ amount, orderId }) =>
      `A refund of Rs ${amount} for order ${orderId} has been initiated. Expect it in your account within 5-7 days." ANC H S LLP`,
  },
  RIDER_HANDOFF_OTP: {
    id: "1777178947870127565",
    route: "TRANS",
    build: ({ otp, orderId }) =>
      `Share this code with your delivery partner on arrival to confirm receipt: ${otp}. Order ${orderId}. ANC H S LLP`,
  },
  DELIVERED: {
    id: "1777178948083947565",
    route: "TRANS",
    build: ({ orderId, url }) =>
      `Delivered! Order ${orderId} has reached you. Enjoy your fresh picks. Rate your experience: ${url} ANC H S LLP`,
  },
  NEW_OFFER: {
    id: "1777178947893490994",
    route: "PROMO",
    build: ({ discount, code, validTill }) =>
      `Get ${discount} off on fresh fish & chicken! Use code ${code} at checkout. Valid till ${validTill}. Reply STOP to opt out. ANC H S LLP`,
  },
  FESTIVAL_SALE: {
    id: "1777178947905123488",
    route: "PROMO",
    build: ({ festivalName, url }) =>
      `${festivalName} Sale is live at F&C! Fresh catch, festive prices. Shop now: ${url}. Reply STOP to opt out. ANC H S LLP`,
  },
  CART_REMINDER: {
    id: "1777178948087033678",
    route: "PROMO",
    build: ({ name, url }) =>
      `Hii,${name}, your cart is still fresh! Complete your order now: ${url}. Reply STOP to opt out." ANC H S LLP`,
  },
  WIN_BACK: {
    id: "1777178948090714105",
    route: "PROMO",
    build: ({ name, amount, url }) =>
      `It's been a while, ${name}! Here's Rs ${amount} off your next order: ${url}. Reply STOP to opt out. ANC H S LLP`,
  },
  BACK_IN_STOCK: {
    id: "1777178948094022928",
    route: "PROMO",
    build: ({ productName, url }) =>
      `Hi ${productName} is back in stock at F&C! Grab it before it's gone: ${url}. Reply STOP to opt out. ANC H S LLP`,
  },
};

// Indian mobile numbers only — the API expects a bare 10-digit number,
// no country code/leading zero. Strips whatever formatting the caller
// happens to have (spaces, +91, a leading 0) instead of trusting it.
function normalizeMobile(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * @param {keyof typeof SMS_TEMPLATES} templateKey
 * @param {string} mobile
 * @param {Record<string,string>} vars
 * @returns {Promise<{success:boolean, mock?:boolean, data?:any, error?:any}>}
 */
export async function sendSms(templateKey, mobile, vars = {}) {
  const template = SMS_TEMPLATES[templateKey];
  if (!template) {
    console.error(`[SMS] Unknown template key: ${templateKey}`);
    return { success: false, error: "Unknown template" };
  }

  const message = template.build(vars);
  const mobileNumber = normalizeMobile(mobile);

  if (!process.env.SMS_API_USERNAME || !process.env.SMS_API_KEY || !process.env.SMS_SENDER_ID) {
    console.warn(`[SMS Mock] ${templateKey} to ${mobileNumber} would have been sent: "${message}"`);
    return { success: true, mock: true };
  }

  try {
    const params = new URLSearchParams({
      username: process.env.SMS_API_USERNAME,
      apikey: process.env.SMS_API_KEY,
      apirequest: "Text",
      sender: process.env.SMS_SENDER_ID,
      route: template.route,
      mobile: mobileNumber,
      message,
      TemplateID: template.id,
      format: "JSON",
    });

    const res = await fetch(`${SMS_API_URL}?${params.toString()}`, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => null);

    // Confirmed via a real test send: success looks like
    // {"status":"success","message-id":[...],"message":"SMS Sent Successfully"}
    // — the panel returns HTTP 200 either way, so status alone (not the
    // HTTP code) is what tells success from failure.
    const failed = !res.ok || data?.status?.toLowerCase() !== "success";
    if (failed) {
      console.error(`[SMS] ${templateKey} to ${mobileNumber} failed:`, data);
      return { success: false, error: data };
    }
    return { success: true, data };
  } catch (error) {
    console.error(`[SMS] ${templateKey} to ${mobileNumber} threw:`, error);
    return { success: false, error };
  }
}
