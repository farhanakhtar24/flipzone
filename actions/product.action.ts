import { db } from "@/db";

export const getAllProducts = async () => {
  try {
    const products = await db.product.findMany();
    return products;
  } catch (error) {
    console.error(error);
    return null;
  }
};
