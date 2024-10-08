// "use server";

// import { db } from "@/db";
// import { Product } from "@prisma/client";
// import axios from "axios";

// export const addProductsToDb = async (products?: Product[]) => {
//   try {
//     const fetchedProducts = products;

//     if (!fetchedProducts || fetchedProducts.length === 0) {
//       console.error("No products found in the API response.");
//       return;
//     }

//     // Step 2: Extract unique categories from the fetched products
//     const categories = fetchedProducts
//       .map((product: any) => product.category)
//       .filter(
//         (category: any, index: any, self: any) =>
//           self.indexOf(category) === index,
//       );

//     // Step 3: Insert categories into the Category table
//     const categoryEntries = await Promise.all(
//       categories.map(async (categoryName: string) => {
//         return db.category.upsert({
//           where: { name: categoryName },
//           update: {},
//           create: { name: categoryName },
//         });
//       }),
//     );

//     // Step 4: Insert products into the Product table and establish relationships
//     for (const product of fetchedProducts) {
//       const { id, category, ...productDataWithoutId } = product; // Exclude the `id` and `category` fields

//       // Create the product entry in the Product table
//       const productEntry = await db.product.create({
//         data: {
//           ...productDataWithoutId,
//         },
//       });

//       // Find the corresponding category entry
//       const categoryEntry = categoryEntries.find((c) => c.name === category);

//       // Establish the relationship in the ProductCategory table
//       if (productEntry && categoryEntry) {
//         await db.productCategory.create({
//           data: {
//             productId: productEntry.id,
//             categoryId: categoryEntry.id,
//           },
//         });
//       }
//     }

//     console.log(
//       "Products and their categories have been successfully added to the database.",
//     );
//   } catch (error) {
//     console.error("Error adding products to the database:", error);
//   }
// };
