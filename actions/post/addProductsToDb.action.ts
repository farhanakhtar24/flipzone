// "use server";

// import { db } from "@/db";

// export const addProductsToDb = async () => {
//   try {
//     const response = await fetch("https://dummyjson.com/products?limit=1000");

//     if (!response.ok) {
//       throw new Error("Failed to fetch products");
//     }

//     const fetchedProducts = (await response.json())?.products;

//     // Step 2: Extract unique categories from the fetched products
//     const categories = fetchedProducts
//       .map((product) => product.category)
//       .filter((category, index, self) => self.indexOf(category) === index);

//     // Step 3: Insert categories into the Category table
//     const categoryEntries = await Promise.all(
//       categories.map(async (categoryName) => {
//         return db.category.upsert({
//           where: { name: categoryName },
//           update: {},
//           create: { name: categoryName },
//         });
//       }),
//     );

//     // Step 4: Insert products into the Product table and establish relationships
//     for (const product of fetchedProducts) {
//       const { id, reviews, category, ...productDataWithoutId } = product; // Exclude the `id`, `category`, and `reviews` fields

//       // Calculate the average rating if reviews exist
//       let rating = 0; // Default rating to 0 if there are no reviews
//       if (reviews && reviews.length > 0) {
//         const totalRating = reviews.reduce(
//           (sum, review) => sum + review.rating,
//           0,
//         );
//         rating = totalRating / reviews.length; // This will result in a float
//       }

//       // Create the product entry in the Product table with the calculated rating
//       const productEntry = await db.product.create({
//         data: {
//           ...productDataWithoutId,
//           rating: parseFloat(rating.toFixed(2)), // Store rating as float with 2 decimal precision
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

//       // Step 5: Insert reviews into the Review table and establish relationships
//       if (reviews && reviews.length > 0) {
//         await Promise.all(
//           reviews.map(async (review) => {
//             // Create the review entry
//             const reviewEntry = await db.review.create({
//               data: {
//                 rating: review.rating,
//                 comment: review.comment,
//                 date: new Date(review.date), // Ensure date is a Date object
//                 reviewerName: review.reviewerName || "Anonymous", // Default to "Anonymous" if no name provided
//                 reviewerEmail: review.reviewerEmail || "", // Default to empty string if no email provided
//                 productId: productEntry.id, // Link review to the product
//               },
//             });
//             return reviewEntry;
//           }),
//         );
//       }
//     }

//     console.log(
//       "Products, categories, and reviews have been successfully added to the database.",
//     );
//   } catch (error) {
//     console.error("Error adding products to the database:", error);
//   }
// };
