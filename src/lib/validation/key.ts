import { z } from "zod";

export const createKeySchema = z.object({
  name: z.string().trim().min(1).max(80),
});
