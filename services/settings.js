import { db } from "@/lib/db";

const DEFAULT_SETTINGS = {
  id: "singleton",
  deliveryRadiusKm: 5.0,
  deliveryCharge: 50.00,
  minOrderValue: 200.00,
  freeDeliveryThreshold: 500.00,
  zomatoUrl: "",
  swiggyUrl: "",
  socialLinks: { facebook: "", instagram: "", whatsapp: "" },
  businessInfo: {
    name: "F&C — Fresh Proteins & More",
    email: "contact@fncproteins.com",
    phone: "+91 98765 43210",
    address: "Shop No 11, next to Eden Super Mart, Crown Apartment, Hiranandani Estate, Thane West",
  },
  seoTitle: "F&C — Fresh Proteins & More",
  seoDescription: "River and ocean-fresh fish, chicken, crab, eggs, and more in Thane.",
};

/**
 * Retrieves the settings singleton. If not initialized in the database yet,
 * it will create it with system defaults.
 */
export async function getSettings() {
  try {
    const settings = await db.settings.findUnique({
      where: { id: "singleton" },
    });
    if (settings) return settings;

    // Seed defaults if empty
    return await db.settings.create({
      data: DEFAULT_SETTINGS,
    });
  } catch (err) {
    console.error("Failed to retrieve Settings from DB, using fallback defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Updates settings singleton.
 */
export async function updateSettings(data) {
  return db.settings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
}
