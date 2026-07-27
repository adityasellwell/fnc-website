import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// GET /api/products/[slug]
//
// Single product lookup by slug, enriched with its category, the 10 most
// recent reviews, and related products/recipes.

const paramsSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export async function GET(request, { params }) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product slug", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { slug } = parsed.data;

  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        relatedProducts: true,
        relatedRecipes: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = {
      ...product,
      price: Number(product.price),
      relatedProducts: product.relatedProducts.map((related) => ({
        ...related,
        price: Number(related.price),
      })),
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/products/[slug] failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
