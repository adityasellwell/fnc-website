import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { resolveCategoryMeta } from "@/lib/constants";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import CategoryFilterGrid from "@/components/shop/CategoryFilterGrid";
import { getCategoryBySlug, getCategories } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: `${category.name} — Shop Fresh ${category.name} | F&C`,
    description: category.description,
  };
}

export async function generateStaticParams() {
  // Falls back to an empty list if the DB isn't reachable at build time
  // (see the identical comment on app/product/[slug]/page.js for why).
  try {
    const categories = await getCategories();
    return categories.map((category) => ({ category: category.slug }));
  } catch (error) {
    console.warn("generateStaticParams(/shop/[category]) skipped — DB unreachable at build time:", error.message);
    return [];
  }
}

function pillClasses(active) {
  return cn(
    "shrink-0 rounded-full px-4 py-2 font-body text-sm font-semibold border transition-all whitespace-nowrap inline-flex items-center justify-center",
    active
      ? "bg-fnc-red text-white border-fnc-red shadow-sm"
      : "bg-white text-charcoal border-bordergray hover:border-charcoal hover:bg-warmwhite"
  );
}

export default async function ShopCategoryPage({ params }) {
  const { category: slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const allCategories = await getCategories();

  // The sibling pill row (Raw/Snacks) and the grid both key off the
  // top-level species, not off whichever subcategory page is currently
  // open — the full species rollup is fetched once here, and pill clicks
  // just filter it client-side (CategoryFilterGrid) instead of navigating
  // to a new page (new banner, new fetch, scroll reset).
  const topLevelCategory = category.parentCategoryId
    ? allCategories.find((c) => c.id === category.parentCategoryId)
    : category;
  const siblingCategories = topLevelCategory
    ? allCategories.filter((c) => c.parentCategoryId === topLevelCategory.id)
    : [];
  const products = await getProductsByCategory(
    topLevelCategory?.slug ?? slug,
    siblingCategories.map((c) => c.slug)
  );
  const initialSubcategory = category.parentCategoryId ? category.slug : null;

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "/shop" },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `/shop/${category.slug}`,
      },
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
              src={category.image || resolveCategoryMeta(slug, category.parentCategory?.slug).image || "/images/categories/fish.jpg"}
              alt={category.name}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

          <Container className="relative z-20">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 font-body text-xs text-white/75 mb-4"
            >
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/shop" className="hover:text-white transition-colors">
                Shop
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-white font-semibold">{category.name}</span>
            </nav>

            <div className="max-w-xl">
              <span className="inline-block bg-fnc-red text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-4">
                Fresh Category
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                {category.name}
              </h1>
              <p className="font-body text-sm sm:text-base text-white/95 mt-3 leading-relaxed max-w-lg">
                {category.description || `Hygienically cleaned and freshly cut ${category.name.toLowerCase()} for the perfect culinary experience.`}
              </p>
            </div>
          </Container>
        </div>

        <Section background="offwhite" spacing="sm">
          {/* Category switch row — top-level categories only */}
          <div className="flex gap-2 sm:gap-3 mb-4 overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0 flex-nowrap items-center py-1">
            <Link href="/shop" className={pillClasses(false)}>
              All
            </Link>
            {allCategories.filter((c) => !c.parentCategoryId).map((c) => (
              <Link
                key={c.id}
                href={`/shop/${c.slug}`}
                className={pillClasses(c.slug === category.slug || c.id === category.parentCategoryId)}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <CategoryFilterGrid
            products={products}
            siblingCategories={siblingCategories}
            topLevelImage={topLevelCategory?.image}
            initialSubcategory={initialSubcategory}
          />
        </Section>
      </main>
      <Footer />
    </>
  );
}
