import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import StoresListInteractive from "@/components/store/StoresListInteractive";
import { getStores } from "@/lib/data/stores";

export const metadata = {
  title: "Store Locator — F&C Fresh Proteins & More",
  description: "Find an F&C store near you. View locations, timings, phone numbers, and get instant directions to buy fresh proteins.",
};

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#FAF9F6]">
        {/* Header Hero Banner for Stores Page */}
        <div className="bg-[#1E1E1E] text-white py-12 sm:py-16">
          <Container>
            <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#DC2F26] mb-3">
              Locations
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight max-w-xl">
              F&C Stores &amp; Partners
            </h1>
            <p className="font-body text-sm sm:text-base md:text-lg text-white/70 mt-3 max-w-xl">
              Visit our state-of-the-art flagship stores, order for lightning-fast delivery, or pickup in-store.
            </p>
          </Container>
        </div>

        {/* Stores list section */}
        <Section background="offwhite" spacing="md">
          <StoresListInteractive stores={stores} />
        </Section>
      </main>
      <Footer />
    </>
  );
}
