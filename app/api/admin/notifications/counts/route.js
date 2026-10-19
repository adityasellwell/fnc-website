import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    const storeId = getScopedStoreId(admin);

    const storeFilter = storeId ? { storeId } : {};

    const [pendingOrders, pendingRefunds, newFranchiseLeads, contactMessages] = await Promise.all([
      db.order.count({
        where: {
          ...storeFilter,
          status: { in: ["PLACED", "CONFIRMED", "PREPARING"] },
        },
      }),
      db.refundRequest.count({
        where: {
          status: { in: ["REQUESTED", "UNDER_REVIEW"] },
        },
      }),
      db.franchiseLead.count({
        where: {
          status: "NEW",
        },
      }),
      db.contactMessage.count(),
    ]);

    return NextResponse.json({
      orders: pendingOrders,
      refunds: pendingRefunds,
      inquiries: newFranchiseLeads + contactMessages,
    });
  } catch (error) {
    console.error("[GET /api/admin/notifications/counts] failed:", error);
    return NextResponse.json({ orders: 0, refunds: 0, inquiries: 0 }, { status: 200 });
  }
}
