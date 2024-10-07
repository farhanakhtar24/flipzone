import axios from "axios";
import { loginWithCreds } from "./auth.action";
import { SignUpSchema } from "@/schemas/auth";
import { z } from "zod";
export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid credentials!" };
  }

  const { email, password, name } = validatedFields.data;
  try {
    await axios.post("/api/register", {
      name,
      email,
      password,
    });

    await loginWithCreds(values);
  } catch (error) {
    console.log(error);
  }
};
