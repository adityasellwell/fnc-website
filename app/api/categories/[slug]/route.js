import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// GET /api/categories/[slug]
//
// Single category lookup by slug, enriched with its parent category (if
// any) and its subcategories.

const paramsSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export async function GET(request, { params }) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid category slug", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { slug } = parsed.data;

  try {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        parentCategory: true,
        subcategories: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("GET /api/categories/[slug] failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
