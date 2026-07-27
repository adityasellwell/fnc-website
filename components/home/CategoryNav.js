"use client";

import { useState } from "react";
import Image from "next/image";
import { Percent } from "lucide-react";
import Container from "@/components/layout/Container";
import { CATEGORY_META } from "@/lib/constants";

const items = [
  { slug: "fish", name: "Fish" },
  { slug: "chicken", name: "Chicken" },
  { slug: "crab", name: "Crab" },
  { slug: "ready-to-cook", name: "Ready to Cook" },
  { slug: "ready-to-eat", name: "Ready to Eat" },
  { slug: "cheese-dairy", name: "Cheese & Dairy" },
  { slug: "eggs", name: "Eggs" },
  { slug: "offers", name: "Offers" },
];

/**
 * Big, bold category row, directly under the header (ahead of the hero
 * banner — categories are the priority). Clicking sets the active tile
 * visually — real product filtering wires up once the product sections
 * exist, so this click state doesn't do anything beyond the highlight yet.
 */
export default function CategoryNav() {
  const [active, setActive] = useState("fish");

  return (
    <div className="border-b border-bordergray bg-white">
      <Container>
        <div className="flex items-start gap-6 md:gap-10 overflow-x-auto py-8">
          {items.map((item) => {
            const isActive = active === item.slug;
            const isOffers = item.slug === "offers";
            const meta = CATEGORY_META[item.slug];

            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => setActive(item.slug)}
                className="group flex flex-col items-center gap-3 shrink-0"
              >
                <div
                  className={`relative h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden border-2 transition-colors ${
                    isActive
                      ? "border-fnc-red"
                      : "border-bordergray group-hover:border-charcoal/40"
                  }`}
                >
                  {isOffers ? (
                    <div className="h-full w-full flex items-center justify-center bg-fnc-red">
                      <Percent className="h-10 w-10 md:h-12 md:w-12 text-white" strokeWidth={1.75} />
                    </div>
                  ) : (
                    <Image
                      src={meta.image}
                      alt={item.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  )}
                </div>
                <span
                  className={`font-body text-base md:text-lg font-semibold whitespace-nowrap ${
                    isActive ? "text-fnc-red" : "text-charcoal"
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
