/**
 * Mock blog data, per the BlogPost model in prisma/schema.prisma
 * (title, excerpt, content, image, tags, publishedAt). Written as async
 * functions so swapping to real Prisma queries later requires zero
 * component changes — mirrors the pattern in lib/data/recipes.js exactly.
 * Reuses existing category photography (no new photo sourcing).
 */

const posts = [
  {
    id: "post-cold-chain-farm-to-fridge",
    slug: "cold-chain-farm-to-fridge",
    title: "Inside Our Cold Chain: From Farm to Your Fridge",
    excerpt:
      "Freshness isn't a claim we make at the counter — it's a chain of custody that starts hours after harvest and never breaks until it reaches your door.",
    image: "/images/categories/chicken.jpg",
    tags: ["sourcing", "cold chain"],
    publishedAt: "2026-06-02",
    content: `Most people only ever see the last link in the chain — a neatly packed tray of chicken or fish handed over at the counter, or left on their doorstep. What they don't see is everything that happened before that moment, and that's usually where quality is won or lost.

Our proteins are sourced from farms and fishing partners we've vetted directly, not through anonymous middle-market suppliers. Chicken leaves the farm within hours of processing. Fish comes in on ice the same morning it's caught or harvested, never held over. From there, every batch enters a temperature-controlled environment and stays there — no gaps, no "room temperature for a few minutes while we sort things out."

At the store, proteins are cut and packed to order, in small batches, so nothing sits pre-cut and exposed for hours before it's sold. Vacuum-sealed, leak-proof packaging keeps both the temperature and the quality locked in during transit, whether that's a two-minute walk to a customer's car or a same-day delivery across the city.

The unglamorous part of this story is the discipline behind it: temperature logs checked multiple times a day, delivery bikes with insulated boxes, and a hard rule that anything that breaks cold chain gets pulled, not sold at a discount. It's slower and more expensive than the alternative. It's also the only way we know to make "fresh" mean something more than a word on a sign.

Next time your order arrives cold to the touch and vacuum-tight, that's not an accident — that's the whole system working exactly as it's supposed to.`,
  },
  {
    id: "post-daily-hygiene-checklist",
    slug: "daily-hygiene-checklist",
    title: "Our Daily Hygiene Checklist, Explained",
    excerpt:
      "A look at what actually happens behind the counter before your order reaches the scale — the checks most customers never get to see.",
    image: "/images/categories/eggs.jpg",
    tags: ["hygiene", "quality"],
    publishedAt: "2026-05-18",
    content: `"Hygienically processed" is easy to print on a banner. Making it true, every single day, is a different job entirely — one that happens well before the store opens its shutters.

Every morning starts with a full sanitation pass: cutting boards, knives, scales, and counters are cleaned and sanitized before the first order of the day, not just at closing time. Staff go through a hygiene routine of their own — aprons, gloves, and hairnets aren't optional extras, they're the baseline.

Through the day, our team runs spot checks on temperature (proteins are held at 0-4°C in chillers, well below the danger zone), on visual quality (colour, smell, texture — anything that doesn't meet spec gets pulled immediately), and on packaging integrity before anything leaves the counter. None of this is left to memory; it's logged, batch by batch.

We also treat the boring stuff seriously — pest control schedules, waste segregation, and drainage checks that don't make for exciting marketing copy but matter enormously in a category where the margin for error is genuinely someone's dinner. Every one of these checks exists because we'd rather find a problem ourselves, in the back room, than have a customer find it on their plate.

Hygiene isn't a single certificate on a wall. It's a routine, repeated without exception, every single day the shutters go up.`,
  },
  {
    id: "post-franchise-expansion",
    slug: "why-we-are-expanding-franchise",
    title: "Why We're Expanding the F&C Franchise Model",
    excerpt:
      "One store proved the model works. Here's the thinking behind taking F&C's fresh-protein format to new cities through franchise partners.",
    image: "/images/categories/ready-to-eat.jpg",
    tags: ["franchise", "growth"],
    publishedAt: "2026-04-27",
    content: `When we opened our first store in Jubilee Hills, the goal wasn't just to sell fresh fish and chicken — it was to prove that a hygiene-first, cold-chain-disciplined protein retail format could actually work at the counter, day after day, without cutting corners as volume grew.

It did. And the question we kept getting from customers and visitors alike wasn't "will this work elsewhere" — it was "when is this coming to my city."

That's the honest reason we're opening the franchise model up now rather than later. We'd rather grow deliberately with partners who understand what makes the format work — the sourcing discipline, the daily hygiene routine, the training that goes into every counter hire — than expand quickly and dilute the one thing that got us here: trust.

Franchise partners get more than a signboard and a supplier list. They get our sourcing relationships, our store layout and equipment specifications, staff training built around our own hygiene checklist, and ongoing operational support so a new city launch doesn't mean reinventing the format from scratch. In return, we're looking for partners who care as much about the "boring" parts — temperature logs, cleaning routines, batch checks — as they do about opening day footfall.

We're not chasing a store count for its own sake. We're looking for the next few cities where the F&C model can be run properly, by people who'll hold the same standard we do. If that's you, the franchise page has the details on what it takes to bring F&C to your city.`,
  },
  {
    id: "post-monsoon-recipe-roundup",
    slug: "monsoon-recipe-roundup",
    title: "A Monsoon Recipe Roundup: 5 Ways to Cook This Week's Catch",
    excerpt:
      "Rainy evenings call for something hot, spiced, and quick off the stove. Five ways to turn this week's fish, chicken, and crab into dinner.",
    image: "/images/categories/fish.jpg",
    tags: ["recipes", "seasonal"],
    publishedAt: "2026-03-14",
    content: `There's a reason monsoon and a good curry go together — nothing else quite matches a rainy evening, a hot pan, and the smell of mustard oil or curry leaves hitting a hot tempering. Here's what our kitchen team has been reaching for this season.

Start with the classic: our Home-Style Rohu Fish Curry, a tangy mustard-forward gravy built for rice and rain. It's a 35-minute weeknight recipe that doesn't ask much of you beyond patience while it simmers.

If you want something faster, Chilli Garlic Prawns comes together in 15 minutes flat — jumbo prawns seared hard in garlic and butter, finished with a squeeze of lemon. It works just as well as a starter with drinks as it does a main with rice.

For a heartier plate, Butter Chicken at Home uses our curry-cut chicken and a simple yogurt marinade to get most of the restaurant flavour without the restaurant wait. And when mud crab is in season, our Coastal Crab Masala — a coconut and coriander-seed base cooked down until the oil separates — is worth the extra 40 minutes it takes.

All four recipes, along with the exact cuts and quantities to order, are on our recipes page. Order the protein fresh, and let the weather do the rest of the convincing.`,
  },
];

export async function getBlogPosts() {
  return posts;
}

export async function getBlogPostBySlug(slug) {
  return posts.find((post) => post.slug === slug) ?? null;
}
