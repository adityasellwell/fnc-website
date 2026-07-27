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

// ---------------------------------------------------------------------------
// Mock data — used when DB is unavailable
// ---------------------------------------------------------------------------
const MOCK_STORES = [
  {
    id: "store-jubilee-hills",
    slug: "jubilee-hills-hyderabad",
    name: "F&C Jubilee Hills",
    status: "active",
    address: "Road No. 36, Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    geo: { lat: 17.4318, lng: 78.4073 },
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
    googleMapsLink: "https://maps.google.com/?q=17.4318,78.4073",
  },
  {
    id: "store-indiranagar",
    slug: "indiranagar-bengaluru",
    name: "F&C Indiranagar",
    status: "coming-soon",
    address: "100 Feet Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    geo: { lat: 12.9784, lng: 77.6408 },
    phone: "+91 98765 43211",
    whatsapp: "+91 98765 43211",
    openingHours: {
      mon: "Opening Soon",
      tue: "Opening Soon",
      wed: "Opening Soon",
      thu: "Opening Soon",
      fri: "Opening Soon",
      sat: "Opening Soon",
      sun: "Opening Soon",
    },
    images: ["/images/categories/chicken.jpg"],
    productsAvailable: [],
    deliveryAvailable: false,
    pickupAvailable: false,
    googleMapsLink: "https://maps.google.com/?q=12.9784,77.6408",
  },
  {
    id: "store-bandra",
    slug: "bandra-mumbai",
    name: "F&C Bandra",
    status: "coming-soon",
    address: "Hill Road, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    geo: { lat: 19.0596, lng: 72.8295 },
    phone: "+91 98765 43212",
    whatsapp: "+91 98765 43212",
    openingHours: {
      mon: "Opening Soon",
      tue: "Opening Soon",
      wed: "Opening Soon",
      thu: "Opening Soon",
      fri: "Opening Soon",
      sat: "Opening Soon",
      sun: "Opening Soon",
    },
    images: ["/images/categories/crab.jpg"],
    productsAvailable: [],
    deliveryAvailable: false,
    pickupAvailable: false,
    googleMapsLink: "https://maps.google.com/?q=19.0596,72.8295",
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
