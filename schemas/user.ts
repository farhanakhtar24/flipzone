import * as z from "zod";

export const UserSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Minimum 6 characters required" }),
  gender: z.enum(["MALE", "FEMALE"]),
  phone: z.string().min(10, { message: "Minimum 10 characters required" }),
});
