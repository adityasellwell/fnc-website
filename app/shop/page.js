import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export const metadata = {
  title: "Shop All Products — F&C Fresh Proteins & More",
  description:
    "Browse fresh fish, chicken, crab, eggs, ready-to-cook and ready-to-eat proteins — hand-cut and packed fresh daily, cold-chain delivered to your door.",
};

function pillClasses(active) {
  return cn(
    "shrink-0 rounded-full px-4 py-2 font-body text-sm font-semibold border transition-colors",
    active
      ? "bg-fnc-red text-white border-fnc-red"
      : "bg-white text-charcoal border-bordergray hover:border-charcoal"
  );
}

function buildHref(category, page) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const activeCategory = sp?.category ?? null;
  const requestedPage = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1);

  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const filtered = activeCategory
    ? allProducts.filter((product) => product.categoryId === `cat-${activeCategory}`)
    : allProducts;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "/shop" },
    ],
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
        />

        {/* Hero */}
        <div className="bg-charcoal text-white py-12 sm:py-16">
          <Container>
            <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
              Shop
            </p>
            <h1 className="font-display text-hero sm:text-section-heading-lg font-extrabold tracking-tight max-w-2xl">
              All Products
            </h1>
            <p className="font-body text-body text-white/70 mt-3 max-w-xl">
              Fresh fish, chicken, crab, eggs and more — cut and packed fresh
              every morning, delivered cold-chain to your door.
            </p>
          </Container>
        </div>

        <Section background="offwhite" spacing="md">
          {/* Category filter row */}
          <div className="flex gap-2 sm:gap-3 mb-8 overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap">
            <Link href={buildHref(null, 1)} className={pillClasses(!activeCategory)}>
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={buildHref(category.slug, 1)}
                className={pillClasses(activeCategory === category.slug)}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <p className="font-body text-sm text-slate mb-6">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </p>

          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-bordergray rounded-2xl">
              <p className="font-display text-lg font-bold text-charcoal">
                No products found
              </p>
              <p className="font-body text-sm text-slate mt-1 max-w-xs">
                Try a different category, or check back soon — we&apos;re adding
                new products all the time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {paginated.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 0.05}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex flex-wrap items-center justify-center gap-2 mt-10"
            >
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <Link
                    key={page}
                    href={buildHref(activeCategory, page)}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={cn(
                      "h-10 w-10 flex items-center justify-center rounded-full font-body text-sm font-semibold border transition-colors",
                      page === currentPage
                        ? "bg-fnc-red text-white border-fnc-red"
                        : "bg-white text-charcoal border-bordergray hover:border-charcoal"
                    )}
                  >
                    {page}
                  </Link>
                );
              })}
            </nav>
          )}
        </Section>
      </main>
      <Footer />
    </>
  );
}
