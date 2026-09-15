"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { rateLimit } from "@/lib/rate-limit";
import { AuthError } from "next-auth";
import { getUserByEmail } from "./user.action";
import * as z from "zod";
import { LoginSchema, SignUpSchema } from "@/schemas/auth";
import { PAGE_ROUTES } from "@/routes";
import { saltAndHashPassword } from "@/util/helper";

export const login = async (provider: string) => {
  // signIn throws a NEXT_REDIRECT on success — no code after this runs.
  await signIn(provider, {
    redirectTo: "/",
  });
};

export const logout = async () => {
  await signOut({
    redirectTo: PAGE_ROUTES.AUTH,
  });
};

export const loginWithCreds = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }

  const { email, password } = validatedFields.data;

  const { success } = rateLimit({
    key: `login:${email.toLowerCase()}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (!success) {
    return { error: "Too many attempts. Please try again in a minute." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error: unknown | AuthError) {
    if (error instanceof AuthError) {
      // Unified failure message to prevent user enumeration
      return { error: "Invalid credentials!" };
    }

    throw error;
  }
};

export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }

  const { email, password, name } = validatedFields.data;
  const normalizedEmail = email.toLowerCase();

  const { success } = rateLimit({
    key: `signup:${normalizedEmail}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (!success) {
    return { error: "Too many attempts. Please try again in a minute." };
  }

  try {
    const existingUser = await getUserByEmail(normalizedEmail);

    if (existingUser) {
      return { error: "Unable to create account with these details." };
    }

    const hashedPassword = await saltAndHashPassword(password);

    await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    await loginWithCreds({
      email: normalizedEmail,
      password,
    });
  } catch (error: unknown | AuthError) {
    if (error instanceof AuthError) {
      return { error: "Something went wrong during sign up. Please try again." };
    }

    throw error;
  }
};
