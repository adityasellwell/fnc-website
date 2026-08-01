/**
 * Banner data — backed by Prisma/MySQL.
 *
 * Falls back to MOCK_BANNERS when the DB is unreachable (hero placement
 * only — other placements just render nothing rather than fake content).
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
    placement: banner.placement.toLowerCase(),
    title: banner.title ?? "",
    subtitle: banner.subtitle ?? "",
    image: banner.image,
    link: banner.link,
    ctaLabel: banner.ctaLabel ?? "Shop Now",
    priority: banner.priority,
    active: true,
  };
}

export async function getBannersByPlacement(placement) {
  try {
    const now = new Date();
    const dbPlacement = placement.toUpperCase();
    const banners = await db.banner.findMany({
      where: {
        placement: dbPlacement,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: null },
          { startsAt: null, endsAt: { gte: now } },
        ],
      },
      orderBy: { priority: "asc" },
    });
    if (banners.length === 0) {
      if (placement.toLowerCase() === "hero") return MOCK_BANNERS;
      return [];
    }
    return banners.map(mapBanner);
  } catch (err) {
    console.error(`Failed to fetch banners for placement ${placement}:`, err);
    if (placement.toLowerCase() === "hero") return MOCK_BANNERS;
    return [];
  }
}

export async function getHeroBanners() {
  return getBannersByPlacement("hero");
}
