import * as z from "zod";

/**
 * Profile update payload. All fields are optional; at least one must
 * be provided. The target user is always the session user.
 */
export const UpdateUserSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }).optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    gender: z.enum(["MALE", "FEMALE"]).nullish(),
    phone: z
      .string()
      .min(10, { message: "Minimum 10 characters required" })
      .max(15, { message: "Maximum 15 characters allowed" })
      .regex(/^[0-9+\-\s()]*$/, { message: "Invalid phone number" })
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
  });
