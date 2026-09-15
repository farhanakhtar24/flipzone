import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth", "/products", "/categories"],
        disallow: [
          "/cart",
          "/orders",
          "/profile",
          "/wishlist",
          "/compare",
          "/checkout",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
