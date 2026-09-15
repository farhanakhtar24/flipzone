import { auth } from "@/auth";
import { ApiResponse } from "@/interfaces/actionInterface";
import type { Session } from "next-auth";

/**
 * Centralized authorization guard for server actions.
 * Returns the authenticated user's session, or an ApiResponse-shaped 401.
 * Server actions should early-return the guard result when it is not null.
 */
export const requireUser = async (): Promise<Session | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
};

export const requireAdmin = async (): Promise<Session | null> => {
  const session = await requireUser();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
};

export const unauthorizedResponse = <T = null>(): ApiResponse<T> => ({
  statusCode: 401,
  success: false,
  message: "You must be signed in to perform this action.",
});

export const forbiddenResponse = <T = null>(): ApiResponse<T> => ({
  statusCode: 403,
  success: false,
  message: "You are not authorized to perform this action.",
});

/**
 * Helper to build a consistent 500 response without leaking internals.
 */
export const serverErrorResponse = <T = null>(
  message = "Something went wrong. Please try again later.",
): ApiResponse<T> => ({
  statusCode: 500,
  success: false,
  message,
});
