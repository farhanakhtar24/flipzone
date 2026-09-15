import { db } from "@/db";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let products: { id: string; updatedAt: Date }[] = [];
  try {
    products = await db.product.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  } catch {
    // DB unavailable at build/prerender time — emit static routes only.
  }

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "daily", priority: 0.7 },
    ...products.map((p) => ({
      url: `${base}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
