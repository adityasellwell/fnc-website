import Image from "next/image";
import Link from "next/link";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { getProductsByCategory } from "@/lib/data/products";
import { CATEGORY_META } from "@/lib/constants";

/** Compact list rows — distinct from Ready to Cook's carousel and Ready to
 * Eat's featured+grid above; dairy/pantry items read better dense than
 * as big photo cards. */
export default async function CheeseDairy() {
  const products = await getProductsByCategory("cheese-dairy");
  const meta = CATEGORY_META["cheese-dairy"];

  return (
    <Section background="warmwhite">
      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-fnc-red mb-2">
            Cheese &amp; Dairy
          </p>
          <h2 className="font-display text-section-heading font-bold text-charcoal">
            The everyday essentials.
          </h2>
        </div>
        <Button href="/shop/cheese-dairy" variant="outline">
          View All
        </Button>
      </div>

      <div className="divide-y divide-bordergray rounded-3xl border border-bordergray bg-white overflow-hidden">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group flex items-center gap-5 p-4 sm:p-5 hover:bg-warmwhite transition-colors"
          >
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden bg-warmwhite shrink-0">
              <Image
                src={meta.image}
                alt={product.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base sm:text-lg font-semibold text-charcoal truncate">
                {product.name}
              </h3>
              <p className="font-body text-sm text-slate">{product.unit}</p>
            </div>
            <p className="font-display text-lg sm:text-xl font-bold text-charcoal shrink-0">
              ₹{product.price}
            </p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
