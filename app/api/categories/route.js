import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// GET /api/categories?page=1&pageSize=100
//
// Lists all categories ordered by their `order` field. Not filterable by
// spec, but page/pageSize are still accepted and validated for shape
// consistency with the other list endpoints — default pageSize is high
// enough (100) that a normal category count is returned in a single page.

const querySchema = z.object({
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

  const { page, pageSize } = parsed.data;

  try {
    const [categories, total] = await Promise.all([
      db.category.findMany({
        orderBy: { order: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.category.count(),
    ]);

    return NextResponse.json({
      data: categories,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
