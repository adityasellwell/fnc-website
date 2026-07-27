import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";
import { getProductsByCategory } from "@/lib/data/products";

/** Horizontal scrolling carousel — distinct from Ready to Eat's featured+grid
 * layout and Cheese & Dairy's compact list below. */
export default async function ReadyToCook() {
  const products = await getProductsByCategory("ready-to-cook");

  return (
    <Section background="warmwhite">
      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-fnc-red mb-2">
            Ready to Cook
          </p>
          <h2 className="font-display text-section-heading font-bold text-charcoal">
            Marinated. Just cook.
          </h2>
        </div>
        <Button href="/shop/ready-to-cook" variant="outline">
          View All
        </Button>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4 -mx-1 px-1 snap-x">
        {products.map((product) => (
          <div key={product.id} className="w-56 sm:w-64 shrink-0 snap-start">
            <ProductCard product={product} variant="editorial" />
          </div>
        ))}
      </div>
    </Section>
  );
}
