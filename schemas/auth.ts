import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const SignUpSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email({
    message: "Email is required",
  }),
  password: z
    .string()
    .min(8, { message: "Minimum 8 characters required" })
    .max(72, { message: "Password cannot exceed 72 characters" })
    .regex(/[a-zA-Z]/, { message: "Password must contain a letter" })
    .regex(/[0-9]/, { message: "Password must contain a number" }),
});
