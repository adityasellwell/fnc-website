import Image from "next/image";
import Link from "next/link";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";
import { getProductsByCategory } from "@/lib/data/products";
import { CATEGORY_META } from "@/lib/constants";

/** Featured product + smaller grid — distinct from Ready to Cook's carousel
 * and Cheese & Dairy's compact list below. */
export default async function ReadyToEat() {
  const products = await getProductsByCategory("ready-to-eat");
  const featured = products.find((p) => p.tags.includes("bestseller")) ?? products[0];
  const rest = products.filter((p) => p.id !== featured?.id);
  const meta = CATEGORY_META["ready-to-eat"];

  if (!featured) return null;

  return (
    <Section>
      <div className="mb-8">
        <p className="font-body text-sm font-semibold uppercase tracking-wider text-fnc-red mb-2">
          Ready to Eat
        </p>
        <h2 className="font-display text-section-heading font-bold text-charcoal">
          Heat. Serve. Done.
        </h2>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        <Link
          href={`/product/${featured.slug}`}
          className="group relative rounded-3xl overflow-hidden bg-warmwhite aspect-4/5 lg:aspect-auto"
        >
          <Image
            src={meta.image}
            alt={featured.name}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
              Bestseller
            </p>
            <h3 className="font-display text-2xl font-bold text-white">
              {featured.name}
            </h3>
            <p className="font-display text-xl font-bold text-white mt-2">
              ₹{featured.price}
            </p>
          </div>
        </Link>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {rest.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} variant="editorial" />
          ))}
        </div>
      </div>

      {rest.length > 6 && (
        <div className="mt-6">
          <Button href="/shop/ready-to-eat" variant="outline">
            View All Ready to Eat
          </Button>
        </div>
      )}
    </Section>
  );
}
