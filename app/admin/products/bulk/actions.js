"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { findSimilarNames } from "@/lib/utils/similarity";

function slugify(str) {
  return str.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base) {
  let slug = base || "product";
  let n = 2;
  while (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

async function uniqueSku(base) {
  let sku = `${base}-001`;
  let n = 2;
  while (await db.product.findFirst({ where: { sku }, select: { id: true } })) {
    sku = `${base}-00${n}`;
    n += 1;
  }
  return sku;
}

function parseActive(raw) {
  const v = String(raw ?? "").trim().toLowerCase();
  return ["yes", "true", "1", "y"].includes(v);
}

function cellText(cell) {
  return cell?.text != null ? String(cell.text).trim() : "";
}

/**
 * Parses an uploaded spreadsheet and diffs every row against the current
 * database WITHOUT writing anything — the admin reviews this preview
 * (what's new, what's changing, what looks like an accidental duplicate)
 * before a single row is actually saved.
 */
export async function previewBulkImportAction(formData) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin") {
    return { error: "Only super admins can bulk import products." };
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return { error: "No file provided." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    return { error: "Couldn't read that file — please upload a .xlsx file (the same format the Export button gives you)." };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return { error: "That file has no sheets." };

  const [existingProducts, categories] = await Promise.all([
    db.product.findMany({
      select: { id: true, sku: true, name: true, price: true, unit: true, isActive: true, categoryId: true, category: { select: { name: true } } },
    }),
    db.category.findMany({ select: { id: true, name: true } }),
  ]);
  const productBySku = new Map(existingProducts.filter((p) => p.sku).map((p) => [p.sku.toLowerCase(), p]));
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));
  const allNames = existingProducts.map((p) => p.name);

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const sku = cellText(row.getCell(1));
    const name = cellText(row.getCell(2));
    const categoryName = cellText(row.getCell(3));
    const priceRaw = cellText(row.getCell(4));
    const unit = cellText(row.getCell(5));
    const stockRaw = cellText(row.getCell(6));
    const activeRaw = cellText(row.getCell(7));

    if (!name && !sku && !categoryName) return; // blank row, skip silently

    const price = Number(priceRaw);
    const stock = stockRaw ? Number(stockRaw) : 0;
    const isActive = parseActive(activeRaw);
    const category = categoryName ? categoryByName.get(categoryName.toLowerCase()) : null;

    const out = {
      rowNumber, sku, name, category: categoryName, categoryId: category?.id ?? null,
      price, unit, stock, active: isActive, status: "new", changes: [], similar: [], matchedProductId: null,
    };

    if (!name) { out.status = "error"; out.error = "Name is required"; rows.push(out); return; }
    if (!unit) { out.status = "error"; out.error = "Unit is required"; rows.push(out); return; }
    if (isNaN(price) || price < 0) { out.status = "error"; out.error = "Price is missing or invalid"; rows.push(out); return; }
    if (!categoryName) { out.status = "error"; out.error = "Category is required"; rows.push(out); return; }
    if (!category) { out.status = "error"; out.error = `Category "${categoryName}" doesn't match any existing category`; rows.push(out); return; }

    const matched = sku ? productBySku.get(sku.toLowerCase()) : null;
    if (matched) {
      out.matchedProductId = matched.id;
      const changes = [];
      if (matched.name !== name) changes.push(`name: "${matched.name}" -> "${name}"`);
      if (Number(matched.price) !== price) changes.push(`price: Rs.${matched.price} -> Rs.${price}`);
      if (matched.unit !== unit) changes.push(`unit: "${matched.unit}" -> "${unit}"`);
      if (matched.categoryId !== category.id) changes.push(`category: "${matched.category?.name}" -> "${categoryName}"`);
      if (matched.isActive !== isActive) changes.push(`active: ${matched.isActive} -> ${isActive}`);
      out.changes = changes;
      out.status = changes.length > 0 ? "update" : "unchanged";
    } else {
      out.similar = findSimilarNames(name, allNames);
      out.status = out.similar.length > 0 ? "warning" : "new";
    }

    rows.push(out);
  });

  const summary = rows.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; acc.total += 1; return acc; },
    { total: 0, new: 0, update: 0, unchanged: 0, warning: 0, error: 0 }
  );

  return { rows, summary };
}

/**
 * Applies the rows the admin has already reviewed in the preview step.
 * Skips "unchanged" and "error" rows — only "new"/"update"/"warning" rows
 * (warning = looks like a possible duplicate, but the admin chose to
 * proceed anyway) get written.
 */
export async function applyBulkImportAction(rows) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin") {
    return { error: "Only super admins can bulk import products." };
  }

  const stores = await db.store.findMany({ where: { status: "ACTIVE" }, select: { id: true } });
  let created = 0, updated = 0;
  const errors = [];

  for (const row of rows) {
    if (row.status === "unchanged" || row.status === "error") continue;

    try {
      if (row.matchedProductId) {
        await db.product.update({
          where: { id: row.matchedProductId },
          data: { name: row.name, price: row.price, unit: row.unit, categoryId: row.categoryId, isActive: row.active },
        });
        for (const store of stores) {
          await db.storeInventory.upsert({
            where: { storeId_productId: { storeId: store.id, productId: row.matchedProductId } },
            update: { stock: row.stock },
            create: { storeId: store.id, productId: row.matchedProductId, stock: row.stock },
          });
        }
        updated += 1;
      } else {
        const slug = await uniqueSlug(slugify(row.name));
        const sku = row.sku || (await uniqueSku(`FNC-BULK-${slugify(row.name).slice(0, 6).toUpperCase()}`));
        const product = await db.product.create({
          data: {
            slug, name: row.name, description: "", images: [], price: row.price, gstRate: 0,
            unit: row.unit, sku, nutrition: {}, cookingInstructions: "", storageInstructions: "",
            tags: [], stock: 0, isActive: row.active, categoryId: row.categoryId,
          },
        });
        if (stores.length > 0) {
          await db.storeInventory.createMany({
            data: stores.map((s) => ({ storeId: s.id, productId: product.id, stock: row.stock })),
          });
        }
        created += 1;
      }
    } catch (err) {
      errors.push({ row: row.rowNumber, name: row.name, message: err.message });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop", "layout");
  revalidatePath("/");

  return { ok: true, created, updated, errors };
}
