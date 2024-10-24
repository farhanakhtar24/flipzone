"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { getUserByEmail } from "./user.action";
import * as z from "zod";
import { LoginSchema, SignUpSchema } from "@/schemas/auth";
import { API_ROUTES, PAGE_ROUTES } from "@/routes";
import { apiClient } from "@/util/axios";

export const login = async (provider: string) => {
  await signIn(provider, {
    redirectTo: "/",
  });
  revalidatePath("/", "layout");
};

export const logout = async () => {
  await signOut({
    redirect: true,
    redirectTo: PAGE_ROUTES.AUTH,
  });

  revalidatePath("/", "layout");
};

export const loginWithCreds = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "User does not exist!" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error: unknown | AuthError) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CallbackRouteError":
          return { error: "Invalid password!" };
        default:
          return { error: error.message };
      }
    }

    throw error;
  }

  revalidatePath("/", "layout");
};

export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }

  const { email, password, name } = validatedFields.data;
  try {
    await apiClient.post(API_ROUTES.REGISTER, {
      name,
      email,
      password,
    });

    await loginWithCreds({
      email,
      password,
    });
  } catch (error: unknown | AuthError) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }

    throw error;
  }
};
