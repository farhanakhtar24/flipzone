"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import {
  requireUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/auth-guard";
import { AddressIdSchema, AddressSchema } from "@/schemas/address";
import { Address } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const getUserAddresses = async (): Promise<ApiResponse<Address[]>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  try {
    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return {
      statusCode: 200,
      success: true,
      message: "Addresses fetched successfully.",
      data: addresses,
    };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return serverErrorResponse("Failed to fetch addresses.");
  }
};

export const addAddress = async (
  values: unknown,
): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const validated = AddressSchema.safeParse(values);
  if (!validated.success) {
    return { statusCode: 400, success: false, message: "Invalid address data." };
  }

  try {
    await db.$transaction(async (tx) => {
      if (validated.data.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id },
          data: { isDefault: false },
        });
      }

      const existing = await tx.address.count({
        where: { userId: session.user.id },
      });

      await tx.address.create({
        data: {
          ...validated.data,
          line2: validated.data.line2 || null,
          phone: validated.data.phone || null,
          isDefault: validated.data.isDefault ?? existing === 0,
          userId: session.user.id,
        },
      });
    });

    revalidatePath("/", "layout");
    return { statusCode: 201, success: true, message: "Address added." };
  } catch (error) {
    console.error("Error adding address:", error);
    return serverErrorResponse("Failed to add address.");
  }
};

export const updateAddress = async (
  addressId: string,
  values: unknown,
): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const validated = AddressSchema.safeParse(values);
  if (!validated.success) {
    return { statusCode: 400, success: false, message: "Invalid address data." };
  }

  try {
    const address = await db.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });
    if (!address) {
      return { statusCode: 404, success: false, message: "Address not found." };
    }

    await db.$transaction(async (tx) => {
      if (validated.data.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id },
          data: { isDefault: false },
        });
      }

      await tx.address.update({
        where: { id: addressId },
        data: {
          ...validated.data,
          line2: validated.data.line2 || null,
          phone: validated.data.phone || null,
          isDefault: validated.data.isDefault ?? address.isDefault,
        },
      });
    });

    revalidatePath("/", "layout");
    return { statusCode: 200, success: true, message: "Address updated." };
  } catch (error) {
    console.error("Error updating address:", error);
    return serverErrorResponse("Failed to update address.");
  }
};

export const deleteAddress = async (
  values: unknown,
): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const validated = AddressIdSchema.safeParse(values);
  if (!validated.success) {
    return { statusCode: 400, success: false, message: "Invalid address." };
  }

  try {
    const result = await db.address.deleteMany({
      where: { id: validated.data.addressId, userId: session.user.id },
    });

    if (result.count === 0) {
      return { statusCode: 404, success: false, message: "Address not found." };
    }

    revalidatePath("/", "layout");
    return { statusCode: 200, success: true, message: "Address deleted." };
  } catch (error) {
    console.error("Error deleting address:", error);
    return serverErrorResponse("Failed to delete address.");
  }
};
