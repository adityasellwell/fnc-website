import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import PromoAutoApply from "@/components/promo/PromoAutoApply";
import { getActivePromotionByCode } from "@/services/promotions";

export async function generateMetadata({ params }) {
  const { code } = await params;
  const promo = await getActivePromotionByCode(code.toUpperCase());
  return { title: promo ? `${promo.title} — F&C` : "Offer — F&C" };
}

function discountLabel(promo) {
  if (promo.discountType === "PERCENT") return `${Number(promo.value)}% OFF`;
  if (promo.discountType === "FLAT") return `₹${Number(promo.value)} OFF`;
  return "Buy One Get One";
}

export default async function PromoCodePage({ params }) {
  const { code } = await params;
  const promo = await getActivePromotionByCode(code.toUpperCase());

  const now = new Date();
  const isExpired = promo?.endsAt && promo.endsAt < now;
  const isNotStartedYet = promo?.startsAt && promo.startsAt > now;
  if (!promo || isExpired || isNotStartedYet) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {promo.code && <PromoAutoApply code={promo.code} />}

        <Section background="offwhite" spacing="md">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
            {promo.bannerImage && (
              <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden border border-bordergray mb-2">
                <Image src={promo.bannerImage} alt={promo.title} fill className="object-cover" priority />
              </div>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-fnc-red text-white font-body text-xs font-bold uppercase tracking-wide px-4 py-1.5">
              <Tag className="h-3.5 w-3.5" />
              {discountLabel(promo)}
            </span>
            <h1 className="font-display text-section-heading font-bold text-charcoal">{promo.title}</h1>
            {promo.description && (
              <p className="font-body text-slate max-w-xl">{promo.description}</p>
            )}
            {promo.code && (
              <p className="font-body text-sm text-slate">
                Code <span className="font-bold text-charcoal">{promo.code}</span> will be applied automatically at checkout.
              </p>
            )}
            <Button href="/shop" size="lg" className="mt-2">
              Shop Now
            </Button>
          </div>

          {promo.scopeProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-10">
              {promo.scopeProducts.map((p) => {
                const images = Array.isArray(p.images) ? p.images : [];
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="bg-white border border-bordergray rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square w-full bg-warmwhite">
                      {images[0] && (
                        <Image src={images[0]} alt={p.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-display font-semibold text-charcoal truncate">{p.name}</p>
                      <p className="font-display font-bold text-charcoal mt-1">₹{Number(p.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>
      </main>
      <Footer />
    </>
  );
}
