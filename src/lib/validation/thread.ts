import { z } from "zod";

export const createThreadSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(400).optional(),
});

export const patchThreadSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(400).nullable().optional(),
});

export const attachMemorySchema = z.object({
  memoryId: z.string().min(1),
});
