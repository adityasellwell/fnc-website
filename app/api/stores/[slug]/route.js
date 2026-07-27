import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// GET /api/stores/[slug]
//
// Single store lookup by slug, enriched with its most recent reviews.

const paramsSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export async function GET(request, { params }) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid store slug", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { slug } = parsed.data;

  try {
    const store = await db.store.findUnique({
      where: { slug },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ data: store });
  } catch (error) {
    console.error("GET /api/stores/[slug] failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
