import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { getActiveStores } from "@/lib/data/stores";
import { getSettings } from "@/services/settings";
import { getCurrentCustomer } from "@/lib/auth";

export const metadata = {
  title: "Checkout",
  description: "Complete your F&C order — delivery or store pickup.",
};

export default async function CheckoutPage() {
  const [stores, settingsData, customer] = await Promise.all([
    getActiveStores(),
    getSettings(),
    getCurrentCustomer(),
  ]);

  const settings = {
    deliveryRadiusKm: settingsData.deliveryRadiusKm,
    deliveryCharge: Number(settingsData.deliveryCharge),
    minOrderValue: Number(settingsData.minOrderValue),
    freeDeliveryThreshold: Number(settingsData.freeDeliveryThreshold),
    zomatoUrl: settingsData.zomatoUrl || null,
    swiggyUrl: settingsData.swiggyUrl || null,
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />
      <main className="flex-1">
        <CheckoutPageClient
          stores={stores}
          settings={settings}
          savedProfile={customer ? { name: customer.name, phone: customer.phone } : null}
        />
      </main>
      <Footer />
    </>
  );
}
