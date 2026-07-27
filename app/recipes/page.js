import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import RecipeCard from "@/components/recipe/RecipeCard";
import { getRecipes } from "@/lib/data/recipes";

export const metadata = {
  title: "Recipes — F&C Fresh Proteins & More",
  description:
    "Home-style recipes built around F&C's fresh fish, chicken, crab and eggs — ingredients, steps, and cook times for real weeknight cooking.",
};

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite">
        <div className="bg-charcoal text-white py-12 sm:py-16">
          <Container>
            <p className="font-body text-xs sm:text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
              Recipe Inspiration
            </p>
            <h1 className="font-display text-hero sm:text-section-heading-lg font-extrabold tracking-tight max-w-xl">
              Cook it the way we would at home.
            </h1>
            <p className="font-body text-body text-white/70 mt-3 max-w-xl">
              Real recipes built around what&apos;s in our cases today — the
              exact cuts, quantities, and steps, no guesswork required.
            </p>
          </Container>
        </div>

        <Section background="offwhite" spacing="md">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recipes.map((recipe, i) => (
              <Reveal key={recipe.id} delay={i * 0.06}>
                <RecipeCard recipe={recipe} />
              </Reveal>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
