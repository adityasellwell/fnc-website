import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import FncLoader from "@/components/ui/FncLoader";
import { ProductGridSkeleton } from "@/components/ui/ProductSkeleton";

export default function CategoryLoading() {
  return (
    <main className="flex-1 bg-offwhite">
      {/* Dark Hero Header Skeleton */}
      <div className="bg-charcoal text-white py-12 sm:py-16">
        <Container>
          <div className="h-4 bg-white/20 rounded-full w-24 mb-3 animate-pulse" />
          <div className="h-8 sm:h-10 bg-white/20 rounded-full w-48 mb-3 animate-pulse" />
          <div className="h-4 bg-white/20 rounded-full w-96 max-w-full animate-pulse" />
        </Container>
      </div>

      <Section background="offwhite" spacing="md">
        <FncLoader text="Loading fresh category items..." className="py-8" />
        <ProductGridSkeleton count={8} />
      </Section>
    </main>
  );
}
