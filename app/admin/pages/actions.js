"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { upsertPage, deletePage } from "@/services/pages";
import { db } from "@/lib/db";

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base) {
  let slug = base || "page";
  let n = 2;
  while (await db.page.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function savePageAction(formData) {
  await requireFullAdminUser();
  // Present (as a hidden field) when editing an existing page — PageFormModal
  // submits it unchanged so the upsert-by-slug hits the same row. Absent
  // when creating a new page, in which case it's generated from the Title.
  const existingSlug = formData.get("slug")?.toString().trim();
  const slug = existingSlug || (await uniqueSlug(slugify(formData.get("title").toString().trim())));
  await upsertPage({
    slug,
    title: formData.get("title").toString().trim(),
    content: formData.get("content").toString(),
  });
  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`);
}

export async function deletePageAction(id) {
  await requireFullAdminUser();
  await deletePage(id);
  revalidatePath("/admin/pages");
}
