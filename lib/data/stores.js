/**
 * Store data — backed by Prisma/Postgres.
 *
 * Falls back to MOCK_STORES when the DB is unreachable.
 *
 * Shape notes:
 * 1. `status` is converted from Prisma enum (ACTIVE/COMING_SOON) to lowercase
 *    strings ("active"/"coming-soon") that existing components use.
 * 2. `geo: { lat, lng }` — reconstructed from separate latitude/longitude
 *    columns in the schema, as components access `store.geo.lat` / `store.geo.lng`.
 */
import { db } from "@/lib/db";
import { haversineDistanceKm } from "@/lib/utils/geo";

// ---------------------------------------------------------------------------
// Mock data — used when DB is unavailable
// ---------------------------------------------------------------------------
const MOCK_STORES = [
  {
    id: "store-thane-west",
    slug: "thane-west",
    name: "F&C Thane West",
    status: "active",
    address: "Shop No 11, Next to Eden Super Mart, Crown Apartment, Hiranandani Estate",
    city: "Thane",
    state: "Maharashtra",
    geo: { lat: 19.2588283, lng: 72.9790149 },
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    openingHours: {
      mon: "7:00 AM – 9:00 PM",
      tue: "7:00 AM – 9:00 PM",
      wed: "7:00 AM – 9:00 PM",
      thu: "7:00 AM – 9:00 PM",
      fri: "7:00 AM – 9:00 PM",
      sat: "7:00 AM – 9:30 PM",
      sun: "7:00 AM – 9:30 PM",
    },
    images: ["/images/categories/fish.jpg"],
    productsAvailable: [],
    deliveryAvailable: true,
    pickupAvailable: true,
    googleMapsLink: "https://www.google.com/maps?q=19.2588283,72.9790149&z=17&hl=en",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STORE_INCLUDE = {
  productsAvailable: { select: { id: true } },
};

function mapStatus(status) {
  return status === "ACTIVE" ? "active" : "coming-soon";
}

function mapStore(store) {
  let images = store.images;
  if (typeof images === "string") {
    try { images = JSON.parse(images); } catch { images = []; }
  }
  if (!Array.isArray(images)) images = [];

  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    status: typeof store.status === "string" && store.status === store.status.toLowerCase()
      ? store.status  // already mapped (mock data path)
      : mapStatus(store.status),
    address: store.address,
    city: store.city,
    state: store.state,
    geo: store.geo ?? { lat: store.latitude, lng: store.longitude },
    phone: store.phone,
    whatsapp: store.whatsapp,
    openingHours: store.openingHours,
    images,
    productsAvailable: (store.productsAvailable ?? []).map((p) =>
      typeof p === "string" ? p : p.id
    ),
    deliveryAvailable: store.deliveryAvailable,
    pickupAvailable: store.pickupAvailable,
    googleMapsLink: store.googleMapsLink,
  };
}

export async function getStores() {
  try {
    const stores = await db.store.findMany({
      include: STORE_INCLUDE,
      orderBy: { createdAt: "asc" },
    });
    return stores.map(mapStore);
  } catch {
    return MOCK_STORES;
  }
}

export async function getStoreBySlug(slug) {
  try {
    const store = await db.store.findUnique({
      where: { slug },
      include: STORE_INCLUDE,
    });
    return store ? mapStore(store) : null;
  } catch {
    return MOCK_STORES.find((s) => s.slug === slug) ?? null;
  }
}

export async function getActiveStores() {
  try {
    const stores = await db.store.findMany({
      where: { status: "ACTIVE" },
      include: STORE_INCLUDE,
      orderBy: { createdAt: "asc" },
    });
    return stores.map(mapStore);
  } catch {
    return MOCK_STORES.filter((s) => s.status === "active");
  }
}

/**
 * The single real "which store serves this customer" resolver — replaces
 * the `stores[0]`/`findFirst` shortcuts previously used independently in
 * checkout UI and the order API. Returns null if no active store is within
 * range, or the nearest active store plus its distance in km otherwise.
 */
export async function getNearestActiveStore(lat, lng, { deliveryOnly = false } = {}) {
  let activeStores = await getActiveStores();
  if (deliveryOnly) activeStores = activeStores.filter((s) => s.deliveryAvailable);
  let nearest = null;
  let minDistanceKm = Infinity;
  for (const store of activeStores) {
    const distanceKm = haversineDistanceKm(lat, lng, store.geo.lat, store.geo.lng);
    if (distanceKm < minDistanceKm) {
      minDistanceKm = distanceKm;
      nearest = store;
    }
  }
  return nearest ? { store: nearest, distanceKm: minDistanceKm } : null;
}
