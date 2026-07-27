import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata = {
  title: "Your Cart",
  description: "Review your F&C order before checkout.",
};

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CartPageClient />
      </main>
      <Footer />
    </>
  );
}
