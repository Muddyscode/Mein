import { z } from "zod";

const tagNames = z.array(z.string().trim().min(1).max(40)).max(20).optional();

const base = {
  title: z.string().trim().max(120).optional(),
  tagNames,
  threadId: z.string().min(1).optional(),
};

export const ingestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.enum(["paste", "markdown", "note"]),
    content: z.string().min(1, "Content is required."),
    url: z.string().url().optional(),
    ...base,
  }),
  z.object({
    type: z.literal("url"),
    url: z.string().url("Enter a valid http(s) URL."),
    content: z.string().optional(),
    ...base,
  }),
]);
