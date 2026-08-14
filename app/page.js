import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import RecommendationsSection from "@/components/home/RecommendationsSection";
import WhyChooseFC from "@/components/home/WhyChooseFC";
import HealthHygiene from "@/components/home/HealthHygiene";
import StoreSection from "@/components/home/StoreSection";
import FranchiseCTA from "@/components/home/FranchiseCTA";
import Reviews from "@/components/home/Reviews";
import FinalCTA from "@/components/home/FinalCTA";

import { getHeroBanners, getBannersByPlacement } from "@/lib/data/banners";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import PromoStrip from "@/components/home/PromoStrip";

export const metadata = {
  title: "F&C — Fresh Proteins & More",
  description:
    "Premium, hygienically sourced fish, chicken, crab and eggs. Fresh cut daily, cold-chain delivered.",
};

export default async function Home() {
  const [banners, promoBanners, products, categories] = await Promise.all([
    getHeroBanners(),
    getBannersByPlacement("promo_strip"),
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* 2. Hero Image Slider */}
        <Hero banners={banners} />

        {/* 3, 4, 5. Categories and Recommendations Grid */}
        <RecommendationsSection products={products} initialCategories={categories} />

        {/* Promo Strip */}
        <PromoStrip banners={promoBanners} />

        {/* 6. Why Choose F&C */}
        <WhyChooseFC />

        {/* 7. Health & Hygiene */}
        <HealthHygiene />

        {/* Store Locator Map section (Map-based locator above Franchise CTA) */}
        <StoreSection />

        {/* 8. Franchise CTA */}
        <FranchiseCTA />

        {/* 9. Reviews / Testimonials */}
        <Reviews />

        {/* 10. Final CTA Band */}
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
