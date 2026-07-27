import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Truck,
  Store as StoreIcon,
  Navigation,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import StoreDetailMapWrapper from "@/components/store/StoreDetailMapWrapper";
import { getStoreBySlug, getStores } from "@/lib/data/stores";

function whatsAppLink(phone, message) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return {};

  return {
    title: `${store.name} — F&C Fresh Proteins & More`,
    description: `Visit F&C store at ${store.address}, ${store.city}. View opening hours, timings, phone, WhatsApp ordering options, and get directions.`,
  };
}

// Support pre-generating static paths
export async function generateStaticParams() {
  // Falls back to an empty list if the DB isn't reachable at build time
  // (see the identical comment on app/product/[slug]/page.js for why).
  try {
    const stores = await getStores();
    return stores.map((s) => ({
      slug: s.slug,
    }));
  } catch (error) {
    console.warn("generateStaticParams(/store/[slug]) skipped — DB unreachable at build time:", error.message);
    return [];
  }
}

export default async function StoreDetailPage({ params }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const isActive = store.status === "active";
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.geo.lat},${store.geo.lng}`;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#FAF9F6]">
        {/* Back Link */}
        <div className="border-b border-[#E5E3DD] bg-white py-4">
          <Container>
            <Link
              href="/stores"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-[#6B6B6B] hover:text-[#DC2F26] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all stores
            </Link>
          </Container>
        </div>

        {/* Store Detail Content */}
        <Section background="offwhite" spacing="md">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
            {/* Left Column: Interactive Store Map */}
            <div className="bg-white border border-[#E5E3DD] rounded-3xl overflow-hidden shadow-xs h-[400px] sm:h-[500px]">
              <StoreDetailMapWrapper store={store} />
            </div>

            {/* Right Column: Store Information Details */}
            <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span className="font-body text-xs font-bold text-[#DC2F26] uppercase tracking-wider bg-[#DC2F26]/10 px-2.5 py-1 rounded">
                    {store.city} Store
                  </span>
                  {isActive ? (
                    <span className="rounded-full bg-[#2E6B1F]/10 text-[#2E6B1F] font-body text-xs font-semibold px-3 py-1 shrink-0">
                      Open Now
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#337FC2]/10 text-[#337FC2] font-body text-xs font-semibold px-3 py-1 shrink-0">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1E1E1E] mt-3">
                  {store.name}
                </h1>
              </div>

              <div className="flex flex-col gap-4 font-body text-base text-[#6B6B6B] border-t border-b border-[#E5E3DD] py-5">
                <p className="flex items-start gap-3">
                  <MapPin className="h-5.5 w-5.5 text-[#DC2F26] shrink-0 mt-0.5" />
                  <span>
                    {store.address}, {store.city}, {store.state}
                  </span>
                </p>
                {isActive ? (
                  <>
                    <p className="flex items-center gap-3">
                      <Clock className="h-5.5 w-5.5 text-[#DC2F26] shrink-0" />
                      <span>{store.openingHours?.mon || "7:00 AM - 9:00 PM"}</span>
                    </p>
                    <a
                      href={`tel:${store.phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-3 hover:text-[#DC2F26] transition-colors w-fit"
                    >
                      <Phone className="h-5.5 w-5.5 text-[#DC2F26] shrink-0" />
                      <span>{store.phone}</span>
                    </a>
                  </>
                ) : (
                  <p className="flex items-center gap-3 text-[#337FC2] font-semibold bg-[#337FC2]/5 p-3 rounded-xl border border-[#337FC2]/10">
                    <Clock className="h-5.5 w-5.5 shrink-0" />
                    <span>Opening soon in your city! We are preparing the counter to serve you.</span>
                  </p>
                )}
              </div>

              {isActive && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-display text-base font-bold text-[#1E1E1E]">
                    Services Available
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {store.deliveryAvailable && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#337FC2]/10 text-[#337FC2] font-body text-sm font-semibold px-3 py-1.5">
                        <Truck className="h-4 w-4" />
                        Home Delivery
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1E1E1E]/5 text-[#1E1E1E] font-body text-sm font-semibold px-3 py-1.5">
                      <StoreIcon className="h-4 w-4" />
                      In-Store Pickup
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {isActive ? (
                  <>
                    <Button
                      href={whatsAppLink(store.whatsapp, "Hi! I'd like to place an order.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                      size="lg"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Order on WhatsApp
                    </Button>
                    <Button
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      size="lg"
                      className="flex-1 flex items-center justify-center gap-2 border-[#E5E3DD] hover:border-[#1E1E1E]"
                    >
                      <Navigation className="h-5 w-5 text-[#DC2F26]" />
                      Get Directions
                    </Button>
                  </>
                ) : (
                  <Button
                    href="/franchise"
                    variant="primary"
                    size="lg"
                    className="w-full flex items-center justify-center"
                  >
                    Apply for Franchise here
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
