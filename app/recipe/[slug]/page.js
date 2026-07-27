import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, Users, ArrowLeft, ShoppingBasket } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { getRecipeBySlug, getRecipes } from "@/lib/data/recipes";
import { getProducts } from "@/lib/data/products";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return {};

  return {
    title: `${recipe.title} — F&C Recipes`,
    description: recipe.description,
  };
}

export async function generateStaticParams() {
  // Falls back to an empty list if the DB isn't reachable at build time
  // (see the identical comment on app/product/[slug]/page.js for why).
  try {
    const recipes = await getRecipes();
    return recipes.map((r) => ({ slug: r.slug }));
  } catch (error) {
    console.warn("generateStaticParams(/recipe/[slug]) skipped — DB unreachable at build time:", error.message);
    return [];
  }
}

export default async function RecipeDetailPage({ params }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const products = await getProducts();
  const relatedProducts = products.filter((p) =>
    recipe.relatedProducts?.includes(p.id)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: recipe.image,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((step) => ({
      "@type": "HowToStep",
      text: step,
    })),
    totalTime: recipe.cookTime,
    recipeYield: `${recipe.servings} servings`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <div className="border-b border-bordergray bg-white py-4">
          <Container>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-slate hover:text-fnc-red transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all recipes
            </Link>
          </Container>
        </div>

        <Section background="offwhite" spacing="md">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-start">
            <Reveal className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-warmwhite border border-bordergray">
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </Reveal>

            <Reveal delay={0.08} className="flex flex-col gap-5">
              <div>
                <h1 className="font-display text-section-heading sm:text-section-heading-lg font-bold text-charcoal leading-tight">
                  {recipe.title}
                </h1>
                <p className="font-body text-body text-slate mt-3">
                  {recipe.description}
                </p>
              </div>

              <div className="flex items-center gap-6 font-body text-sm text-charcoal border-y border-bordergray py-4">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-fnc-red" />
                  {recipe.cookTime}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-fnc-red" />
                  Serves {recipe.servings}
                </span>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-charcoal mb-3">
                  Ingredients
                </h2>
                <ul className="flex flex-col gap-2">
                  {recipe.ingredients.map((ingredient) => (
                    <li
                      key={ingredient}
                      className="font-body text-body text-slate flex items-start gap-3"
                    >
                      <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-fnc-red shrink-0" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="mt-12 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-charcoal mb-5">
              Method
            </h2>
            <ol className="flex flex-col gap-5">
              {recipe.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="font-display text-base font-bold h-8 w-8 rounded-full bg-fnc-red/10 text-fnc-red flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="font-body text-body text-charcoal pt-1">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>

          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-charcoal mb-6">
                Shop the ingredients
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((product, i) => (
                  <Reveal key={product.id} delay={i * 0.06}>
                    <Card
                      as={Link}
                      href={`/product/${product.slug}`}
                      hoverLift
                      className="group flex items-center gap-4 p-4"
                    >
                      <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-warmwhite">
                        <ShoppingBasket
                          className="h-8 w-8 text-fnc-red/40 absolute inset-0 m-auto"
                          strokeWidth={1.25}
                        />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-display text-base font-semibold text-charcoal truncate">
                          {product.name}
                        </h3>
                        <p className="font-body text-sm text-slate">
                          {product.unit}
                        </p>
                        <p className="font-body text-sm font-bold text-fnc-red">
                          ₹{product.price}
                        </p>
                      </div>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <Reveal delay={0.1} className="mt-14 flex flex-wrap gap-4">
            <Button href="/shop" size="lg">
              Shop Fresh Ingredients
            </Button>
            <Button href="/recipes" size="lg" variant="outline">
              More Recipes
            </Button>
          </Reveal>
        </Section>
      </main>
      <Footer />
    </>
  );
}
