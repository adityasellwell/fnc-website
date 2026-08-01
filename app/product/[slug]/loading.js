import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function ProductDetailLoading() {
  return (
    <main className="flex-1 bg-offwhite min-h-screen animate-pulse">
      {/* Breadcrumb line skeleton */}
      <div className="border-b border-bordergray bg-white py-4">
        <Container>
          <div className="h-4 bg-warmwhite rounded-lg w-32" />
        </Container>
      </div>

      <Section background="offwhite" spacing="md">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Gallery Media Box Skeleton */}
          <div className="aspect-square w-full rounded-3xl bg-warmwhite" />

          {/* Details Skeleton */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-warmwhite rounded-lg w-20" />
              <div className="h-8 bg-warmwhite rounded-lg w-3/4 mt-2" />
              <div className="h-4 bg-warmwhite rounded-lg w-1/2" />
            </div>

            {/* Rating Box */}
            <div className="h-8 bg-warmwhite rounded-lg w-32" />

            {/* Price Box */}
            <div className="h-10 bg-warmwhite rounded-lg w-24" />

            {/* Description Lines */}
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-warmwhite rounded-lg w-full" />
              <div className="h-4 bg-warmwhite rounded-lg w-full" />
              <div className="h-4 bg-warmwhite rounded-lg w-2/3" />
            </div>

            {/* Add to Cart Button Skeleton */}
            <div className="h-12 bg-warmwhite rounded-xl w-48 mt-4" />
          </div>
        </div>
      </Section>
    </main>
  );
}
