import Link from "next/link";
import Image from "next/image";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";

export default function PromoStrip({ banners = [] }) {
  if (!banners || banners.length === 0) return null;

  // Render the first active promo banner
  const banner = banners[0];

  return (
    <section className="bg-offwhite py-section-sm overflow-hidden">
      <Container>
        <Reveal y={16}>
          <Link
            href={banner.link || "/shop"}
            className="block relative w-full aspect-[5/1] sm:aspect-[6/1] md:aspect-[8/1] rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 border border-bordergray bg-warmwhite"
          >
            {banner.image ? (
              <Image
                src={banner.image}
                alt={banner.title || "Promotion"}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 bg-charcoal text-white">
                <h3 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="font-body text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            )}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
