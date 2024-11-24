"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";

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

export const updateUser = async ({
  name,
  email,
  gender,
  phone,
  userId,
}: {
  name?: string;
  email?: string;
  gender?: "MALE" | "FEMALE" | null;
  phone?: string;
  userId: string;
}) => {
  try {
    const user = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        email,
        gender,
        phone,
      },
    });

    if (!user) {
      return {
        statusCode: 404,
        success: false,
        message: "User not found.",
      };
    }

    revalidatePath("/", "layout");

    return {
      statusCode: 200,
      success: true,
      message: "User updated successfully.",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to update user. Please try again later.",
      error: errorMessage,
    };
  }
};
