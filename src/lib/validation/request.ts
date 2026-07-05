import { z } from "zod";

export const createRequestSchema = z.object({
  text: z.string().trim().min(1, "Bitte beschreibe, was du brauchst").max(500),
  photoUrl: z.string().url().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
