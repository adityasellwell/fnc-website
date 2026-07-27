import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WishlistPageClient from "@/components/wishlist/WishlistPageClient";

export const metadata = {
  title: "Your Wishlist",
  description: "Products you've saved for later at F&C.",
};

export default function WishlistPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <WishlistPageClient />
      </main>
      <Footer />
    </>
  );
}
