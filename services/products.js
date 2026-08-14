import { db } from "@/lib/db";

const PAGE_SIZE = 10;

// Falls back to the legacy `images` JSON column when a product has no
// ProductMedia rows yet — every pre-existing product has zero rows there
// today, so without this fallback, opening the edit form on any of them
// would show an empty image field and silently wipe their real images on
// save.
function resolveImages(product) {
  if (product.media && product.media.length > 0) {
    return product.media.map((m) => m.url);
  }
  let images = product.images;
  if (typeof images === "string") {
    try { images = JSON.parse(images); } catch { images = []; }
  }
  return Array.isArray(images) ? images : [];
}

export async function listProducts({ search, categoryId, page = 1 } = {}) {
  const where = {
    ...(search ? { name: { contains: search } } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true, media: { orderBy: { displayOrder: "asc" } }, storeInventory: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  products.forEach((p) => {
    p.images = resolveImages(p);
  });

  return { products, totalCount, totalPages: Math.ceil(totalCount / PAGE_SIZE) || 1, pageSize: PAGE_SIZE };
}

export async function getProductById(id) {
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true, media: { orderBy: { displayOrder: "asc" } }, storeInventory: true },
  });
  if (product) {
    product.images = resolveImages(product);
  }
  return product;
}

export async function createProduct(data) {
  const { images, videoUrl, ...rest } = data;
  return db.$transaction(async (tx) => {
    const activeStores = await tx.store.findMany({ where: { status: "ACTIVE" }, select: { id: true } });

    const product = await tx.product.create({
      data: {
        ...rest,
        images: images || [],
        // New products default to available at every active store, with
        // zero stock until a Store Admin adjusts it — without this a new
        // product would have no StoreInventory rows anywhere and would
        // never show up in per-store stock/review scoping.
        availableAtStores: { connect: activeStores.map((s) => ({ id: s.id })) },
      },
    });

    if (activeStores.length > 0) {
      await tx.storeInventory.createMany({
        data: activeStores.map((s) => ({ storeId: s.id, productId: product.id, stock: 0 })),
      });
    }

    if (images && images.length > 0) {
      await tx.productMedia.createMany({
        data: images.map((url, idx) => ({
          productId: product.id,
          type: "IMAGE",
          url,
          displayOrder: idx,
          isPrimary: idx === 0,
        })),
      });
    }

    if (videoUrl) {
      await tx.productMedia.create({
        data: {
          productId: product.id,
          type: "VIDEO",
          url: videoUrl,
          displayOrder: images ? images.length : 1,
          isPrimary: false,
        },
      });
    }

    return product;
  });
}

export async function updateProduct(id, data) {
  const { images, videoUrl, ...rest } = data;
  return db.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        ...rest,
        images: images || [],
      },
    });

    await tx.productMedia.deleteMany({ where: { productId: id } });

    if (images && images.length > 0) {
      await tx.productMedia.createMany({
        data: images.map((url, idx) => ({
          productId: id,
          type: "IMAGE",
          url,
          displayOrder: idx,
          isPrimary: idx === 0,
        })),
      });
    }

    if (videoUrl) {
      await tx.productMedia.create({
        data: {
          productId: id,
          type: "VIDEO",
          url: videoUrl,
          displayOrder: images ? images.length : 1,
          isPrimary: false,
        },
      });
    }

    return product;
  });
}

export async function deleteProduct(id) {
  // A plain db.product.delete() always failed with a foreign key
  // constraint (P2003): every product has StoreInventory rows (created
  // automatically for every active store on createProduct), and Prisma
  // has no cascade configured for that relation — so deletion was
  // completely broken for every product, silently, since the confirm
  // dialog doesn't surface the thrown error.
  const orderCount = await db.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    // Hard-deleting would corrupt real order history (OrderItem rows
    // pointing at a product that no longer exists) — refuse instead of
    // silently breaking past orders. There's no "hide/archive" flag on
    // Product yet; for now the admin's options are to edit stock to 0
    // or remove it from its category, not delete it outright.
    throw new Error(
      "This product has order history and can't be deleted — it would break past orders' records. Set its stock to 0 instead to stop new sales."
    );
  }

  return db.$transaction(async (tx) => {
    await tx.storeInventory.deleteMany({ where: { productId: id } });
    await tx.wishlist.deleteMany({ where: { productId: id } });
    await tx.review.deleteMany({ where: { productId: id } });
    return tx.product.delete({ where: { id } });
  });
}

export async function updateStock(id, stock) {
  return db.product.update({ where: { id }, data: { stock } });
}
