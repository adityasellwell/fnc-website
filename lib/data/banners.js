/**
 * Banner data — backed by Prisma/Postgres.
 *
 * Falls back to MOCK_BANNERS when the DB is unreachable.
 *
 * Note: The Prisma Banner model (prisma/schema.prisma) does not currently
 * have `title`, `subtitle`, or `ctaLabel` columns — those were assumed by
 * the initial rewrite pass. Until the schema is migrated to add them, the
 * mock data provides these fields, and the Prisma path will omit them
 * gracefully (they'll be undefined, and the Hero component handles missing
 * subtitle / ctaLabel with fallbacks).
 */
import { db } from "@/lib/db";

const MOCK_BANNERS = [
  {
    id: "banner-1",
    placement: "hero",
    title: "Fresh Fish, Delivered Daily",
    subtitle: "Hand-selected from trusted coastal sources every morning. Cold-chain from counter to your kitchen.",
    image: "/images/categories/fish.jpg",
    link: "/shop/fish",
    ctaLabel: "Shop Fish Now",
    priority: 1,
    active: true,
  },
  {
    id: "banner-2",
    placement: "hero",
    title: "Premium Chicken Cuts",
    subtitle: "Farm-fresh, expertly butchered chicken in every cut you need — curry, boneless, mince, and more.",
    image: "/images/categories/chicken.jpg",
    link: "/shop/chicken",
    ctaLabel: "Order Chicken",
    priority: 2,
    active: true,
  },
  {
    id: "banner-3",
    placement: "hero",
    title: "Ready to Cook, Ready to Impress",
    subtitle: "Pre-marinated proteins that go straight from fridge to pan. Restaurant results, home effort.",
    image: "/images/categories/ready-to-cook.jpg",
    link: "/shop/ready-to-cook",
    ctaLabel: "Explore Ready to Cook",
    priority: 3,
    active: true,
  },
];

function mapBanner(banner) {
  return {
    id: banner.id,
    placement: "hero",
    title: banner.title ?? "",
    subtitle: banner.subtitle ?? "",
    image: banner.image,
    link: banner.link,
    ctaLabel: banner.ctaLabel ?? "Shop Now",
    priority: banner.priority,
    active: true,
  };
}

export async function getHeroBanners() {
  try {
    const now = new Date();
    const banners = await db.banner.findMany({
      where: {
        placement: "HERO",
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: null },
          { startsAt: null, endsAt: { gte: now } },
        ],
      },
      orderBy: { priority: "asc" },
    });
    // If DB is connected but no banners seeded yet, fall back to mock
    if (banners.length === 0) return MOCK_BANNERS;
    return banners.map(mapBanner);
  } catch {
    return MOCK_BANNERS;
  }
}
