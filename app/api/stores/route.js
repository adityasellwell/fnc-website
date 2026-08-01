import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSettings } from "@/services/settings";

// GET /api/stores?status=active&page=1&pageSize=100
//
// Lists all stores, optionally filtered by status. The DB enum
// (StoreStatus: ACTIVE | COMING_SOON) is uppercase/snake-ish; the query
// param accepts the lowercase, hyphen-free form a client would naturally
// type and this route maps it to the enum value.

const STATUS_MAP = {
  active: "ACTIVE",
  coming_soon: "COMING_SOON",
};

const querySchema = z.object({
  status: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(["active", "coming_soon"]))
    .optional(),
  page: z.coerce.number().int().positive().max(100000).default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(100),
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { status, page, pageSize } = parsed.data;

  const where = status ? { status: STATUS_MAP[status] } : {};

  try {
    const [stores, total, settings] = await Promise.all([
      db.store.findMany({
        where,
        orderBy: [{ status: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.store.count({ where }),
      getSettings(),
    ]);

    const mappedStores = stores.map((s) => {
      let imgs = [];
      try {
        imgs = typeof s.images === "string" ? JSON.parse(s.images) : (Array.isArray(s.images) ? s.images : []);
      } catch (e) {}
      return {
        id: s.id,
        slug: s.slug,
        name: s.name,
        status: s.status === "ACTIVE" ? "active" : "coming-soon",
        address: s.address,
        city: s.city,
        state: s.state,
        geo: { lat: s.latitude, lng: s.longitude },
        phone: s.phone,
        whatsapp: s.whatsapp,
        openingHours: s.openingHours,
        images: imgs,
        deliveryAvailable: s.deliveryAvailable,
        pickupAvailable: s.pickupAvailable,
        googleMapsLink: s.googleMapsLink,
      };
    });

    return NextResponse.json({
      data: mappedStores,
      deliveryRadiusKm: settings.deliveryRadiusKm,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("GET /api/stores failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
