import https from "https";
import dotenv from "dotenv";

dotenv.config();

const targetPhone = "9833379781";

// Ensure environment variables are loaded or fallback to known credentials
const username = process.env.SMS_API_USERNAME || "fncmumbai";
const apikey = process.env.SMS_API_KEY || "F6D62-8CC12";
const sender = process.env.SMS_SENDER_ID || "FNCMUM";

const SMS_API_URL = "https://powerstext.in/sms-panel/api/http/index.php";

async function sendTestSms(templateKey, templateId, message, route = "TRANS") {
  console.log(`📱 Sending ${templateKey} to ${targetPhone}...`);
  console.log(`   Message: "${message}"`);

  const params = new URLSearchParams({
    username,
    apikey,
    apirequest: "Text",
    sender,
    route,
    mobile: targetPhone,
    message,
    TemplateID: templateId,
    format: "JSON",
  });

  const fullUrl = `${SMS_API_URL}?${params.toString()}`;

  return new Promise((resolve) => {
    const req = https.get(fullUrl, { rejectUnauthorized: false, timeout: 10000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        let data = null;
        try { data = JSON.parse(body); } catch (e) {}
        console.log(`   Result:`, data || body);
        console.log(`   --------------------------------------------------\n`);
        resolve(data);
      });
    });
    req.on("error", (err) => {
      console.error(`   Error:`, err.message);
      resolve(null);
    });
  });
}

async function runLiveTest() {
  console.log("=================================================");
  console.log(`🚀 LIVE SMS DISPATCH TEST TO ${targetPhone}`);
  console.log("=================================================\n");

  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const testOrderId = `ORD-${Date.now().toString().slice(-6)}`;
  const testAmount = "499";

  // 1. Test OTP SMS
  await sendTestSms(
    "OTP_VERIFICATION",
    "1777178945781472985",
    `Hello ${testOtp} is your OTP to sign in to F&C Fresh Proteins & More. Valid for 10 minutes. Do not share this code with anyone. ANC H S LLP`
  );

  // 2. Test Order Confirmed SMS
  await sendTestSms(
    "ORDER_CONFIRMED",
    "1777178947793872449",
    `Hi Aditya, your F&C order ${testOrderId} worth Rs {${testAmount} is confirmed. Track it: https://fncmumbai.com/account/orders/${testOrderId} ANC H S LLP`
  );

  // 3. Test Out For Delivery SMS
  await sendTestSms(
    "OUT_FOR_DELIVERY",
    "1777178947815626390",
    `Your order ${testOrderId} is out for delivery with Ramesh Rider. Delivery OTP: 4829 ANC H S LLP`
  );

  // 4. Test Refund Initiated SMS
  await sendTestSms(
    "REFUND_INITIATED",
    "1777178947859224984",
    `A refund of Rs ${testAmount} for order ${testOrderId} has been initiated. Expect it in your account within 5-7 days." ANC H S LLP`
  );

  console.log("=================================================");
  console.log("✅ ALL TEST SMS MESSAGES DISPATCHED TO YOUR PHONE!");
  console.log("=================================================");
}

runLiveTest();
