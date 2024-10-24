import { Cart, CartItem, Product, Review } from "@prisma/client";

export interface ApiResponse<T> {
  statusCode: number; // HTTP status code (e.g., 200, 404, 500)
  success: boolean; // Indicates if the operation was successful
  message: string; // Descriptive message about the response
  data?: T; // Generic type to hold response data (if any)
  error?: string; // Error message (if any)
}

export interface IproductWithCartStatus extends Product {
  isInCart: boolean;
  isWishlisted: boolean;
  isCompared?: boolean;
  isOrdered?: boolean;
  reviews?: Review[];
}

// interfaces/cartInterface.ts

// Interface for Cart Item with Product details
export interface IcartItemWithProduct extends CartItem {
  product: Product;
}

// Interface for Cart with Items
export interface IcartWithItems extends Cart {
  items: IcartItemWithProduct[];
}

export interface IcartSummary {
  cart: IcartWithItems;
  totalMRP: number;
  totalDiscount: number;
  finalPrice: number;
  totalQuantity: number;
}
