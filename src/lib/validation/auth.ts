import { z } from "zod";

export const setupSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  email: z.string().trim().email("Enter a valid email.").toLowerCase(),
  password: z.string().min(10, "Password must be at least 10 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email.").toLowerCase(),
  password: z.string().min(1, "Password is required."),
});
