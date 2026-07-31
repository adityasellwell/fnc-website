import { db } from "@/lib/db";

export async function updateStoreStock(productId, storeId, stock, userId) {
  const stockVal = Math.max(0, stock);

  return db.$transaction(async (tx) => {
    // 1. Upsert StoreInventory
    const inv = await tx.storeInventory.upsert({
      where: {
        storeId_productId: { storeId, productId },
      },
      update: { stock: stockVal },
      create: { storeId, productId, stock: stockVal },
    });

    // 2. Query all store inventory rows for this product to compute the sum
    const allInv = await tx.storeInventory.findMany({
      where: { productId },
    });
    const totalStock = allInv.reduce((sum, item) => sum + item.stock, 0);

    // 3. Update rolled-up Product.stock
    await tx.product.update({
      where: { id: productId },
      data: { stock: totalStock },
    });

    // 4. Log in AuditLog
    await tx.auditLog.create({
      data: {
        userId,
        action: "UPDATE_STORE_INVENTORY",
        entityType: "Product",
        entityId: productId,
        storeId,
        details: { stock: stockVal, totalStock },
      },
    });

    return inv;
  });
}
