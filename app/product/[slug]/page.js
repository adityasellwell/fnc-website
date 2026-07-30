import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronRight, Flame, Snowflake } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import RecipeCard from "@/components/recipe/RecipeCard";
import PlaceholderMedia from "@/components/ui/PlaceholderMedia";
import AddToCartButton from "@/components/product/AddToCartButton";
import BuyNowButton from "@/components/product/BuyNowButton";
import ReviewForm from "@/components/product/ReviewForm";
import { getProductBySlug, getProducts } from "@/lib/data/products";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getRecipeBySlug } from "@/lib/data/recipes";
import { getReviewsForProduct } from "@/lib/data/reviews";
import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} — ₹${product.price} | F&C Fresh Proteins & More`,
    description: product.description,
  };
}

export async function generateStaticParams() {
  // Falls back to an empty list (→ fully on-demand rendering per slug,
  // dynamicParams defaults to true) if the DB isn't reachable at build
  // time — e.g. before a real DATABASE_URL exists yet. Prevents `next
  // build` from hard-failing just because static pre-generation couldn't
  // run; pages still work correctly once requested, and re-enable full
  // SSG automatically once a real DB is connected at build time.
  try {
    const products = await getProducts();
    return products.map((product) => ({ slug: product.slug }));
  } catch (error) {
    console.warn("generateStaticParams(/product/[slug]) skipped — DB unreachable at build time:", error.message);
    return [];
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categorySlug = product.categoryId.replace(/^cat-/, "");
  const [category, allProducts, reviews] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getProducts(),
    getReviewsForProduct(product.id),
  ]);

  const relatedRecipeList = (
    await Promise.all(
      (product.relatedRecipes ?? []).map((recipeSlug) => getRecipeBySlug(recipeSlug))
    )
  ).filter(Boolean);

  const relatedProductList = (product.relatedProducts ?? [])
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean);

  // Per-product photography hasn't been shot yet — fall back to the
  // category's representative image, same as ProductCard.js does across
  // every listing on the site.
  const meta = CATEGORY_META[categorySlug] ?? { icon: "Fish", tone: "red" };

  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: meta.image ? [meta.image] : undefined,
    sku: product.id,
    brand: { "@type": "Brand", name: "F&C" },
    offers: {
      "@type": "Offer",
      url: `/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "/shop" },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: `/shop/${category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 4 : 3,
        name: product.name,
        item: `/product/${product.slug}`,
      },
    ],
  };

  const nutritionRows = [
    ["Calories", product.nutrition?.calories],
    ["Protein", product.nutrition?.protein],
    ["Fat", product.nutrition?.fat],
    ["Carbs", product.nutrition?.carbs],
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
        />

        {/* Breadcrumb */}
        <div className="border-b border-bordergray bg-white py-4">
          <Container>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 font-body text-sm text-slate flex-wrap"
            >
              <Link href="/" className="hover:text-fnc-red transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <Link href="/shop" className="hover:text-fnc-red transition-colors">
                Shop
              </Link>
              {category && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <Link
                    href={`/shop/${category.slug}`}
                    className="hover:text-fnc-red transition-colors"
                  >
                    {category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="text-charcoal font-medium truncate">{product.name}</span>
            </nav>
          </Container>
        </div>

        {/* Main product detail */}
        <Section background="offwhite" spacing="md">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Image */}
            <Reveal
              y={16}
              className="relative aspect-square w-full rounded-3xl overflow-hidden bg-warmwhite border border-bordergray"
            >
              {meta.image ? (
                <Image
                  src={meta.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <PlaceholderMedia
                  icon={meta.icon}
                  tone={meta.tone}
                  label={product.name}
                  className="absolute inset-0"
                  iconClassName="h-20 w-20"
                />
              )}
              {product.tags?.includes("bestseller") && (
                <span className="absolute top-4 left-4 rounded-full bg-fnc-red text-white font-body text-xs font-bold uppercase tracking-wide px-3 py-1.5 shadow-sm">
                  Bestseller
                </span>
              )}
            </Reveal>

            {/* Details */}
            <Reveal delay={0.1} y={16} className="flex flex-col gap-6">
              <div>
                {category && (
                  <Link
                    href={`/shop/${category.slug}`}
                    className="inline-block font-body text-xs font-semibold uppercase tracking-wider text-fnc-red mb-2 hover:underline"
                  >
                    {category.name}
                  </Link>
                )}
                <h1 className="font-display text-section-heading font-bold text-charcoal">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 rounded-full bg-white border border-bordergray px-2.5 py-1">
                    <Star className="h-3.5 w-3.5 fill-fnc-red text-fnc-red" />
                    <span className="font-body text-sm font-semibold text-charcoal">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="font-body text-sm text-slate">
                    ({product.reviewCount} review{product.reviewCount === 1 ? "" : "s"})
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 pb-6 border-b border-bordergray">
                <span className="font-display text-4xl font-bold text-charcoal">
                  ₹{product.price}
                </span>
                <span className="font-body text-base text-slate">/ {product.unit}</span>
              </div>

              <p className="font-body text-body text-slate">{product.description}</p>

              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-warmwhite border border-bordergray px-3 py-1 font-body text-xs font-medium text-charcoal capitalize"
                    >
                      {tag.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <AddToCartButton product={product} image={meta.image} className="w-full sm:w-auto" />
                <BuyNowButton product={product} image={meta.image} className="w-full sm:w-auto" />
              </div>

              {/* Nutrition */}
              <div className="rounded-2xl border border-bordergray bg-white p-5 sm:p-6">
                <h2 className="font-display text-base font-bold text-charcoal mb-4">
                  Nutrition Information
                </h2>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {nutritionRows.map(([label, value]) => (
                    <div key={label}>
                      <p className="font-display text-lg font-bold text-charcoal">
                        {value ?? "—"}
                      </p>
                      <p className="font-body text-[11px] text-slate uppercase tracking-wide mt-1">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking + storage */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-bordergray bg-white p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-fnc-red shrink-0" />
                    <h3 className="font-display text-sm font-bold text-charcoal">
                      Cooking Instructions
                    </h3>
                  </div>
                  <p className="font-body text-sm text-slate">
                    {product.cookingInstructions}
                  </p>
                </div>
                <div className="rounded-2xl border border-bordergray bg-white p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-4 w-4 text-fnc-blue shrink-0" />
                    <h3 className="font-display text-sm font-bold text-charcoal">
                      Storage Instructions
                    </h3>
                  </div>
                  <p className="font-body text-sm text-slate">
                    {product.storageInstructions}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Related products */}
        {relatedProductList.length > 0 && (
          <Section background="white" spacing="md">
            <Reveal>
              <h2 className="font-display text-section-heading font-bold text-charcoal mb-6">
                You Might Also Like
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProductList.map((related, i) => (
                <Reveal key={related.id} delay={i * 0.05}>
                  <ProductCard product={related} />
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* Related recipes */}
        {relatedRecipeList.length > 0 && (
          <Section background="offwhite" spacing="md">
            <Reveal>
              <h2 className="font-display text-section-heading font-bold text-charcoal mb-6">
                Recipes to Try
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {relatedRecipeList.map((recipe, i) => (
                <Reveal key={recipe.id} delay={i * 0.05}>
                  <RecipeCard recipe={recipe} />
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* Reviews */}
        <Section background="white" spacing="md">
          <Reveal className="flex items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-section-heading font-bold text-charcoal">
              Customer Reviews
            </h2>
            <div className="flex items-center gap-1.5 shrink-0">
              <Star className="h-5 w-5 fill-fnc-red text-fnc-red" />
              <span className="font-display text-lg font-bold text-charcoal">
                {product.rating.toFixed(1)}
              </span>
              <span className="font-body text-sm text-slate">
                ({product.reviewCount})
              </span>
            </div>
          </Reveal>

          <div className="mb-6">
            <ReviewForm productId={product.id} />
          </div>

          {reviews.length === 0 ? (
            <p className="font-body text-sm text-slate">
              No reviews yet — be the first to try {product.name}.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-bordergray border-t border-b border-bordergray">
              {reviews.map((review) => (
                <div key={review.id} className="py-5 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-fnc-red/10 text-fnc-red font-display font-bold flex items-center justify-center text-sm">
                      {review.authorName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold text-charcoal truncate">
                        {review.authorName}
                      </p>
                      <p className="font-body text-xs text-slate">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < review.rating
                              ? "fill-fnc-red text-fnc-red"
                              : "text-bordergray"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="font-body text-sm text-slate">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </main>
      <Footer />
    </>
  );
}
