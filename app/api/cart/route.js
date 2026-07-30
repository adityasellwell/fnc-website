import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Cart API — placeholder.
 *
 * There is no Cart/CartItem model in the Prisma schema yet — real cart
 * persistence (Zustand store on the client + a Cart/CartItem model on the
 * server) lands in Phase 5. This route exists purely to establish the
 * route shape/contract early so client code can be written against a
 * stable `{ data: [] }` response today and swapped for real data later
 * without changing call sites.
 *
 * NOTE: `customerId` is accepted as a placeholder identity mechanism —
 * this stub predates real cart persistence and isn't called by the app
 * (cart is fully client-side Zustand today, see lib/store/cart.js).
 */

const getCartQuerySchema = z.object({
  customerId: z.string().min(1, "customerId is required"),
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const parsed = getCartQuerySchema.safeParse({
    customerId: searchParams.get("customerId"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  // Real cart persistence lands in Phase 5 (Zustand + a Cart/CartItem
  // model) — this stub exists so the route shape/contract is established
  // early. No DB call is made here on purpose.
  return NextResponse.json({ data: [] });
}
