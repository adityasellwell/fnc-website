import Link from "next/link";
import Image from "next/image";
import { Clock, Users } from "lucide-react";
import Card from "@/components/ui/Card";

export default function RecipeCard({ recipe }) {
  return (
    <Card
      as={Link}
      href={`/recipe/${recipe.slug}`}
      hoverLift
      className="group flex flex-col"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-warmwhite">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          sizes="(min-width: 1024px) 30vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-semibold text-charcoal">
          {recipe.title}
        </h3>
        <p className="font-body text-sm text-slate line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex items-center gap-4 mt-1 font-body text-xs text-slate">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {recipe.cookTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Serves {recipe.servings}
          </span>
        </div>
      </div>
    </Card>
  );
}
