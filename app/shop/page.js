import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import CategoryFilterGrid from "@/components/shop/CategoryFilterGrid";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { logProductSearch } from "@/lib/utils/analytics";
import { cn } from "@/lib/utils";
import { resolveCategoryMeta } from "@/lib/constants";

export const metadata = {
  title: "Shop All Products — F&C Fresh Proteins & More",
  description:
    "Browse fresh fish, chicken, crab, eggs, ready-to-cook and ready-to-eat proteins — hand-cut and packed fresh daily, cold-chain delivered to your door.",
};

function pillClasses(active) {
  return cn(
    "shrink-0 rounded-full px-4 py-2 font-body text-sm font-semibold border transition-all whitespace-nowrap inline-flex items-center justify-center",
    active
      ? "bg-fnc-red text-white border-fnc-red shadow-sm"
      : "bg-white text-charcoal border-bordergray hover:border-charcoal hover:bg-warmwhite"
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

  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Viewing any species pill (top-level or one of its Raw/Snacks
  // subcategories) always rolls up to the full top-level species here —
  // CategoryFilterGrid narrows it down to a specific subcategory
  // client-side, so clicking Raw/Snacks filters in place instead of
  // navigating to a new page.
  const activeCategoryObj = activeCategory ? categories.find((c) => c.slug === activeCategory) : null;
  const topLevelCategoryObj = activeCategoryObj
    ? activeCategoryObj.parentCategoryId
      ? categories.find((c) => c.id === activeCategoryObj.parentCategoryId)
      : activeCategoryObj
    : null;
  const siblingCategories = topLevelCategoryObj
    ? categories.filter((c) => c.parentCategoryId === topLevelCategoryObj.id)
    : [];
  const rollupSlugs = topLevelCategoryObj
    ? [topLevelCategoryObj.slug, ...siblingCategories.map((c) => c.slug)]
    : [];
  const initialSubcategory = activeCategoryObj?.parentCategoryId ? activeCategoryObj.slug : null;

  // categorySlugs covers a product's primary category plus any additional
  // ones it's been listed under; falls back to the single categoryId slug
  // for the mock-data path, which predates it.
  let filtered = activeCategory
    ? allProducts.filter((product) =>
        (product.categorySlugs ?? [product.categoryId?.replace(/^cat-/, "")]).some((s) =>
          rollupSlugs.includes(s)
        )
      )
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

  const categoryMeta = activeCategory && categories.find(c => c.slug === activeCategory);
  const bannerImage = categoryMeta?.image || resolveCategoryMeta(activeCategory, categoryMeta?.parentCategory?.slug).image || "/images/categories/fish.jpg";
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
          {/* Category filter row — top-level only, subcategories get their own pill row below */}
          <div className="flex gap-2 sm:gap-3 mb-4 overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0 flex-nowrap items-center py-1">
            <Link href={buildHref(null, 1, searchQuery)} className={pillClasses(!activeCategory)}>
              All
            </Link>
            {categories.filter((c) => !c.parentCategoryId).map((category) => (
              <Link
                key={category.id}
                href={buildHref(category.slug, 1, searchQuery)}
                className={pillClasses(activeCategory === category.slug || category.id === activeCategoryObj?.parentCategoryId)}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
            {searchQuery && (
              <>
                <p className="font-body text-sm text-slate">
                  {filtered.length} result{filtered.length === 1 ? "" : "s"} for &ldquo;{searchQuery}&rdquo;
                </p>
                <Link href={buildHref(activeCategory, 1, null)} className="font-body text-xs font-semibold text-fnc-red hover:underline">
                  Clear search
                </Link>
              </>
            )}
          </div>

          <CategoryFilterGrid
            products={filtered}
            siblingCategories={siblingCategories}
            topLevelImage={topLevelCategoryObj?.image}
            initialSubcategory={initialSubcategory}
          />
        </Section>
      </main>
      <Footer />
    </>
  );
}
