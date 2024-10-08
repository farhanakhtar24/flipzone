import axios from "axios";
import { loginWithCreds } from "./auth.action";
import { SignUpSchema } from "@/schemas/auth";
import { z } from "zod";
import { AuthError } from "next-auth";
import { API_ROUTES } from "@/routes";
export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }

  const { email, password, name } = validatedFields.data;
  try {
    await axios.post(API_ROUTES.REGISTER, {
      name,
      email,
      password,
    });

    await loginWithCreds(values);
  } catch (error: unknown | AuthError) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }

    throw error;
  }
};
