import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logProductSearch } from "@/lib/utils/analytics";


// GET /api/products?page=1&pageSize=20&category=<slug>&tag=<tag>&search=<text>
//
// Paginated, filterable product list. Filters are all optional and can be
// combined: category (exact slug match), tag (exact match against the
// tags[] array), search (case-insensitive substring match against name
// and description — the Postgres ILIKE-based search called for in
// Project-instructions.md §3 for this phase, not a dedicated search
// service).

const querySchema = z.object({
  page: z.coerce.number().int().positive().max(100000).default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().trim().min(1).max(200).optional(),
  tag: z.string().trim().min(1).max(200).optional(),
  search: z.string().trim().min(1).max(200).optional(),
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

  const { page, pageSize, category, tag, search } = parsed.data;

  const where = {};
  if (category) where.category = { slug: category };
  if (tag) where.tags = { has: tag };
  if (search) {
    // No `mode: "insensitive"` — that's a Postgres/Mongo-only Prisma option
    // and throws on this project's MySQL provider. MySQL's default
    // collation (utf8mb4_unicode_ci, set in the initial migration) is
    // already case-insensitive, so plain `contains` is correct here.
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  try {
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    if (search) {
      // Fire-and-forget — a search log write failing must never block the
      // actual search response.
      logProductSearch({ query: search, results: total });
    }

    const data = products.map((product) => ({
      ...product,
      price: Number(product.price),
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("GET /api/products failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
