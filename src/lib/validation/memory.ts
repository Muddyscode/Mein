import { z } from "zod";

export const listMemoriesQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  threadId: z.string().optional(),
  status: z.enum(["active", "archived", "all"]).optional(),
  limit: z.string().optional(),
  cursor: z.string().optional(),
});

export const patchMemorySchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    body: z.string().min(1).optional(),
    status: z.enum(["active", "archived"]).optional(),
    tagNames: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });
