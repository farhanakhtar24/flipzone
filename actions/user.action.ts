"use server";

import { db } from "@/db";
import {
  requireUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/auth-guard";
import { UpdateUserSchema } from "@/schemas/user";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateUser = async (
  values: z.infer<typeof UpdateUserSchema>,
) => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const validatedFields = UpdateUserSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid profile data.",
      error: validatedFields.error.message,
    };
  }

  const { name, email, gender, phone } = validatedFields.data;

  try {
    if (email) {
      const emailOwner = await db.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true },
      });

      if (emailOwner && emailOwner.id !== session.user.id) {
        return {
          statusCode: 409,
          success: false,
          message: "This email is already in use by another account.",
        };
      }
    }

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email: email.toLowerCase() }),
        ...(gender !== undefined && { gender }),
        ...(phone !== undefined && { phone }),
      },
    });

    revalidatePath("/", "layout");

    return {
      statusCode: 200,
      success: true,
      message: "User updated successfully.",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return serverErrorResponse(
      "Failed to update user. Please try again later.",
    );
  }
};
