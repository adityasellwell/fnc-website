import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { getActiveStores } from "@/lib/data/stores";

export const metadata = {
  title: "Checkout",
  description: "Complete your F&C order — delivery or store pickup.",
};

export default async function CheckoutPage() {
  const stores = await getActiveStores();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CheckoutPageClient stores={stores} />
      </main>
      <Footer />
    </>
  );
}
