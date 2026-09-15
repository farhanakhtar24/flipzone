import { z } from "zod";

export const AddressSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
  line1: z.string().min(1, "Address is required").max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(2).max(56).default("US"),
  phone: z.string().min(10).max(20).optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export const AddressIdSchema = z.object({
  addressId: z.string().min(1),
});
