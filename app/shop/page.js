import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { logProductSearch } from "@/lib/utils/analytics";
import { cn } from "@/lib/utils";
import { CATEGORY_META } from "@/lib/constants";

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

function buildHref(category, page, search) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  if (search) params.set("search", search);
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const activeCategory = sp?.category ?? null;
  const searchQuery = sp?.search?.trim() || null;
  const requestedPage = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1);

  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  let filtered = activeCategory
    ? allProducts.filter((product) => product.categoryId === `cat-${activeCategory}`)
    : allProducts;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
    // Fire-and-forget — mirrors the same capture /api/products does, so
    // every real search (not just API callers) shows up in SearchLog.
    logProductSearch({ query: searchQuery, results: filtered.length });
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const categoryMeta = activeCategory && categories.find(c => c.slug === activeCategory);
  const bannerImage = categoryMeta?.image || CATEGORY_META[activeCategory]?.image || "/images/categories/fish.jpg";
  const bannerTitle = categoryMeta ? categoryMeta.name : "All Products";
  const bannerDescription = categoryMeta
    ? (categoryMeta.description || `Hygienically cleaned and freshly cut ${categoryMeta.name.toLowerCase()} for the perfect culinary experience.`)
    : "Premium, hygienically sourced fresh proteins. Expertly cut, vacuum packed, and delivered to your doorstep in temperature-controlled bags.";

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

        {/* Hero Banner with Background Image (Licious style) */}
        <div className="relative bg-charcoal text-white overflow-hidden py-14 sm:py-20">
          {/* Background image */}
          <div className="absolute inset-0 z-0 opacity-70">
            <Image
              src={bannerImage}
              alt={bannerTitle}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

          <Container className="relative z-20">
            <div className="max-w-xl">
              <span className="inline-block bg-fnc-red text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-4">
                100% Fresh Daily
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                {bannerTitle}
              </h1>
              <p className="font-body text-sm sm:text-base text-white/95 mt-3 leading-relaxed max-w-lg">
                {bannerDescription}
              </p>
            </div>
          </Container>
        </div>

        <Section background="offwhite" spacing="sm">
          {/* Category filter row */}
          <div className="flex gap-2 sm:gap-3 mb-8 overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap">
            <Link href={buildHref(null, 1, searchQuery)} className={pillClasses(!activeCategory)}>
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={buildHref(category.slug, 1, searchQuery)}
                className={pillClasses(activeCategory === category.slug)}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <p className="font-body text-sm text-slate">
              {searchQuery ? (
                <>
                  {filtered.length} result{filtered.length === 1 ? "" : "s"} for &ldquo;{searchQuery}&rdquo;
                </>
              ) : (
                <>
                  {filtered.length} product{filtered.length === 1 ? "" : "s"}
                </>
              )}
            </p>
            {searchQuery && (
              <Link href={buildHref(activeCategory, 1, null)} className="font-body text-xs font-semibold text-fnc-red hover:underline">
                Clear search
              </Link>
            )}
          </div>

          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-bordergray rounded-2xl bg-white/50 w-full">
              <span className="text-4xl mb-3">🥩</span>
              <h4 className="font-display text-lg font-bold text-charcoal">Fresh stock arriving soon</h4>
              <p className="font-body text-sm text-slate mt-1 max-w-xs">
                We are currently refilling our inventory. In the meantime, try a different search term or check other categories!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {paginated.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 0.05}>
                  <ProductCard product={product} variant="kinetic" />
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
                    href={buildHref(activeCategory, page, searchQuery)}
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
