import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronRight, Flame, Snowflake, ShieldCheck, PackageCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import RecipeCard from "@/components/recipe/RecipeCard";
import PlaceholderMedia from "@/components/ui/PlaceholderMedia";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import ReviewForm from "@/components/product/ReviewForm";
import ProductMediaGallery from "@/components/product/ProductMediaGallery";
import StoreAvailabilityBadge from "@/components/product/StoreAvailabilityBadge";
import DeliveryPartnerSelect from "@/components/store/DeliveryPartnerSelect";
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

  const categorySlug = (product.categoryId || "").replace(/^cat-/, "");
  const [category, allProducts, reviews] = await Promise.all([
    categorySlug ? getCategoryBySlug(categorySlug) : null,
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

  const recipeMedia = relatedRecipeList
    .filter((r) => r.image)
    .map((r) => ({
      id: `recipe-${r.slug}`,
      type: "IMAGE",
      url: r.image,
      title: `Recipe Idea: ${r.title}`,
    }));
  const combinedMedia = [...(product.media || []), ...recipeMedia];

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

  const rawNutrition = product.nutrition || {};
  const nutritionRows = [
    ["Calories", rawNutrition.calories],
    ["Protein", rawNutrition.protein],
    ["Fat", rawNutrition.fat],
    ["Carbs", rawNutrition.carbs],
  ].filter(([, val]) => val !== null && val !== undefined && String(val).trim() !== "");

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

        {/* Main product detail — spacing="sm" here (not "md") since this
            follows the breadcrumb bar directly, not open page whitespace;
            the image column is capped to a max width so it can't tower
            over a short content column on wide screens. */}
        <Section background="offwhite" spacing="sm">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
            {/* Image */}
            <Reveal y={16} className="relative w-full lg:max-w-[520px]">
              <ProductMediaGallery
                media={combinedMedia}
                fallbackImage={meta.image}
                productName={product.name}
              />
              {product.tags?.includes("bestseller") && (
                <span className="absolute top-4 left-4 rounded-full bg-fnc-red text-white font-body text-xs font-bold uppercase tracking-wide px-3 py-1.5 shadow-sm z-10">
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
                      {(Number(product.rating) || 0).toFixed(1)}
                    </span>
                  </div>
                  <span className="font-body text-sm text-slate">
                    ({product.reviewCount ?? 0} review{(product.reviewCount ?? 0) === 1 ? "" : "s"})
                  </span>
                  {product.sku && (
                    <span className="font-body text-xs text-slate">SKU: {product.sku}</span>
                  )}
                </div>
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

              {/* Trust strip — the same claims already made on /quality and
                  /health-hygiene, not new ones invented for this page. */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 py-1">
                <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-slate">
                  <Snowflake className="h-3.5 w-3.5 text-fnc-blue" />
                  Cold Chain Maintained
                </span>
                <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-slate">
                  <PackageCheck className="h-3.5 w-3.5 text-fnc-green" />
                  Hygienically Packed
                </span>
                <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-slate">
                  <ShieldCheck className="h-3.5 w-3.5 text-fnc-red" />
                  Quality Checked Daily
                </span>
              </div>

              <StoreAvailabilityBadge storeInventory={product.storeInventory} />

              <ProductPurchasePanel product={product} image={meta.image} />

              <DeliveryPartnerSelect />

              {nutritionRows.length > 0 && (
                <div className="rounded-2xl border border-bordergray bg-white p-5 sm:p-6">
                  <h2 className="font-display text-base font-bold text-charcoal mb-4">
                    Nutrition Information
                  </h2>
                  <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(nutritionRows.length, 4)} gap-3 text-center`}>
                    {nutritionRows.map(([label, value]) => (
                      <div key={label} className="bg-fnc-green/[0.03] border border-fnc-green/10 rounded-xl py-3 px-1">
                        <p className="font-display text-lg font-extrabold text-fnc-green">
                          {value}
                        </p>
                        <p className="font-body text-[10px] text-slate uppercase tracking-wider font-bold mt-1">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom attributes (e.g. "Origin of Fish" -> "West Bengal") */}
              {Array.isArray(product.customAttributes) && product.customAttributes.length > 0 && (
                <div className="rounded-2xl border border-bordergray bg-white p-5 sm:p-6">
                  <h2 className="font-display text-base font-bold text-charcoal mb-4">
                    Product Details
                  </h2>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                    {product.customAttributes.map((attr, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-3 border-b border-bordergray/60 pb-2">
                        <dt className="font-body text-xs text-slate">{attr.label}</dt>
                        <dd className="font-body text-sm font-semibold text-charcoal text-right">{attr.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Cooking + storage */}
              {(product.cookingInstructions || product.storageInstructions) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.cookingInstructions && (
                    <div className={`rounded-2xl border border-fnc-red/20 bg-fnc-red/[0.02] p-5 flex flex-col gap-2 ${!product.storageInstructions ? "sm:col-span-2" : ""}`}>
                      <div className="flex items-center gap-2 text-fnc-red">
                        <Flame className="h-4 w-4 shrink-0 fill-fnc-red/10" />
                        <h3 className="font-display text-sm font-bold">
                          Cooking Instructions
                        </h3>
                      </div>
                      <p className="font-body text-xs sm:text-sm text-slate leading-relaxed">
                        {product.cookingInstructions}
                      </p>
                    </div>
                  )}
                  {product.storageInstructions && (
                    <div className={`rounded-2xl border border-fnc-blue/20 bg-fnc-blue/[0.02] p-5 flex flex-col gap-2 ${!product.cookingInstructions ? "sm:col-span-2" : ""}`}>
                      <div className="flex items-center gap-2 text-fnc-blue">
                        <Snowflake className="h-4 w-4 shrink-0 fill-fnc-blue/10" />
                        <h3 className="font-display text-sm font-bold">
                          Storage Instructions
                        </h3>
                      </div>
                      <p className="font-body text-xs sm:text-sm text-slate leading-relaxed">
                        {product.storageInstructions}
                      </p>
                    </div>
                  )}
                </div>
              )}
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
            <div
              className={cn(
                "grid gap-4 sm:gap-5",
                relatedProductList.length === 1
                  ? "grid-cols-2 max-w-xs"
                  : relatedProductList.length <= 2
                  ? "grid-cols-2 max-w-lg"
                  : relatedProductList.length === 3
                  ? "grid-cols-2 sm:grid-cols-3 max-w-3xl"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              )}
            >
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
            <div
              className={cn(
                "grid gap-4 sm:gap-5",
                relatedRecipeList.length === 1
                  ? "grid-cols-1 max-w-sm"
                  : relatedRecipeList.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl"
              )}
            >
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
                {(Number(product.rating) || 0).toFixed(1)}
              </span>
              <span className="font-body text-sm text-slate">
                ({product.reviewCount ?? 0})
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
