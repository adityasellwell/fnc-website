import { db } from "@/lib/db";

export async function listPages() {
  return db.page.findMany({ orderBy: { slug: "asc" } });
}

export async function getPageBySlug(slug) {
  try {
    return await db.page.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function upsertPage({ slug, title, content }) {
  return db.page.upsert({
    where: { slug },
    update: { title, content },
    create: { slug, title, content },
  });
}

export async function deletePage(id) {
  return db.page.delete({ where: { id } });
}
