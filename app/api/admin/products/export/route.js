import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

/**
 * Downloads the full current product catalog as an .xlsx — the "what's
 * already listed" checklist, and the starting point for a bulk edit: open
 * it, change whatever cells need changing, re-upload via the Bulk Import
 * page. SKU is the anchor column the re-upload matches rows against.
 */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Sign in as an admin." }, { status: 401 });
  }

  const products = await db.product.findMany({
    include: { category: true, storeInventory: { include: { store: true } } },
    orderBy: { name: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products");
  sheet.columns = [
    { header: "SKU", key: "sku", width: 20 },
    { header: "Name", key: "name", width: 40 },
    { header: "Category", key: "category", width: 22 },
    { header: "Price", key: "price", width: 12 },
    { header: "Unit", key: "unit", width: 12 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Active", key: "active", width: 10 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const p of products) {
    const stock = p.storeInventory.reduce((sum, si) => sum + si.stock, 0);
    sheet.addRow({
      sku: p.sku || "",
      name: p.name,
      category: p.category?.name || "",
      price: Number(p.price),
      unit: p.unit,
      stock,
      active: p.isActive ? "yes" : "no",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="fnc-products-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
