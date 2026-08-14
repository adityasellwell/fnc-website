import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CATEGORY_META } from "@/lib/constants";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import { getCategoryBySlug, getCategories } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

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
    "shrink-0 rounded-full px-4 py-2 font-body text-sm font-semibold border transition-colors",
    active
      ? "bg-fnc-red text-white border-fnc-red"
      : "bg-white text-charcoal border-bordergray hover:border-charcoal"
  );
}

export default async function ShopCategoryPage({ params, searchParams }) {
  const { category: slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [products, allCategories] = await Promise.all([
    getProductsByCategory(slug),
    getCategories(),
  ]);

  const requestedPage = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginated = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
              src={category.image || CATEGORY_META[slug]?.image || "/images/categories/fish.jpg"}
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
          {/* Category switch row */}
          <div className="flex gap-2 sm:gap-3 mb-8 overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap">
            <Link href="/shop" className={pillClasses(false)}>
              All
            </Link>
            {allCategories.map((c) => (
              <Link
                key={c.id}
                href={`/shop/${c.slug}`}
                className={pillClasses(c.slug === category.slug)}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <p className="font-body text-sm text-slate mb-6">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>

          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-bordergray rounded-2xl bg-white/50 w-full">
              <span className="text-4xl mb-3">🥩</span>
              <h4 className="font-display text-lg font-bold text-charcoal">Fresh stock arriving soon</h4>
              <p className="font-body text-sm text-slate mt-1 max-w-xs">
                We are currently refilling our inventory. In the meantime, feel free to check our other categories above!
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
                const href =
                  page === 1
                    ? `/shop/${category.slug}`
                    : `/shop/${category.slug}?page=${page}`;
                return (
                  <Link
                    key={page}
                    href={href}
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
