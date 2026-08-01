import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { ProductGridSkeleton } from "@/components/ui/ProductSkeleton";

export default function ShopLoading() {
  return (
    <main className="flex-1 bg-offwhite animate-pulse">
      {/* Dark Hero Header Skeleton */}
      <div className="bg-charcoal text-white py-12 sm:py-16">
        <Container>
          <div className="h-4 bg-white/20 rounded-full w-12 mb-3" />
          <div className="h-8 sm:h-10 bg-white/20 rounded-full w-48 mb-3" />
          <div className="h-4 bg-white/20 rounded-full w-96 max-w-full" />
        </Container>
      </div>

      <Section background="offwhite" spacing="md">
        {/* Category Pills Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-10 w-24 bg-warmwhite rounded-full shrink-0" />
          ))}
        </div>

        {/* Product Grid Skeleton */}
        <ProductGridSkeleton count={10} />
      </Section>
    </main>
  );
}
