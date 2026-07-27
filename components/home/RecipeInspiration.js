import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import RecipeCard from "@/components/recipe/RecipeCard";
import { getRecipes } from "@/lib/data/recipes";

export default async function RecipeInspiration() {
  const recipes = await getRecipes();

  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <p className="font-body text-sm font-medium uppercase tracking-wider text-fnc-red mb-3">
            Recipe Inspiration
          </p>
          <h2 className="font-display text-section-heading font-bold text-charcoal max-w-lg">
            Tonight's dinner, sorted.
          </h2>
        </div>
        <Button href="/recipes" variant="outline">
          All Recipes
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.slice(0, 4).map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </Section>
  );
}
