"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { requireUser, unauthorizedResponse } from "@/lib/auth-guard";

export type SearchSuggestion = {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  category: string | null;
};

/**
 * Typeahead suggestions for the navbar search. Title-first, then description
 * fallback; tiny payload (5 fields × 6 rows) and a short per-query cap.
 */
export const getSearchSuggestions = async (
  query: string,
): Promise<ApiResponse<SearchSuggestion[]>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const q = query.trim();
  if (q.length < 2) {
    return {
      statusCode: 200,
      success: true,
      message: "Query too short.",
      data: [],
    };
  }

  try {
    const rows = await db.product.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { rating: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        thumbnail: true,
        price: true,
        categories: {
          take: 1,
          select: { category: { select: { name: true } } },
        },
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Suggestions fetched.",
      data: rows.map((p) => ({
        id: p.id,
        title: p.title,
        thumbnail: p.thumbnail,
        price: p.price,
        category: p.categories[0]?.category.name ?? null,
      })),
    };
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to fetch suggestions.",
      data: [],
    };
  }
};
